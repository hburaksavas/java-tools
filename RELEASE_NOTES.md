# Swagger UI Studio 0.2.2

Spring Boot-served API workspace at `/swagger-ui/index.html`; no browser extension required.

0.2.2 unifies appearance and effects into shared themes: Midnight, Daylight, Winter (snow), Cosmic (stars) and Forest, plus System. The same selection styles both Studio and standard Swagger. Effects remain visible after closing Studio, and Swagger has its own synchronized theme picker. Independent effect controls/configuration are replaced by theme presets. Compact layout, preserved tab scroll and animated response focus remain available.

- Welcome dashboard with endpoint/method/group metrics, favorites, recent endpoints and session request activity.
- Swagger bearer, API key, basic and OAuth authorization shared at request time; asynchronous request/response interceptors preserved.
- Schema-based JSON examples and basic validation, parameter descriptions, typed query serialization, URL-encoded forms and multipart file upload.
- Tag navigation, persistent open tabs/favorites/recent endpoints, keyboard shortcuts and focus containment.
- Synchronized Studio/Swagger theme presets with bundled reduced-motion-aware effects and application branding.
- Java 17 / Spring Boot 3.4.13 / Springdoc 2.8.14 starter, runnable example and automated verification.

Only workspace metadata and appearance are persisted. Request values, credentials, files and response bodies remain in memory. Swagger's own authorization persistence setting remains under the application's control.

Assets:
- `swagger-ui-studio-customer-demo-0.2.2.jar`: run with Java 17, then open http://127.0.0.1:8087/swagger-ui/index.html.
- `swagger-ui-studio-spring-boot-starter-0.2.2.jar`: starter library (not an executable).
- `swagger-ui-studio-0.2.2-maven-repository.zip`: Maven-layout repository with the project POM and starter for dependency resolution; see README for setup.
- Source JAR and SHA256 checksums.

Known limits: Spring MVC / Springdoc 2.x target; no verified Boot 4, WebFlux or Springfox support. Local JSON Schema refs and common form/query shapes are supported; full JSON Schema validation, external ref resolution, cookie-header editing and multi-document switching are not implemented. Strict nonce-only CSP requires application integration for theme/effect styles. Redirects are blocked and response display is limited to 1 MiB.
