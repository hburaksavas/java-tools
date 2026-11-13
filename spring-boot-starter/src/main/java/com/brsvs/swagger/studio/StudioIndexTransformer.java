package com.brsvs.swagger.studio;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import jakarta.servlet.http.HttpServletRequest;
import org.springdoc.webmvc.ui.SwaggerIndexTransformer;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.resource.ResourceTransformerChain;
import org.springframework.web.servlet.resource.TransformedResource;

final class StudioIndexTransformer implements SwaggerIndexTransformer {
    private static final String SCRIPTS = """
            <script src="./studio/core.js" defer></script>
            <script src="./studio/swagger-bridge.js" defer></script>
            <script src="./studio/motion.js" defer></script>
            <script src="./studio/theme.js" defer></script>
            <script src="./studio/playful.js" defer></script>
            <script src="./studio/response-effects.js" defer></script>
            <script src="./studio/studio.js" defer></script>
            <script src="./studio/bootstrap.js" defer></script>
            """;
    private final SwaggerIndexTransformer delegate;

    StudioIndexTransformer(SwaggerIndexTransformer delegate) {
        this.delegate = delegate;
    }

    @Override
    public Resource transform(HttpServletRequest request, Resource resource, ResourceTransformerChain chain) throws IOException {
        Resource transformed = delegate.transform(request, resource, chain);
        if (!"index.html".equals(transformed.getFilename())) return transformed;
        String html;
        try (var input = transformed.getInputStream()) {
            html = new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
        if (!html.contains("./studio/bootstrap.js")) html = html.replace("</body>", SCRIPTS + "</body>");
        return new TransformedResource(transformed, html.getBytes(StandardCharsets.UTF_8));
    }
}
