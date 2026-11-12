package com.brsvs.swagger.studio;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Hidden
final class StudioConfigController {
    private final StudioProperties properties;
    StudioConfigController(StudioProperties properties) { this.properties = properties; }
    @GetMapping(value = "/swagger-ui/studio/config.json", produces = "application/json")
    StudioProperties configuration() { return properties; }
}
