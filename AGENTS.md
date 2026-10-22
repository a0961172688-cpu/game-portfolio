# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Confirmed portfolio direction 2026-10-22

The user selected `../作品评估_20261022/design-reference/direction-paper-archive.png`: warm ivory paper, sage/blush/lavender folders, serif Chinese headings, real gameplay photographs, large 木砚 title, interactive project archive. Do not ask them to choose again.
Use the updated resume and order main projects as Pandaku, 百廿列车, 雨夜漫步, 断帧, then earlier works. Use 成都东软学院 for education. Pandaku is in Android build / iOS TestFlight testing, not a public store release. 雨夜漫步 uses Three.js; 断帧 is a Unity action prototype.
The game portfolio entry is `src/portfolio-main.tsx`; the earlier new-media entry remains `src/main.tsx` and is accessible via `new-media.html`. Keep their CSS and resume assets separate.

## Confirmed additions 2026-10-23

Keep the approved paper design. The hero must rotate automatically and offer arrows, cover dots and pause/play. Show the fuller video archive (18 distinct records) with series filters, loading more and detail/back state restoration. Preserve the old creative award and four participation records without inventing competition results.
Rain Night already has a self-contained browser build. Add DEAD FRAME's real WebGL build; the user narrowed the conversion scope to this one. Pandaku keeps Android 0.1.27 and the user-supplied Windows 0.1.27 download; do not resume a Pandaku WebGL port without a new request.
Project dates follow the latest confirmed resume: Pandaku 2026.09–10, 百廿列车 2026.07–08, 雨夜 2026.10, 断帧 2026.09, 公司战争 2026.03–04, 黑暗骑士 2026.04–05, 缄灯 2026.05–06. 百廿列车 was made during a two-month summer AI product internship at 猪佳科技 for 四川农业大学120年校庆.
Publication is moving to the user's new Cloudflare account; preserve the inaccessible old account and never claim CLI login from a dashboard screenshot alone. The resume must use a verified public new-site URL, never localhost. The user authorized applying to StarUnion's development internship using the resume QQ mailbox; actual delivery requires a signed-in mailbox and must be verified in Sent.
