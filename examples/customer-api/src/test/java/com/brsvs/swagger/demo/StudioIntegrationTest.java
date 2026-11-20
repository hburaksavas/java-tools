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

                .andExpect(content().string(matchesPattern("(?s).*studio/bootstrap\\.js\\?v=[a-f0-9]{16}.*")))

                .andExpect(content().string(containsString("./studio/core.js")))

                .andExpect(content().string(containsString("./studio/playful.js")))

                .andExpect(content().string(containsString("./studio/scenes.js")));

        mvc.perform(get("/swagger-ui/studio/bootstrap.js")).andExpect(status().isOk())

                .andExpect(content().string(containsString("waitForSwagger")));

        mvc.perform(get("/swagger-ui/studio/studio.js")).andExpect(status().isOk())

                .andExpect(content().string(containsString("localStorage")));

        mvc.perform(get("/swagger-ui/studio/studio.css")).andExpect(status().isOk());

        mvc.perform(get("/swagger-ui/studio/theme.js")).andExpect(status().isOk());

        mvc.perform(get("/swagger-ui/studio/json.js")).andExpect(status().isOk());

        mvc.perform(get("/swagger-ui/studio/scenes.js")).andExpect(status().isOk());

        mvc.perform(get("/swagger-ui/studio/playful.js")).andExpect(status().isOk());

        mvc.perform(get("/swagger-ui/studio/response-effects.js")).andExpect(status().isOk());

        mvc.perform(get("/swagger-ui/studio/effects.css")).andExpect(status().isOk());

        mvc.perform(get("/swagger-ui/studio/config.json")).andExpect(status().isOk())

                .andExpect(jsonPath("$.title").value("API Studio"))

                .andExpect(jsonPath("$.welcomeTitle").value("Your API starts here."));

        mvc.perform(get("/swagger-ui/swagger-initializer.js")).andExpect(status().isOk())

                .andExpect(content().string(containsString("/v3/api-docs/swagger-config")))

                .andExpect(content().string(containsString("X-Demo-Client")))

                .andExpect(content().string(not(containsString("./studio/bootstrap.js"))));

    }



    @Test void responsePreviewProducesSuccessWarningAndFailureWithoutChangingData() throws Exception {

        mvc.perform(get("/api/demo-response").param("status", "200")).andExpect(status().isOk());

        mvc.perform(get("/api/demo-response").param("status", "418")).andExpect(status().isIAmATeapot());

        mvc.perform(get("/api/demo-response").param("status", "404")).andExpect(status().isNotFound());

        mvc.perform(get("/api/demo-response").param("status", "503")).andExpect(status().isServiceUnavailable());

        mvc.perform(get("/api/demo-response").param("delayMillis", "16000")).andExpect(status().isBadRequest());

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

    @Test void stringListsBindFromGetAndPostQueryAndJsonBody() throws Exception {

        for (var request : java.util.List.of(get("/api/list-query"), post("/api/list-query"))) {

            mvc.perform(request.param("names", "Ali", "Ayşe", "a,b", "a&b"))

                    .andExpect(status().isOk()).andExpect(jsonPath("$", contains("Ali", "Ayşe", "a,b", "a&b")));

        }

        mvc.perform(post("/api/list-body").contentType("application/json")

                .content("{\"names\":[\"Ali\",\"Ayşe\",\"a,b\",\"a&b\"]}"))

                .andExpect(status().isOk()).andExpect(jsonPath("$", contains("Ali", "Ayşe", "a,b", "a&b")));

        mvc.perform(post("/api/list-body").contentType("application/json").content("{\"names\":[]}"))

                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));

    }


    @Test void tableScenariosExposeNestedRowsMultipleArraysEmptyAndError() throws Exception {
        mvc.perform(get("/api/table-page")).andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].profile.city").value("İstanbul"))
                .andExpect(jsonPath("$.content[0].tags", contains("vip", "new")))
                .andExpect(jsonPath("$.content[1].active").value(false))
                .andExpect(jsonPath("$.archived", hasSize(1)));
        mvc.perform(get("/api/table-page").param("empty", "true")).andExpect(jsonPath("$.content", hasSize(0)));
        mvc.perform(get("/api/table-scalar")).andExpect(jsonPath("$.message").value("No rows here"));
        mvc.perform(get("/api/table-error")).andExpect(status().isBadRequest()).andExpect(jsonPath("$[0].field").value("names"));
    }
    @Test void listScenariosCoverOmissionNumbersFormAndNestedJson() throws Exception {
        for (var request : java.util.List.of(get("/api/list-query"), post("/api/list-query"))) {
            mvc.perform(request.param("names", "Ayşe & a,b")).andExpect(status().isOk()).andExpect(jsonPath("$", contains("Ayşe & a,b")));
        }
        mvc.perform(get("/api/list-optional").param("names", "")).andExpect(jsonPath("$.names", contains("")));
        mvc.perform(post("/api/list-form").contentType("application/x-www-form-urlencoded").param("names", "Ayşe & a,b"))
                .andExpect(status().isOk()).andExpect(jsonPath("$", contains("Ayşe & a,b")));
        mvc.perform(get("/api/list-query")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/list-optional")).andExpect(jsonPath("$.present").value(false));
        mvc.perform(get("/api/list-optional").param("names", "", "Ayşe"))
                .andExpect(jsonPath("$.present").value(true)).andExpect(jsonPath("$.names", contains("", "Ayşe")));
        mvc.perform(get("/api/list-numbers").param("ids", "1", "-2", "0"))
                .andExpect(status().isOk()).andExpect(jsonPath("$", contains(1, -2, 0)));
        mvc.perform(get("/api/list-numbers").param("ids", "oops")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/list-form").contentType("application/x-www-form-urlencoded").param("names", "Ayşe", "a&b", "a,b", ""))
                .andExpect(status().isOk()).andExpect(jsonPath("$", contains("Ayşe", "a&b", "a,b", "")));
        mvc.perform(post("/api/list-nested").contentType("application/json")
                .content("{\"filter\":{\"names\":[\"Ayşe\",\"\",\"a&b\"]},\"ids\":[1,0,-2]}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.filter.names", contains("Ayşe", "", "a&b")))
                .andExpect(jsonPath("$.ids", contains(1, 0, -2)));
        mvc.perform(get("/v3/api-docs")).andExpect(jsonPath("$.paths['/api/list-numbers'].get.parameters[0].schema.type").value("array"))
                .andExpect(jsonPath("$.paths['/api/table-page']").exists())
                .andExpect(jsonPath("$.paths['/api/list-form'].post.requestBody.content['application/x-www-form-urlencoded'].encoding.names.explode").value(true));
    }
}
