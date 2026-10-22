export type PortfolioProject = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tone: string;
  date: string;
  status: string;
  role: string;
  tech: string[];
  summary: string;
  description: string;
  highlights: string[];
  cover: string;
  video?: string;
  play?: string;
  download?: string;
  downloadLabel?: string;
  downloadPlatform?: string;
  extraDownloads?: { url: string; label: string }[];
  featured?: boolean;
  note?: string;
};
const asset = (id: string) => `/portfolio/${id}`;
const release = (file: string) =>
  `https://github.com/a0961172688-cpu/game-portfolio/releases/download/portfolio-playables-20261023/${file}`;
// Keep verified existing builds available while their exported copies move hosts.
const gameAssetBase = (
  import.meta.env.VITE_GAME_ASSETS_URL ||
  "https://pub-85cae68a87384aafb8bc82eedaaa3928.r2.dev"
).replace(/\/$/, "");
const localBuildPreview = ["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);
const gameAsset = (path: string) =>
  localBuildPreview
    ? `/${path}`
    : gameAssetBase
      ? `${gameAssetBase}/${path}`
      : undefined;
export const projects: PortfolioProject[] = [
  {
    id: "pandaku",
    title: "Pandaku",
    subtitle: "轻松有趣的逻辑解谜",
    icon: "game",
    tone: "sage",
    date: "2026.09 — 2026.10",
    status: "持续迭代",
    role: "策划、程序及美术音效统筹",
    tech: ["Unity 6", "C#", "Android", "iOS"],
    featured: true,
    summary:
      "从一张彩色棋盘出发，把规则、推理和一只只熊猫，做成完整的移动端体验。",
    description:
      "一款商业定制的移动端逻辑解谜游戏。每个颜色区域、每一行与每一列只能出现一只熊猫，两只熊猫不能斜向相邻。围绕简单规则，逐步建立教学、难度成长、提示和反馈。",
    highlights: [
      "采用按难度动态抽题的可扩展题库，支持关卡推进、重试和存档恢复。",
      "整合新手教学、提示、生命值与设置，持续调整熊猫动画、声音及触控体验。",
      "已完成 Android 安装包构建，iOS 完成签名上传并进入 TestFlight 内测。",
    ],
    cover: asset("pandaku.webp"),
    video: asset("pandaku.mp4"),
    download: release("PandaKu-0.1.27-20261022.apk"),
    downloadLabel: "下载 Android 试玩 · 0.1.27",
    downloadPlatform: "ANDROID / WINDOWS",
    extraDownloads: [
      {
        url: release("PandaKu-0.1.27-Windows.zip"),
        label: "下载 Windows 试玩 · 0.1.27",
      },
    ],
    note: "提供 Android 6.0 及以上和 Windows 的 0.1.27 内测试玩包；本轮尚未做安卓真机复测。iOS 通过 TestFlight 内测，尚未正式在应用商店发布。",
  },
  {
    id: "bainian",
    title: "百廿列车",
    subtitle: "校史叙事与互动探索",
    icon: "train",
    tone: "peach",
    date: "2026.07 — 2026.08",
    status: "项目实践",
    role: "游戏设计与程序实现",
    tech: ["Unity", "C#", "叙事交互", "移动端"],
    featured: true,
    summary:
      "把校史变成一段可以探索的旅程。让年代不只是文字，而是可以亲手走过的地方。",
    description:
      "在猪佳科技暑期 AI 产品开发实习期间负责的章节式叙事游戏，为四川农业大学 120 年校庆呈现校园历史。玩家从展厅出发，搭乘列车进入不同时代，在历史场景中通过对话、调查、收集与小游戏逐步理解学校的故事。",
    highlights: [
      "组织展厅、历史场景与列车章节，实现章节跳转、进度解锁和局部存档。",
      "将年代驾驶、材料整理、天平称量与田间测量串成连续任务链。",
      "接入移动端虚拟摇杆与交互界面，整理连续章节演示和校史项目汇报视频。",
    ],
    cover: asset("bainian.webp"),
    video: asset("bainian.mp4"),
  },
  {
    id: "rain-night",
    title: "雨夜漫步",
    subtitle: "雨宿り · 一场雨中的小旅行",
    icon: "rain",
    tone: "blue",
    date: "2026.10 — 2026.10",
    status: "可玩原型",
    role: "场景、角色交互与程序实现",
    tech: ["Three.js", "JavaScript", "WebGL", "VRM"],
    featured: true,
    summary:
      "撑一把伞，走进雨夜的便利店，买一杯热咖啡。用交互留住日常里的片刻。",
    description:
      "浏览器中的第三人称 3D 交互原型。围绕雨夜街区、湿路反光和便利店，完成移动、跟随镜头、进出店与购买咖啡的体验。",
    highlights: [
      "接入 VRM 角色及独立骨骼动画，混合待机、行走和跑步，叠加撑伞、收伞与持杯姿态。",
      "搭建街道与便利店，完善碰撞、自动门、商品陈列、咖啡区和购买互动。",
      "使用实例化与批量绘制组织商品和价签，支持键鼠与触屏控件。",
    ],
    cover: asset("rain-night.webp"),
    video: asset("rain-night.mp4"),
    play: "/play/rain-night/index.html",
    download: release("Ame-Night-Walk-Web.zip"),
    downloadLabel: "下载网页试玩包",
    note: "人物采用外部 VRM 样例资产；普通商品以场景陈列为主，当前购买互动为热咖啡。",
  },
  {
    id: "dead-frame",
    title: "断帧",
    subtitle: "DEAD FRAME · 高速动作原型",
    icon: "sword",
    tone: "lavender",
    date: "2026.09 — 2026.09",
    status: "可玩原型",
    role: "战斗系统与关卡流程",
    tech: ["Unity 6", "C#", "战斗模拟"],
    featured: true,
    summary:
      "在出刀、翻滚与子弹之间，寻找刚刚好的瞬间。一次关于动作手感的实验。",
    description:
      "受《武士零》机制启发的横版动作原型，围绕高速近战、翻滚避弹、弹反和慢动作制作三个房间，包含一击死亡、失败重试和关卡结算。",
    highlights: [
      "实现 120 Hz 战斗步进、输入缓冲、离地宽容和子弹扫掠判定。",
      "分离战斗模拟、参数配置与输入表现，支持快速调节手感参数。",
      "已有 20 项战斗回归检查、Unity 输入链路验证与 Windows 构建记录。",
    ],
    cover: asset("dead-frame.webp"),
    video: asset("dead-frame.mp4"),
    play: "/play/dead-frame/index.html",
    download: release("DeadFrame-Windows-V2.zip"),
    note: "当前为独立机制原型，提供电脑键盘网页试玩和 Windows 包；不代表完整原作复刻或逐帧手感一致。",
  },
  {
    id: "jian-deng",
    title: "缄灯：归渡",
    subtitle: "无声戏台与无声灯楼",
    icon: "moon",
    tone: "lavender",
    date: "2026.05 — 2026.06",
    status: "已完成",
    role: "独立开发、美术与声音整合",
    tech: ["Unity", "C#", "2D 叙事", "WebGL"],
    featured: true,
    summary:
      "点亮一盏灯，也找回一个被遗忘的名字。在探索与解谜中，慢慢拼起故事。",
    description:
      "2D 叙事解谜作品，通过灯影切换、机关、物品与对话，把纸马铺、无声戏台和灯楼连成完整体验。",
    highlights: [
      "完成探索、角色对话和机关解谜，将物品线索与剧情推进衔接。",
      "整合地图、角色、UI、语音与音效资产，形成可运行的游戏流程。",
      "完成 WebGL 构建，并保留多章节实机演示。",
    ],
    cover: asset("jian-deng.webp"),
    video: asset("jian-deng.mp4"),
    play: gameAsset("play/jian-deng/index.html"),
  },
  {
    id: "dark-knight",
    title: "黑暗骑士",
    subtitle: "动作与打击感尝试",
    icon: "sword",
    tone: "blue",
    date: "2026.04 — 2026.05",
    status: "已完成",
    role: "独立开发与资产整合",
    tech: ["Unity", "C#", "2D 动作"],
    featured: true,
    summary: "让每一刀都有重量。把动作、判定与声音连接成一套战斗节奏。",
    description:
      "2D 动作冒险作品，围绕连击、冲刺和重击组织战斗，在敌人追击与首领战中打磨反馈。",
    highlights: [
      "实现近战连击、冲刺衔接与重击，组合攻击判定、状态切换和敌人行为。",
      "通过命中停顿、屏幕震动及独立音效打磨战斗反馈。",
      "完成 Windows 构建与战斗专项视频展示。",
    ],
    cover: asset("dark-knight.webp"),
    video: asset("dark-knight.mp4"),
    download: release("Dark-Knight-Windows.zip"),
  },
  {
    id: "water-park",
    title: "水上乐园",
    subtitle: "一个持续运转的经营循环",
    icon: "water",
    tone: "sage",
    date: "2025.11 — 2025.12",
    status: "已完成",
    role: "Unity 开发",
    tech: ["Unity", "C#", "经营模拟", "WebGL"],
    featured: true,
    summary:
      "取货、交付、收银，再开启下一轮营业。把小小的日常，连成能玩的经营系统。",
    description:
      "3D 休闲经营作品，围绕爆米花备货、顾客排队、泳圈清洗及柜台交付，构建持续运行的交易循环。",
    highlights: [
      "实现 NPC 排队、需求检查、商品交付与现金入账。",
      "关联爆米花、干净与脏泳圈库存，推进经营阶段解锁。",
      "完成 WebGL 构建，保留完整游玩路线的系统展示。",
    ],
    cover: asset("water-park.webp"),
    video: asset("water-park.mp4"),
    play: "/play/water-park/index.html",
    download: release("Water-Park-Windows.zip"),
  },
  {
    id: "company-war",
    title: "公司战争",
    subtitle: "策略与团队协作",
    icon: "game",
    tone: "peach",
    date: "2026.03 — 2026.04",
    status: "竞赛项目",
    role: "游戏策划与程序协作",
    tech: ["Unity", "C#", "团队协作"],
    summary: "与四川大学团队合作的策略游戏，积累短周期开发与版本整合经验。",
    description: "参与核心玩法、单位与敌人数据结构、关卡配置及功能整合。",
    highlights: ["参与需求拆解、系统设计与版本整合。", "完成 WebGL 演示构建。"],
    cover: asset("company-war.webp"),
    video: asset("company-war.mp4"),
    play: gameAsset("play/company-war/index.html"),
  },
  {
    id: "sanxingdui",
    title: "三星堆展馆",
    subtitle: "文化展馆与空间探索",
    icon: "book",
    tone: "sage",
    date: "2025.03 — 2025.06",
    status: "已完成",
    role: "程序与策划",
    tech: ["Unity", "3D 交互", "WebGL"],
    summary: "在虚拟展馆中浏览与认识文化展品。",
    description: "参与展馆漫游、展品查看及空间交互，完成 WebGL 构建。",
    highlights: [
      "围绕展陈内容组织浏览与交互。",
      "实践 3D 空间中的程序实现与体验设计。",
    ],
    cover: asset("sanxingdui.webp"),
    video: asset("sanxingdui.mp4"),
    play: gameAsset("play/sanxingdui/index.html"),
  },
  {
    id: "vr-museum",
    title: "VR 博物馆",
    subtitle: "沉浸式展陈体验",
    icon: "book",
    tone: "blue",
    date: "2025.10 — 2025.11",
    status: "已完成",
    role: "Unity VR 开发",
    tech: ["Unity", "VR", "空间交互"],
    summary: "探索沉浸式浏览与空间交互的表达方式。",
    description: "围绕展品查看、展陈空间与 VR 操作进行开发实践。",
    highlights: [
      "实践沉浸式空间中的浏览与展品查看。",
      "积累 VR 工具链与空间交互经验。",
    ],
    cover: asset("vr-museum.webp"),
    video: asset("vr-museum.mp4"),
  },
  {
    id: "data-roam",
    title: "数据漫游",
    subtitle: "空间与信息的表达",
    icon: "book",
    tone: "lavender",
    date: "2026.01 — 2026.02",
    status: "已完成",
    role: "Unity 开发",
    tech: ["Unity", "3D", "WebGL"],
    summary: "用可探索的空间呈现信息与内容。",
    description: "漫游与数据空间展示项目，完成交互和演示构建。",
    highlights: [
      "组织场景中的信息展示与移动浏览。",
      "积累小游戏与展示项目的构建经验。",
    ],
    cover: asset("data-roam.webp"),
    video: asset("data-roam.mp4"),
    play: gameAsset("play/data-roam/index.html"),
  },
  {
    id: "horror",
    title: "恐怖探索",
    subtitle: "最初的 Unity 练习",
    icon: "moon",
    tone: "blue",
    date: "2025.02 — 2025.04",
    status: "已完成",
    role: "自学与程序实践",
    tech: ["Unity", "C#"],
    summary: "从跟教程敲代码开始，完成一段恐怖探索体验。",
    description:
      "自学 Unity 早期的游戏练习，通过制作理解角色控制、场景交互和基础玩法。",
    highlights: ["完成基础探索流程与交互。", "在运行和调试中学习游戏程序。"],
    cover: asset("horror.webp"),
    video: asset("horror.mp4"),
  },
  {
    id: "plane",
    title: "飞机大战",
    subtitle: "经典射击玩法练习",
    icon: "game",
    tone: "peach",
    date: "早期作品",
    status: "已完成",
    role: "Unity 小游戏开发",
    tech: ["Unity", "C#", "WebGL"],
    summary: "练习敌人生成、操作反馈与基础游戏循环。",
    description: "经典射击小游戏，围绕移动、射击、敌人生成和反馈完成基础体验。",
    highlights: ["实现射击玩法与敌人生成。", "提供浏览器试玩构建。"],
    cover: asset("plane.webp"),
    video: asset("plane.mp4"),
    play: "/play/plane/index.html",
  },
];
export const featured = projects.filter((p) => p.featured);
export const moreWorks = projects.filter((p) => !p.featured);
export const resumePdf = "/portfolio/li-benyan-resume.pdf";
export const resumeDocx = "/portfolio/li-benyan-resume.docx";
