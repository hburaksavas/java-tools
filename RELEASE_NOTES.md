# Swagger UI Studio 0.3.0

23 theme presets plus System, shared by Studio and standard Swagger, with themed request/response feedback.

- Implements all saved theme concepts: Rainy Night, Aurora, Sakura, Ember, Ocean, Cyberpunk, Terminal, Blueprint, Eclipse, Paper & Ink, Observatory, Autumn, Monsoon, Circuit, Sandstorm, Bioluminescence, Infrared and Zen, alongside the existing presets.
- Adds waiting, success, warning, failure and cancellation feedback around response edges. JSON text and panel position remain unchanged.
- Instruments standard Swagger through a plugin that preserves existing plugins, authorization, interceptors and action return values. Studio uses the same effect engine.
- Respects reduced-motion preferences; limits simultaneous response layers and removes completed effects.
- Adds a local `/api/demo-response` endpoint with configurable status and bounded delay to preview the full lifecycle.
- Aligns the Studio action label with Swagger's **Execute** and uses **API Studio** as the default/demo heading.

See THEMES.md for configuration values and the complete theme/response mapping.

Assets: executable customer demo JAR (Java 17, port 8087), starter JAR, sources JAR, Maven-layout repository ZIP and SHA256 checksums. Maven Central publication is not included.

Compatibility: Java 17, Spring Boot 3.4.13, Springdoc 2.8.14 / Spring MVC. Custom Swagger initializers must load response-effects.js before constructing SwaggerUIBundle. Strict nonce-only CSP needs application-specific style integration. Existing OpenAPI limitations remain documented in README.md.
