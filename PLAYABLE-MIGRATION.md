# 旧试玩资源迁移记录

核对日期：2026-10-23（Asia/Shanghai）。此记录区分本地完整归档、旧公开存储的当前可访问情况，以及尚未完成的新账号迁移。

## 已保留的本地资源

- 完整导出包：`B:\简历作品\木砚网站_试玩资源.zip`，3,340,689,738 字节。
- 来源清单：本仓库 `playable-migration-manifest.json`，逐项列出归档路径、原文件路径及字节数。
- 归档包含 6 份旧 WebGL 构建，以及黑暗骑士、水上乐园的 Windows 下载包。导出不是新账号上的在线部署。
- `scripts/portfolio-local-builds.mjs` 只在 Vite 开发/预览服务中读取旧四作原目录；正式 Pages 静态构建不会携带该服务，也不会自动复制这些原目录。

本地预览路由：

| 作品 | 路径 | 原构建目录 |
| --- | --- | --- |
| 缄灯：归渡 | `/play/jian-deng/index.html` | `B:\简历作品\缄灯：归渡\源文件\网站` |
| 公司战争 | `/play/company-war/index.html` | `B:\简历作品\公司战争\网站` |
| 三星堆展馆 | `/play/sanxingdui/index.html` | `B:\简历作品\三星堆展馆\网站` |
| 数据漫游 | `/play/data-roam/index.html` | `B:\简历作品\数据漫游\网站` |

## 旧公开存储核对结果

原公开资源根地址：`https://pub-85cae68a87384aafb8bc82eedaaa3928.r2.dev`。原游戏入口为该地址加上上表中的 `/play/.../index.html`。

使用 curl 对本地四份构建共 826 个对应文件逐项发送 HEAD 请求，未下载大型 data 文件。结果如下：

| 作品 | 对应文件数 | HTTP 200 | 缺项情况 |
| --- | ---: | ---: | --- |
| 缄灯：归渡 | 739 | 358 | 381 项 404；包括全部 10 个 `TemplateData` 文件，以及部分 `StreamingAssets` 图片、声音和其他素材 |
| 公司战争 | 54 | 53 | `StreamingAssets/CompanyWar/Configs/Enemies.json` 为 404 |
| 三星堆展馆 | 15 | 14 | `TemplateData/favicon.ico` 为 404 |
| 数据漫游 | 18 | 18 | 本轮文件 HEAD 核对未发现缺项 |

上述四个 `index.html`、data、framework、WASM 核心文件均可获取。带浏览器使用的 `Accept-Encoding: gzip, br` 请求时，核心压缩编码和 JS/WASM 类型正确，长度与本地文件一致。对缄灯 CSS、一个图片、公司战争敌人配置、三星堆图标的 GET Range 抽查也返回 404，缺项并非仅 HEAD 方法差异。

这些是文件级检查，并不等于四个旧游戏均已完成浏览器游玩验证。源代码中的资源回退机制是否覆盖缺项，应以实际运行结果为准。原入口仍依赖旧账号的公开存储，尚未迁到新账号。

## 新账号迁移的实际限制

- 大型 data 核心分别约 44.9 MB、42.5 MB、1.43 GB、1.36 GB，超过 Cloudflare Pages 单文件 25 MiB 限制，需要独立资源存储。
- 缄灯还有一个 `StreamingAssets/AssetFiles/素材和策划案/UI设计/字魂镇魂手书(商用需授权).ttf` 文件，27,339,516 字节，同样超过 25 MiB；没有将其强行复制进 Pages。
- 旧 R2 在带 `Origin: http://127.0.0.1:4175` 或 `Origin: https://game-portfolio.pages.dev` 的 HEAD/GET Range 请求中未返回 `Access-Control-Allow-Origin`。因此，不能直接把 index 移到新站、仅将 Build URL 改到旧 R2，就声称可玩：WASM/data 的跨域读取会面临 CORS 限制。
- 本轮没有建立或挂入这种混合壳；没有创建 `public/play/jian-deng`、`company-war`、`sanxingdui`、`data-roam` 目录，也没有创建 `scripts/prepare-legacy-playables.py`。
- 后续需要新存储授权后上传完整归档，设置正确的压缩类型和跨域策略，再逐项验证。旧 R2 同源入口和本地完整预览可作为迁移期间的现状入口，不能替代迁移完成声明。

## 新增可下载试玩

本轮 5 个 GitHub Release 资产（Pandaku Android 0.1.27、断帧 Windows V2、雨夜漫步网页包、黑暗骑士 Windows、水上乐园 Windows）已逐项核对为公开上传状态，下载 URL 跟随跳转后均返回 200，文件长度与 `download-release.json` 一致。说明见 `PLAYABLE-RELEASE.md`。

原 Unity 工程及旧构建未修改。旧账号凭据不在归档或本记录中。
