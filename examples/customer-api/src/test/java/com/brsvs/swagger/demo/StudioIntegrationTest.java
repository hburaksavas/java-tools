package com.brsvs.swagger.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockMultipartFile;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class StudioIntegrationTest {
    @Autowired MockMvc mvc;

    @Test void swaggerIndexIncludesStudioAndKeepsSwagger() throws Exception {
        mvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk())
                .andExpect(content().string(containsString("swagger-initializer.js")))
                .andExpect(content().string(containsString("./studio/bootstrap.js")))
                .andExpect(content().string(containsString("./studio/core.js")));
        mvc.perform(get("/swagger-ui/studio/bootstrap.js")).andExpect(status().isOk())
                .andExpect(content().string(containsString("waitForSwagger")));
        mvc.perform(get("/swagger-ui/studio/studio.js")).andExpect(status().isOk())
                .andExpect(content().string(containsString("localStorage")));
        mvc.perform(get("/swagger-ui/studio/studio.css")).andExpect(status().isOk());
        mvc.perform(get("/swagger-ui/studio/theme.js")).andExpect(status().isOk());
        mvc.perform(get("/swagger-ui/studio/config.json")).andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("BRsvs API Studio"))
                .andExpect(jsonPath("$.welcomeTitle").value("Your API starts here."));
        mvc.perform(get("/swagger-ui/swagger-initializer.js")).andExpect(status().isOk())
                .andExpect(content().string(containsString("/v3/api-docs/swagger-config")))
                .andExpect(content().string(containsString("X-Demo-Client")))
                .andExpect(content().string(not(containsString("./studio/bootstrap.js"))));
    }

    @Test void realOpenApiAndRequestsWork() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/customers']").exists());
        mvc.perform(get("/v3/api-docs")).andExpect(jsonPath("$.paths['/swagger-ui/studio/config.json']").doesNotExist());
        mvc.perform(get("/api/customers/1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ada Demir"));
        mvc.perform(get("/api/customers/999")).andExpect(status().isNotFound());
    }

    @Test void authFileAndFormExamplesAreRunnable() throws Exception {
        mvc.perform(get("/api/request-context")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/request-context").header("Authorization", "Bearer demo-token").header("X-Demo-Client", "swagger-shared"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.authenticated").value(true)).andExpect(jsonPath("$.client").value("swagger-shared"));
        mvc.perform(multipart("/api/uploads").file(new MockMultipartFile("file", "hello.txt", "text/plain", "hello".getBytes())).param("description", "Example"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.size").value(5)).andExpect(jsonPath("$.filename").value("hello.txt"));
        mvc.perform(post("/api/feedback").contentType("application/x-www-form-urlencoded").param("message", "Works").param("rating", "5"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.received").value(true));
    }
}
