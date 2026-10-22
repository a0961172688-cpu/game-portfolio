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

本地功能与视觉通过。Cloudflare 登录已过期，重新登录流程等待本人授权时超时；正式网站尚未更新，不能将本地通过写成线上验收通过。
此前新媒体页面源文件与素材不重置、不混入本轮源码提交；本地存在这些源文件时可构建备用 new-media.html 入口。

final result: passed
