# AME MART 商品包装贴图

- 生成日期：2026-10-12。
- 方式：内置 ImageGen；没有使用 CLI/API 密钥。
- 最终项目文件：`H:/unity/新项目1/dist/assets/products-atlas-v1.png`。
- 原始尺寸：1254 × 1254；四行四列图集。图片原样复制到项目，运行时使用带边距的 UV 映射。
- 使用位置：`dist/products.js` 的 16 类商品，以及售货机上的商品图案。
- 食品包装为虚构 AME MART 品牌；人物模型的原始贴图没有改动。

## 最终生成提示词

```text
Create ONE square production texture atlas for an existing anime-style rainy Japanese convenience-store browser game named AME MART. Asset type: flat printed package-label artwork, not a product mockup. Exactly a 4-column by 4-row grid of 16 equally sized square cells, edge to edge across the entire square image. Each cell is its own full-bleed label design; grid boundaries precisely at 25%, 50%, 75%. All lettering and food illustrations stay at least 8% inside each cell. No gutters, no external margins, no grid strokes. Matte ink, refined hand-painted anime food illustrations, clean retail typography, subtle paper texture, muted cream/forest green/coral/amber/indigo palette. Highly legible large English product word, tiny consistent AME mark. These are imaginary store-brand products, no real brand logos. Exact row-major cell layout: Row 1: TEA (forest green, tea leaves); WATER (pale aqua, water ripples); MILK (ivory and navy, milk and simple cow); PEACH (coral pink, peaches). Row 2: COFFEE (brown and cream, coffee beans); SODA (indigo blue, bubbles and citrus); POTATO (mustard orange, golden potato chips); TOMATO (warm red, tomato crackers). Row 3: BUTTER (pale gold, flaky pastry); CHOCO (cocoa brown, chocolate biscuit); STRAWBERRY (dusty berry red, strawberry cookie); SEAWEED (deep teal, rice triangle wrapped in seaweed). Row 4: CURRY (burnt orange, bowl of curry noodles); MISO (dark navy and ivory, soup bowl); TUNA (sage green and cream, triangular tuna sandwich); EGG (soft yellow and peach, egg sandwich). All 16 complete label faces must be visible, same layout density, no missing cell. Orthographic FLAT labels only, no 3D cartons, no cans, no perspective, no shadows or lighting, no scene background, no watermark. This sheet will be UV mapped onto real 3D cartons, bottles, cans, snack bags, and food trays. Prefer 2048x2048 square or larger.
```
