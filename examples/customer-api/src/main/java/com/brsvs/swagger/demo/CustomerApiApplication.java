package com.brsvs.swagger.demo;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.media.Schema;

@SpringBootApplication
@io.swagger.v3.oas.annotations.OpenAPIDefinition(info = @io.swagger.v3.oas.annotations.info.Info(title = "Customer Platform", version = "0.3.3", description = "Local API Studio playground"))
@SecurityScheme(name = "demoBearer", type = SecuritySchemeType.HTTP, scheme = "bearer", description = "Local demo token: demo-token")
public class CustomerApiApplication {
    public static void main(String[] args) { SpringApplication.run(CustomerApiApplication.class, args); }

    @RestController
    @RequestMapping("/api")
    static class CustomerController {
        private final Map<Long, Customer> customers = new ConcurrentHashMap<>();
        private final AtomicLong sequence = new AtomicLong(3);

        CustomerController() {
            customers.put(1L, new Customer(1, "Ada Demir", "ada@example.test", "ACTIVE"));
            customers.put(2L, new Customer(2, "Deniz Kaya", "deniz@example.test", "ACTIVE"));
            customers.put(3L, new Customer(3, "Ece Yilmaz", "ece@example.test", "INACTIVE"));
        }

        @GetMapping("/customers") @Operation(summary = "List customers", tags = "Customers")
        List<Customer> customers(@RequestParam(required = false) String status) {
            return customers.values().stream().filter(c -> status == null || status.isBlank() || c.status().equals(status))
                    .sorted(java.util.Comparator.comparingLong(Customer::id)).toList();
        }

        @GetMapping("/customers/{id}") @Operation(summary = "Find customer by ID", tags = "Customers")
        Customer customer(@PathVariable long id) {
            Customer customer = customers.get(id);
            if (customer == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
            return customer;
        }

        @PostMapping("/customers") @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Create customer", tags = "Customers")
        Customer create(@org.springframework.web.bind.annotation.RequestBody NewCustomer input) {
            if (input.name() == null || input.name().isBlank() || input.email() == null || !input.email().contains("@")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name and email are required");
            }
            long id = sequence.incrementAndGet();
            Customer customer = new Customer(id, input.name(), input.email(), "ACTIVE");
            customers.put(id, customer); return customer;
        }

        @GetMapping("/orders") @Operation(summary = "List orders", tags = "Orders")
        List<Map<String, Object>> orders() {
            return List.of(Map.of("id", "ORD-1001", "customerId", 1, "amount", 249.90, "currency", "TRY", "status", "COMPLETED"));
        }

        @GetMapping("/health") @Operation(summary = "Service health", tags = "System")
        Map<String, Object> health() { return Map.of("status", "UP", "service", "customer-demo", "timestamp", Instant.now().toString()); }

        @GetMapping("/demo-response") @Operation(summary = "Preview response feedback", tags = "System")
        org.springframework.http.ResponseEntity<Map<String, Object>> demoResponse(
                @RequestParam(defaultValue = "200") int status,
                @RequestParam(defaultValue = "0") int delayMillis) throws InterruptedException {
            if (status < 200 || status > 599 || delayMillis < 0 || delayMillis > 5000) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status: 200..599; delayMillis: 0..5000");
            }
            Thread.sleep(delayMillis);
            return org.springframework.http.ResponseEntity.status(status).body(Map.of("status", status, "delayMillis", delayMillis, "message", "Theme response preview"));
        }

        @GetMapping("/request-context") @Operation(summary = "Verify shared auth and interceptors", tags = "System")
        @SecurityRequirement(name = "demoBearer")
        Map<String, Object> requestContext(@RequestHeader(value = "Authorization", required = false) String authorization,
                                         @RequestHeader(value = "X-Demo-Client", defaultValue = "missing") String client) {
            if (!"Bearer demo-token".equals(authorization)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Use demo-token in Swagger Authorize");
            return Map.of("authenticated", true, "client", client);
        }

        @PostMapping(value = "/uploads", consumes = "multipart/form-data")
        @Operation(summary = "Upload a file", tags = "Files")
        Map<String, Object> upload(@RequestPart("file") MultipartFile file,
                                   @RequestParam(defaultValue = "Demo upload") String description) {
            return Map.of("filename", file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename(), "size", file.getSize(), "description", description);
        }

        @PostMapping(value = "/feedback", consumes = "application/x-www-form-urlencoded")
        @Operation(summary = "Submit URL-encoded form", tags = "Forms")
        Map<String, Object> feedback(@RequestParam String message, @RequestParam(defaultValue = "5") int rating) {
            return Map.of("message", message, "rating", rating, "received", true);
        }
    }

    record Customer(long id, String name, String email, String status) {}
    record NewCustomer(@Schema(description = "Customer display name", example = "Selin Acar", requiredMode = Schema.RequiredMode.REQUIRED) String name,
                       @Schema(description = "Contact email", example = "selin@example.test", requiredMode = Schema.RequiredMode.REQUIRED) String email) {}
}
