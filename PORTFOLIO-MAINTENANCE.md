# 木砚作品集维护

主入口：index.html → src/portfolio-main.tsx → src/Portfolio.tsx。
作品文字、年月、排序与媒体路径：src/portfolio-data.ts。
页面样式：src/portfolio.css。公开素材和已确认简历：public/portfolio/。

## 本地运行

```powershell
npm run dev -- --config vite.portfolio.config.mjs
npm run build -- --config vite.portfolio.config.mjs
npm run preview -- --config vite.portfolio.config.mjs --port 4175
```

本次在 127.0.0.1:4175 运行生产预览。构建输出为 dist；端口以实际日志为准。
新媒体版保留于 src/App.tsx、src/main.tsx 和 new-media.html。专用配置只在这些源文件存在时构建备用入口，主站不依赖备用入口的大型 3D 依赖。
构建排除未使用的旧简历导出与水彩 PNG 原稿；原文件仍保留，实际装饰使用较小的 WebP。

## 更新作品

在 portfolio-data.ts 编辑项目；featured 控制重点档案，数组顺序控制展示顺序。
cover 和 video 对应 public/portfolio 的 WebP、MP4，play 只填写实际试玩入口。
不把只有文件修改时间的老项目编造为具体开发年月。Pandaku 发布状态、雨夜漫步技术栈和断帧原型范围须与记录一致。
scripts/prepare-portfolio-media.py 记录本机原片位置与压缩方法；portfolio-media-sources.json 为来源清单，不随网站公开。
视频均已压到 Cloudflare Pages 单文件限制以内，原视频不改动。
字体和装饰说明见 public/portfolio/FONT-LICENSE.txt、ASSET-NOTES.txt。

## 发布到现有 Cloudflare Pages

已有项目 game-portfolio，保留现有托管。构建后：

```powershell
npx wrangler login
npx wrangler pages deploy dist --project-name game-portfolio --branch main
```

登录由用户本人完成。部署后以 CLI 返回地址验收，再核对 https://game-portfolio.pages.dev/。
旧 b2f1101b.game-portfolio.pages.dev 是固定历史部署网址，不会自动变为新版本。
发布和远端源码同步是不同状态，不能凭本地提交或构建成功宣称已上线。
