package com.brsvs.swagger.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "brsvs.swagger.studio.enabled=false")
@AutoConfigureMockMvc
class StudioDisabledTest {
    @Autowired MockMvc mvc;
    @Test void disablingStudioRestoresUnmodifiedSwaggerIndex() throws Exception {
        mvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk())
                .andExpect(content().string(containsString("swagger-initializer.js")))
                .andExpect(content().string(not(containsString("./studio/bootstrap.js"))));
        mvc.perform(get("/swagger-ui/studio/bootstrap.js")).andExpect(status().isNotFound());
    }
}
