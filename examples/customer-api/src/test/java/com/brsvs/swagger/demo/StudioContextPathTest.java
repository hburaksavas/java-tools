package com.brsvs.swagger.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"server.servlet.context-path=/sample", "springdoc.api-docs.path=/openapi"})
@AutoConfigureMockMvc
class StudioContextPathTest {
    @Autowired MockMvc mvc;
    @Test void assetsAndConfigurationFollowContextPath() throws Exception {
        mvc.perform(get("/sample/swagger-ui/index.html").contextPath("/sample")).andExpect(status().isOk())
                .andExpect(content().string(containsString("./studio/bootstrap.js")));
        mvc.perform(get("/sample/swagger-ui/studio/core.js").contextPath("/sample")).andExpect(status().isOk());
        mvc.perform(get("/sample/swagger-ui/studio/config.json").contextPath("/sample")).andExpect(status().isOk());
        mvc.perform(get("/sample/openapi/swagger-config").contextPath("/sample")).andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("/sample/openapi"));
    }
}
