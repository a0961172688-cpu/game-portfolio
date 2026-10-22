# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Confirmed portfolio direction 2026-10-22

The user selected `../作品评估_20261022/design-reference/direction-paper-archive.png`: warm ivory paper, sage/blush/lavender folders, serif Chinese headings, real gameplay photographs, large 木砚 title, interactive project archive. Do not ask them to choose again.
Use the updated resume and order main projects as Pandaku, 百廿列车, 雨夜漫步, 断帧, then earlier works. Use 成都东软学院 for education. Pandaku is in Android build / iOS TestFlight testing, not a public store release. 雨夜漫步 uses Three.js; 断帧 is a Unity action prototype.
The game portfolio entry is `src/portfolio-main.tsx`; the earlier new-media entry remains `src/main.tsx` and is accessible via `new-media.html`. Keep their CSS and resume assets separate.
