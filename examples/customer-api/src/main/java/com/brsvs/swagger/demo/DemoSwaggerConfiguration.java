package com.brsvs.swagger.demo;

import java.nio.charset.StandardCharsets;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springdoc.core.properties.SwaggerUiOAuthProperties;
import org.springdoc.core.providers.ObjectMapperProvider;
import org.springdoc.webmvc.ui.SwaggerIndexPageTransformer;
import org.springdoc.webmvc.ui.SwaggerIndexTransformer;
import org.springdoc.webmvc.ui.SwaggerWelcomeCommon;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.resource.TransformedResource;

/** Sample application-owned hooks. Studio decorates this transformer instead of replacing it. */
@Configuration(proxyBeanMethods = false)
class DemoSwaggerConfiguration {
    @Bean
    SwaggerIndexTransformer demoSwaggerTransformer(SwaggerUiConfigProperties properties, SwaggerUiOAuthProperties oauth,
                                                  SwaggerWelcomeCommon welcome, ObjectMapperProvider mapper) {
        var delegate = new SwaggerIndexPageTransformer(properties, oauth, welcome, mapper);
        return (request, resource, chain) -> {
            var transformed = delegate.transform(request, resource, chain);
            if (!"swagger-initializer.js".equals(transformed.getFilename())) return transformed;
            String script;
            try (var input = transformed.getInputStream()) {
                script = new String(input.readAllBytes(), StandardCharsets.UTF_8);
            }
            script = script.replace("window.ui = SwaggerUIBundle({", """
                    window.ui = SwaggerUIBundle({
                      requestInterceptor: async (request) => {
                        request.headers['X-Demo-Client'] = 'swagger-shared';
                        return request;
                      },
                      responseInterceptor: (response) => {
                        response.headers['x-demo-response-interceptor'] = 'applied';
                        return response;
                      },
                    """);
            return new TransformedResource(transformed, script.getBytes(StandardCharsets.UTF_8));
        };
    }
}
