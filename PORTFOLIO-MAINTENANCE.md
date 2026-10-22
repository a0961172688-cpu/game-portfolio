# 木砚作品集维护

主入口：index.html → src/portfolio-main.tsx → src/Portfolio.tsx。
作品文字、年月、排序与媒体路径：src/portfolio-data.ts。
页面样式：src/portfolio.css。公开素材和已确认简历：public/portfolio/。
轮播、视频档案、比赛与试玩书架：src/PortfolioExtras.tsx、src/portfolio-extras.css。
18 支视频的系列、标题与播放路径：src/portfolio-film-data.json；原片映射与压缩记录在 portfolio-film-sources.json、scripts/prepare-portfolio-films.py。

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
download 为主要安装包；downloadLabel 与 downloadPlatform 控制平台说明，extraDownloads 可追加同项目其他平台。下载放在 GitHub Release，避免将 170 MB 安装包写进 Pages。
首页封面选择在 PortfolioExtras.tsx 的 coverIds 维护；默认每 6.5 秒轮播，支持手动、暂停、悬停与焦点暂停。
不把只有文件修改时间的老项目编造为具体开发年月。Pandaku 发布状态、雨夜漫步技术栈和断帧原型范围须与记录一致。
scripts/prepare-portfolio-media.py 记录本机原片位置与压缩方法；portfolio-media-sources.json 为来源清单，不随网站公开。
视频均已压到 Cloudflare Pages 单文件限制以内，原视频不改动。
字体和装饰说明见 public/portfolio/FONT-LICENSE.txt、ASSET-NOTES.txt。
文字更新后可运行 scripts/update-portfolio-font.py 更新字体子集。

## 试玩与导出

雨夜漫步位于 public/play/rain-night，角色、动作、第三方脚本和许可证均随本地静态包保留。
断帧浏览器构建位于 public/play/dead-frame，Unity 6000.0.82f1 WebGL，所有部署文件低于25 MiB；public/_headers 保留 gzip 编码与 WASM MIME。电脑键盘操作，未承诺手机触控。
构建工具 scripts/UnityPortfolioWebBuild.cs 只在 D:/PortfolioWebBuilds/DeadFrame 隔离副本运行，不改原项目；本机 Unity WebGL 模块已补齐。原始构建日志和产物在忽略的 .game-builds。
四个大型旧 WebGL 在本地由 scripts/portfolio-local-builds.mjs 只读服务原构建；公网保留原 R2 同源入口。可用 VITE_GAME_ASSETS_URL 切换迁移后的资产域名。旧缄灯远端有部分运行资源缺失，不能仅凭核心文件200宣称已完成迁移；详见 PLAYABLE-MIGRATION.md。
完整旧试玩资源导出：B:/简历作品/木砚网站_试玩资源.zip；目录映射在 playable-migration-manifest.json。Pages25 MiB限制不允许把该3GB资源ZIP或旧大型data直接放入 public。
新试玩下载发布页：https://github.com/a0961172688-cpu/game-portfolio/releases/tag/portfolio-playables-20261023 。

## 发布到现有 Cloudflare Pages

旧项目 game-portfolio 属于不可登录的旧账号；新部署必须显式选定用户当前新账号，不复用旧缓存中的账号 ID。构建后：

```powershell
npx wrangler login
$env:CLOUDFLARE_ACCOUNT_ID='<核对后的新账号ID>'
npx wrangler pages deploy dist --project-name '<新项目名>' --branch main
```

登录由用户本人完成。部署后以 CLI 返回地址验收，再核对 https://game-portfolio.pages.dev/。
旧 b2f1101b.game-portfolio.pages.dev 是固定历史部署网址，不会自动变为新版本。
发布和远端源码同步是不同状态，不能凭本地提交或构建成功宣称已上线。
