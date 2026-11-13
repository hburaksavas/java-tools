# Swagger UI Studio 0.3.22

23 theme presets plus System, shared by Studio and standard Swagger, with themed request/response feedback.

0.3.22 removes HTTP status character badges, including the 418 teapot. Status/timing stay in the response header; theme Execute scenes, long-request behavior, visitors and streaks remain.

0.3.21 moves Server URL into a compact shared toolbar above the request/response cards. Internal interceptor, memory-lifetime and authorization explanation notices are removed. Server overrides remain per-endpoint in-memory drafts and still drive execution and API copying.

0.3.20 adds theme-aware JSON syntax colors to editable Studio request bodies, response bodies and schema examples. Native editing, selection, scrolling and formatting are retained; text is rendered safely without interpreting HTML. Token colors meet 4.5:1 contrast on code/input backgrounds across every theme and atmosphere, and are shared with Swagger code blocks. Large documents retain complete plain-text rendering beyond the highlighting budget.

0.3.19 aligns request and response as equal cards with matching headers and no response-only top offset. Execute moves into the request header as a compact shadow-free button. Companion scenes render inside the response card; side-by-side remains available down to narrower desktop widths, with mobile stacking and saved layout preferences retained. Script and stylesheet URLs now carry a content fingerprint so deployed updates refresh stale cached assets automatically.

0.3.18 implements the eight-theme first phase: Orient Express, Koi Garden, Moonbase, Coral Reef, Clockwork, Firefly Camp, Air Mail and Volcanic Island. Each has local SVG ambient and Execute scenes shared by Studio and Swagger. Koi and foxes react to pointer proximity only outside forms and controls. Scene cleanup, hidden-tab pausing and reduced-motion behavior are tested. No other second-phase entertainment features are added.

0.3.17 shows Studio authorization controls only when an operation references a defined security scheme. Global security inheritance and operation-level public overrides are respected. Unused scheme definitions do not produce auth UI.

0.3.16 removes Forest, Terminal, Sandstorm, Observatory, Infrared, Zen, Circuit and Eclipse from the theme catalog. Existing browser preferences, cross-tab updates and configured legacy theme names migrate to their closest retained themes. The catalog now contains 19 themes plus System.

0.3.15 adds playful request companions: HTTP mood characters and a special 418 teapot; elapsed-time scenes at 4/8 seconds; celebrations every five consecutive 2xx completions; rare dolphins, baby whales and second sandworms; per-theme Day/Sunset/Night atmospheres for Bosphorus and Winter; and a short character journey between endpoint tabs. Both views share effects and browser atmosphere preferences. Characters respect reduced motion; request clocks remain visible. Failures/cancellation reset the in-memory success streak. Demo response delays now support 0..15000 ms.

0.3.14 adds three cinema-inspired themes: Digital Rain with layered code columns and edge decoding, Arrakis with low drifting sand and a segmented sandworm, and Hyperspace with radial stars and perimeter jump streaks. All share Studio/Swagger palettes, browser persistence, request-state feedback and reduced-motion support.

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
