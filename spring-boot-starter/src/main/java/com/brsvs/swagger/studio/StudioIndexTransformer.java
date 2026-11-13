package com.brsvs.swagger.studio;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
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
            <script src="./studio/scenes.js" defer></script>
            <script src="./studio/json.js" defer></script>
            <script src="./studio/theme.js" defer></script>
            <script src="./studio/playful.js" defer></script>
            <script src="./studio/response-effects.js" defer></script>
            <script src="./studio/studio.js" defer></script>
            <script src="./studio/bootstrap.js" defer></script>
            """;
    private final SwaggerIndexTransformer delegate;
    private final String assetRevision;

    StudioIndexTransformer(SwaggerIndexTransformer delegate) {
        this.delegate = delegate;
        this.assetRevision = assetRevision();
    }

    private static String assetRevision() {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            for (String name : new String[] { "json.js", "core.js", "swagger-bridge.js", "motion.js", "scenes.js", "theme.js", "playful.js", "response-effects.js", "studio.js", "bootstrap.js", "studio.css", "effects.css" }) {
                try (var input = StudioIndexTransformer.class.getResourceAsStream("/META-INF/swagger-ui-studio/" + name)) {
                    if (input == null) throw new IllegalStateException("Missing Studio asset: " + name);
                    digest.update(input.readAllBytes());
                }
            }
            return HexFormat.of().formatHex(digest.digest(), 0, 8);
        } catch (IOException | NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Cannot fingerprint Studio assets", exception);
        }
    }

    @Override
    public Resource transform(HttpServletRequest request, Resource resource, ResourceTransformerChain chain) throws IOException {
        Resource transformed = delegate.transform(request, resource, chain);
        if (!"index.html".equals(transformed.getFilename())) return transformed;
        String html;
        try (var input = transformed.getInputStream()) {
            html = new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
        if (!html.contains("./studio/bootstrap.js")) html = html.replace("</body>", SCRIPTS.replace(".js\"", ".js?v=" + assetRevision + "\"") + "</body>");
        return new TransformedResource(transformed, html.getBytes(StandardCharsets.UTF_8));
    }
}
