# 木砚作品集更新

用户已确认第一张纸张与叠层文件夹方案，2026-10-22 恢复实施。
保留现有React/Vite工程、原新媒体版源文件及Cloudflare Pages托管。

内容来源：新版李本研游戏开发简历、作品更新候选清单、已核对成片、项目README与QA记录。
主要作品顺序：Pandaku、百廿列车、雨夜漫步、断帧、缄灯归渡、黑暗骑士、水上乐园。原有其他作品保留在更多作品区。
个人信息：李本研（木砚），成都东软学院数字媒体技术本科在读；邮箱和GitHub沿用用户已确认的简历。网页不公开私人手机号。
项目状态遵循事实：Pandaku为Android构建和iOS TestFlight内测；断帧为机制原型；雨夜漫步实际使用Three.js。

选定视觉：../作品评估_20261022/design-reference/direction-paper-archive.png。
新素材使用原成片导出截图与压缩视频，装饰背景由ImageGen按选定方案生成。网站文本保持HTML可访问，不使用整张效果图替代网页。
流程：Git基线 → 内容和资源 → 响应式页面及详情 → 构建 → 内置浏览器验收 → 发布状态核对。
本轮源码沿用原GitHub仓库main分支；首轮实施提交为e8e9ceb，后续扩展继续在该分支同步。工作区此前存在的新媒体版改动属于用户既有工作，不混入本轮提交。

实施状态：已完成纸张风格主站、七个重点文件夹、六个早期作品、详情、手机导航与新版简历下载。生产构建与浏览器检查记录见 design-qa.md；维护入口见 PORTFOLIO-MAINTENANCE.md。
正式发布：2026-10-23 已在新账号 c6c92c3ebe9d0151ee5e5a76a574188f 的 Pages 项目 muyan-game-portfolio 上线，正式地址为 https://muyan-game-portfolio.pages.dev/ 。Cloudflare CLI OAuth 已成功授权，正式站已核验 HTTP 200。此前旧账号登录失效和授权超时属于历史背景；game-portfolio.pages.dev 与 b2f1101b.game-portfolio.pages.dev 保留旧站及历史部署，不作为新版地址。

2026-10-23 扩展：已实现6张封面自动/手动轮播、18支视频档案（4系列）、比赛创意奖与4项参赛记录、试玩书架。雨夜漫步复制完整网页运行包；断帧已在隔离源码副本成功构建WebGL（0错误，约18.8MB），并加入防御性 gzip 解压 bootstrap 与 no-transform 响应处理，实际公网运行验收以 design-qa.md 为准；Pandaku Android与新交付Windows0.1.27均有公开Release下载。旧大型试玩已完整导出，本地可读，公网旧R2存在部分缺项，尚未全部迁移，记录见PLAYABLE-MIGRATION.md。
简历已完成两页游戏开发投递版，Word、PDF及网站下载均使用正式新网址；线上PDF与本地最终版SHA-256相符：0D7D2C664F97C43931B26CEC65172CBA68A9DDA38821E084025B729DD548BF73。用户授权从381983619@qq.com向星合互娱campus@staruniongame.com投递开发岗，目标为前端开发实习生（Unity客户端方向）；邮件与最终PDF已准备，正在完成实际投递，须核验已发送记录后再记为成功。
