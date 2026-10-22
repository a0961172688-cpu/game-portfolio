# 木砚纸张作品集验收 · 2026-10-22

source visual truth path: B:/简历作品/作品评估_20261022/design-reference/direction-paper-archive.png
implementation screenshot path: B:/简历作品/portfolio-prototype/qa-screenshots/portfolio/desktop-final.png
mobile screenshot path: B:/简历作品/portfolio-prototype/qa-screenshots/portfolio/mobile-archive.png
mobile detail screenshot path: B:/简历作品/portfolio-prototype/qa-screenshots/portfolio/mobile-detail-final.png
full-view comparison evidence: B:/简历作品/portfolio-prototype/qa-screenshots/portfolio/design-comparison.jpg

验收对象：vite.portfolio.config.mjs 的生产构建，IAB http://127.0.0.1:4175/。
选定效果图 1374×1145；桌面视口 1374×1145，截图内容 1359×1133。并排对比图将两张完整首屏等比缩放至各 900×750 区域，未裁掉主体。
补充视口：手机 390×844、平板 768×1024、宽屏 1920×1080。
默认状态：首页、百廿列车文件夹选中。交互覆盖 Pandaku、百廿列车、雨夜漫步与断帧详情，以及更多作品和手机导航。

## 视觉对照

- 已在同一张并排图中实际查看来源与实现，逐区检查导航、英雄区、照片叠层、章节标题、文件夹和预览卡片。
- 保留暖白纸张、鼠尾草绿/浅粉/淡紫文件夹、中文衬线标题、木砚大标题、游戏实机照片和玫瑰色按钮。
- 使用本地 Noto Serif SC 字体子集、真实游戏截图、独立生成的水彩植物装饰。文字与交互由 HTML/CSS 实现。
- 用户新增内容要求将效果图四个文件夹扩为七个，雨夜漫步和断帧置于百廿列车之后；早期六件作品放入可展开区域。
- P2 已修复：首屏与档案垂直间距偏大；预览文案居中导致标题下沉；平板宣传语出现单字孤行。
- P3 保留：装饰植物、纸边与图标不是效果图逐像素复刻；主结构与阅读层级保持一致。
- 没有未解决的 P0/P1/P2 视觉问题。

## 功能与内容

- 13 个项目都有本地截图和压缩 MP4，产物逐项存在且单文件低于 24 MiB；旧 R2 外链返回 403，已替换。
- 重点文件夹鼠标选择、键盘方向键切换、手机横向滑动有效；详情视频读取到有效时长，百廿列车实际播放成功。
- Pandaku 竖屏视频保持比例；详情直达并刷新可用；返回目录恢复滚动位置、选择和焦点。
- 手机菜单展开、选择导航后收起；更多作品展开显示六项；网站无横向溢出、未发现损坏图片。
- PDF、Word 简历、字体响应 200。PDF 为用户确认的李本研-个人简历.pdf 的网站副本。
- 飞机大战、水上乐园 WebGL 实际加载到游戏画面。原游戏有 Unity 持久化/场景对象警告，未阻止加载。原试玩的桌面画布不作为手机触控适配承诺。
- 信息为李本研/木砚、成都东软学院、数字媒体技术本科在读、已确认邮箱和 GitHub；网页未新增私人手机号字段。
- Pandaku 仅写 Android 构建与 TestFlight 内测；雨夜漫步写 Three.js/VRM；断帧写机制原型。新增项目起止年月沿用已核对简历，未编造早期项目日期。
- 首页不预加载全部视频；视频在详情中以 metadata 方式加载，图片使用 WebP。
- 主站浏览器无 console error。构建通过；新增三个 TS/TSX 文件的严格类型检查通过。

## 发布状态

本地功能与视觉通过。源码实施提交 e8e9ceb 已成功推送原仓库 main。Cloudflare 登录已过期，重新登录等待本人授权时超时；实际在新浏览器页面打开 game-portfolio.pages.dev 仍为旧新媒体版本，正式网站尚未更新，不能将本地通过写成线上验收通过。
此前新媒体页面源文件与素材不重置、不混入本轮源码提交；本地存在这些源文件时可构建备用 new-media.html 入口。

final result: passed

## 第二轮扩展验收 2026-10-23

本轮实现提交：9530472；生产构建 main-CuxZR6A2.js / main-DOOpgrD2.css。严格 TypeScript 检查与 Vite 构建通过。675个部署文件共约234MB，单文件均低于25MiB；24个独立MP4，其中18支列入视频档案（其余为其他项目演示）。

source visual truth path: B:/简历作品/作品评估_20261022/design-reference/direction-paper-archive.png
implementation screenshot path: B:/简历作品/portfolio-prototype/qa-screenshots/portfolio-round2/desktop-hero.png
full-view comparison evidence: B:/简历作品/portfolio-prototype/qa-screenshots/portfolio-round2/design-comparison.jpg
其他证据：同目录 desktop-films.png、mobile-films.png、mobile-awards.png、tablet-awards.png、wide-films.png、rain-play.png。

已实际打开并排完整首屏比较，保留既定纸张、衬线、照片叠层、文件夹与配色；按用户新增内容增加轮播控件、视频系列、比赛与试玩书架。平板获奖区完整截图已实际查看，未发现裁切或溢出。390×844、768×1024、1374×1145、1920×1080代表视口 DOM 无横向溢出，未见损坏图片；宽屏截图受当时浏览器可见宽度限制，DOM尺寸单独记录。

已验证：

- 6张封面自动变化、指定封面切换、暂停控件；悬停和焦点暂停逻辑保留。
- 视频系列数量18/6/4/7/1，手机“继续翻阅”展开18卡片；百廿列车筛选后进入118秒视频实际播放，返回保留6条筛选、滚动与焦点。
- 雨夜漫步加载完整角色和雨夜街区，点击开始进入游戏，便利店导航显示交互提示，控制台未见error。
- 创意奖与4项参赛经历按旧记录区分，未伪造证书或奖项结果。
- 公司战争原R2入口实际加载标题画面，无console error；各旧试玩文件完整性与缺项见PLAYABLE-MIGRATION.md。
- Pandaku新增Windows包SHA256与用户交付相符，GitHub Release已核对6个公开资产的实际名称和大小。
- 断帧隔离源码WebGL构建成功、0错误、约18.8MB；本地WASM响应200、gzip及application/wasm正确。

本轮限制：断帧浏览器运行验收期间浏览器控制连接断开，尚未完成键盘游玩检查，不把构建成功当作该项运行通过。新Cloudflare账户尚无有效CLI授权，未发布新网站；投递邮箱尚未完成可操作登录，未发送简历。当前公开简历附件仍待新网址发布后由最终Word/PDF替换。

视觉 final result: passed
新域名线上验收、断帧键盘试玩、最终简历换址与真实邮件投递：pending
