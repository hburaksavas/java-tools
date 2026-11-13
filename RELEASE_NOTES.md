# Swagger UI Studio 0.3.13

23 theme presets plus System, shared by Studio and standard Swagger, with themed request/response feedback.

0.3.13 replaces the lightning icon with randomized branching channels, a thin white core, a soft blue halo and a brief asymmetric decay. Ambient lightning stays distant and avoids full-screen flashes.

0.3.12 adds a breaching whale with a timed water spout to Ocean Execute feedback. It swims above the response edge and dives away after completion. Winter adds a snowman that builds from snowballs and gently greets on completion. Rainy Night and Monsoon add slow distant lightning and a small storm cloud on Execute. All respect reduced motion.

0.3.11 improves Ocean, Winter and Sakura: looping horizon highlights and wave fronts, wind-driven layered snow, and notched rose petals with broader gliding paths. Execute now produces edge foam, growing ice crystals or a corner blossom. Shared by Studio and Swagger with reduced-motion support.

0.3.10 adds Copy API details next to the favorite icon: formatted URL, method, current request and last response. Before execution, explicit OpenAPI examples or generated response schema samples are used and labelled as examples.

0.3.9 adds Bosphorus: a coastal blue palette, independent gliding gulls and a City Lines inspired ferry sailing along the response edge on Execute. Shared by Studio and Swagger, with reduced-motion support.

0.3.8 adds responsive side-by-side request/response panels and a layout switch. The preference persists across endpoints and reloads and syncs across same-origin browser tabs. Narrow screens stack panels automatically. Visible responses receive focus without scrolling.

0.3.7 removes the duplicate Overview entry from the sidebar. Overview remains available in the tab bar.

0.3.6 removes the redundant Settings button and dialog. Theme selection remains directly in the toolbar; Escape returns straight to Swagger.

0.3.6 adds a compact play icon before Execute; the button's accessible name remains Execute.

0.3.6 moves JSON formatting to a compact `{ }` icon at the top-right of the request body, aligned with its label. The control retains a Format JSON tooltip and accessible label.

0.3.6 fills the request body example automatically when an endpoint opens. The Generate example button is removed; edited/cleared drafts remain intact across tab and content-type changes.

0.3.6 replaces the straight, uniform particle motion with independent wind curves, depth-dependent speed/size, randomized phases and separate leaf/petal tumbling. Embers rise, dust drifts and fireflies loop locally. Ambient Web Animations pause in hidden tabs and are cancelled when changing themes.

- Implements all saved theme concepts: Rainy Night, Aurora, Sakura, Ember, Ocean, Cyberpunk, Terminal, Blueprint, Eclipse, Paper & Ink, Observatory, Autumn, Monsoon, Circuit, Sandstorm, Bioluminescence, Infrared and Zen, alongside the existing presets.
- Adds waiting, success, warning, failure and cancellation feedback around response edges. JSON text and panel position remain unchanged.
- Instruments standard Swagger through a plugin that preserves existing plugins, authorization, interceptors and action return values. Studio uses the same effect engine.
- Respects reduced-motion preferences; limits simultaneous response layers and removes completed effects.
- Adds a local `/api/demo-response` endpoint with configurable status and bounded delay to preview the full lifecycle.
- Aligns the Studio action label with Swagger's **Execute** and uses **API Studio** as the default/demo heading.

See THEMES.md for configuration values and the complete theme/response mapping.

Assets: executable customer demo JAR (Java 17, port 8087), starter JAR, sources JAR, Maven-layout repository ZIP and SHA256 checksums. Maven Central publication is not included.

Compatibility: Java 17, Spring Boot 3.4.13, Springdoc 2.8.14 / Spring MVC. Custom Swagger initializers must load response-effects.js before constructing SwaggerUIBundle. Strict nonce-only CSP needs application-specific style integration. Existing OpenAPI limitations remain documented in README.md.
