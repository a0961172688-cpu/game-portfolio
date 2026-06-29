import { useMemo, useState } from "react";
import {
  Archive,
  BracketsCurly,
  ChartLineUp,
  Circuitry,
  Code,
  Command,
  DownloadSimple,
  EnvelopeSimple,
  GithubLogo,
  GraduationCap,
  Play,
  Pulse,
  Trophy,
  User,
  VideoCamera,
} from "@phosphor-icons/react";

const root = "B:/简历作品";
const isLocalPreview =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("10.") ||
    window.location.hostname.startsWith("192.168."));
const r2Base = "https://pub-85cae68a87384aafb8bc82eedaaa3928.r2.dev";
const r2Path = (path) => `${r2Base}/${path.split("/").map(encodeURIComponent).join("/")}`;
const remoteMedia = {
  "缄灯：归渡/演示视频.mp4": `${r2Base}/videos/jian-deng.mp4`,
  "黑暗骑士/24032121230-李本研/24032121230-李本研-游戏演示.mp4": `${r2Base}/videos/dark-knight.mp4`,
  "公司战争/演示视频.mp4": `${r2Base}/videos/company-war.mp4`,
  "三星堆展馆/三星堆1 2026.01.22 - 08.36.05.07.mp4": `${r2Base}/videos/sanxingdui.mp4`,
  "VR博物馆/演示视频.mp4": `${r2Base}/videos/vr-museum.mp4`,
  "水上乐园/演示视频.mp4": `${r2Base}/videos/water-park.mp4`,
  "恐怖游戏/演示视频.mp4": `${r2Base}/videos/horror.mp4`,
  "数据漫游/演示视频.mp4": `${r2Base}/videos/data-roam.mp4`,
  "飞机大战/演示视频.mp4": `${r2Base}/videos/plane.mp4`,
};
const media = (path) => (isLocalPreview ? `/@fs/${root}/${path}` : remoteMedia[path] ?? r2Path(path));
const poster = (id) => `/posters/${id}.jpg`;
const playUrl = (id) =>
  isLocalPreview || ["water-park", "plane"].includes(id) ? `/play/${id}/index.html` : `${r2Base}/play/${id}/index.html`;
const resumeUrl = "/assets/resume.pdf";

const projects = [
  {
    id: "jian-deng",
    title: "缄灯：归渡",
    type: "2D 叙事解谜",
    status: "已完成",
    phase: "published",
    year: "2026",
    role: "独立开发 / 美术 / 程序 / 音效",
    tools: ["Codex", "Unity", "AI Voice", "Skill 插件"],
    video: media("缄灯：归渡/演示视频.mp4"),
    play: {
      type: "web",
      label: "WebGL Play",
      url: playUrl("jian-deng"),
    },
    brief:
      "Codex 全程开发的 2D 游戏，从美术、程序、音效到人物语音模型接入完整独立完成。",
  },
  {
    id: "dark-knight",
    title: "黑暗骑士",
    type: "2D 动作冒险",
    status: "已完成",
    phase: "published",
    year: "2026",
    role: "独立开发 / Codex 全流程",
    tools: ["Codex", "Unity", "2D Art", "Audio"],
    video: media("黑暗骑士/24032121230-李本研/24032121230-李本研-游戏演示.mp4"),
    play: {
      type: "local",
      label: "Windows 试玩包",
      url: media("黑暗骑士/源文件/新建文件夹/FireGame.exe"),
    },
    brief: "用 Codex 从视觉资产到玩法程序独立推进的 2D 游戏作品，强调完整闭环开发能力。",
  },
  {
    id: "company-war",
    title: "公司战争",
    type: "策略 / 竞赛项目",
    status: "开发中",
    phase: "review",
    year: "2026",
    role: "策划 / 游戏设计 / 程序协作",
    tools: ["Unity", "Claude Code", "Trea", "Team"],
    video: media("公司战争/演示视频.mp4"),
    play: {
      type: "web",
      label: "WebGL Play",
      url: playUrl("company-war"),
    },
    brief: "与川大合作竞赛项目，负责程序与策划设计，延展为后续多项高校游戏赛事作品。",
  },
  {
    id: "sanxingdui",
    title: "三星堆展馆",
    type: "3D 展馆 / 教育",
    status: "已完成",
    phase: "published",
    year: "2024",
    role: "程序 / 策划",
    tools: ["Unity", "3D", "展馆交互"],
    video: media("三星堆展馆/三星堆1 2026.01.22 - 08.36.05.07.mp4"),
    play: {
      type: "web",
      label: "WebGL Play",
      url: playUrl("sanxingdui"),
    },
    brief: "大一下学期完成的文化展馆项目，负责程序实现与策划组织，并开始尝试用 GPT 辅助代码理解与功能实现。",
  },
  {
    id: "vr-museum",
    title: "VR 博物馆",
    type: "VR / 博物馆",
    status: "已完成",
    phase: "published",
    year: "2025",
    role: "Unity VR 开发",
    tools: ["Unity", "MRTK", "Oculus", "AVPro"],
    video: media("VR博物馆/演示视频.mp4"),
    brief: "大二上学期 VR 展陈方向项目，围绕沉浸式浏览、展品查看和空间交互搭建。",
  },
  {
    id: "water-park",
    title: "水上乐园",
    type: "3D 休闲模拟",
    status: "已完成",
    phase: "published",
    year: "2025",
    role: "Unity 开发",
    tools: ["Unity", "WebGL", "3D Scene"],
    video: media("水上乐园/演示视频.mp4"),
    play: {
      type: "web",
      label: "WebGL 试玩",
      url: playUrl("water-park"),
      packageUrl: media("水上乐园/Game/My project (12).exe"),
    },
    brief: "面向休闲体验的 3D 场景项目，包含 WebGL 构建和场景漫游体验。",
  },
  {
    id: "horror",
    title: "恐怖游戏",
    type: "恐怖 / 探索",
    status: "已完成",
    phase: "published",
    year: "2024",
    role: "自学 Unity / 程序",
    tools: ["Unity", "C#", "教程复刻", "Gameplay"],
    video: media("恐怖游戏/演示视频.mp4"),
    brief: "大一开始接触 Unity 后，跟着教程并自己敲代码完成的第一批完整游戏项目。",
  },
  {
    id: "data-roam",
    title: "数据漫游",
    type: "漫游 / 小游戏",
    status: "已完成",
    phase: "published",
    year: "2025",
    role: "接单作业 / Unity 开发",
    tools: ["Unity", "3D", "校园项目"],
    video: media("数据漫游/演示视频.mp4"),
    play: {
      type: "web",
      label: "WebGL Play",
      url: playUrl("data-roam"),
    },
    brief: "寒假期间承接其他学校作业小游戏的一部分，聚焦漫游和数据空间展示。",
  },
  {
    id: "plane",
    title: "飞机大战",
    type: "射击 / 小游戏",
    status: "已完成",
    phase: "published",
    year: "2025",
    role: "Unity 小游戏开发",
    tools: ["Unity", "C#", "Arcade"],
    video: media("飞机大战/演示视频.mp4"),
    play: {
      type: "web",
      label: "网页试玩",
      url: playUrl("plane"),
    },
    brief: "经典射击玩法练习项目，展示基础玩法循环、敌人生成和反馈节奏控制。",
  },
];

const competitions = [
  ["腾讯三天游戏极限开发大赛", "川大合作", "创意奖", "2026"],
  ["2026 CUSCHA 中国大学生游戏开发大赛", "CUSCHA", "评审中", "2026"],
  ["2026 腾讯游戏创作大赛", "腾讯", "评审中", "2026"],
  ["2026 网易 MINI-GAME 高校挑战赛", "网易", "评审中", "2026"],
  ["光子游戏大赛", "Photon", "评审中", "2026"],
];

const timeline = [
  ["大一", "Unity 起步", "跟教程敲代码，完成恐怖游戏雏形。"],
  ["大一下", "GPT 辅助编程 / 三星堆展馆", "开始接触 AI 写代码，用 GPT 辅助理解逻辑与实现功能，同时负责三星堆展馆的程序与策划。"],
  ["大二上", "VR 与 3D 项目", "水上乐园、VR 博物馆、漫游类项目集中产出。"],
  ["寒假", "接单小游戏", "承接学校作业小游戏，拓展交付经验。"],
  ["大二下", "AI 工具链", "Trea、Claude Code、Codex 进入主力开发流。"],
  ["2026+", "竞赛与独立作品", "川大合作获奖，持续参加高校游戏赛事。"],
];

const nav = [
  ["overview", "控制台", Command],
  ["projects", "项目库", Archive],
  ["toolchain", "AI 工具链", Circuitry],
  ["competitions", "竞赛追踪", Trophy],
  ["timeline", "开发历程", Pulse],
  ["skills", "技能栈", BracketsCurly],
  ["contact", "简历 / 联系", User],
];

const skillGroups = [
  ["编程语言", ["C#", "C++", "Python", "Shaders", "GLSL"]],
  ["游戏引擎", ["Unity", "URP", "Photon", "Oculus SDK", "WebGL"]],
  ["工具平台", ["Git", "Visual Studio", "Rider", "Blender", "Photoshop"]],
  ["AI 工具", ["Trea", "Claude Code", "Codex", "GPT 生图", "nanobanana2 生图"]],
  ["开发知识", ["游戏策划", "系统架构", "剧情制作", "语音模型", "独立闭环"]],
];

function StatusBadge({ status }) {
  return <span className={`status ${status === "评审中" || status === "开发中" ? "warn" : ""}`}>{status}</span>;
}

function ProjectMedia({ project, className = "" }) {
  if (project.video) {
    return <video className={className} src={project.video} poster={poster(project.id)} controls preload="metadata" />;
  }

  return <img className={className} src={poster(project.id)} alt={`${project.title} 封面`} />;
}

function ProjectThumb({ project }) {
  if (project.video) {
    return <video src={project.video} poster={poster(project.id)} preload="metadata" muted />;
  }

  return <img src={poster(project.id)} alt={`${project.title} 封面`} />;
}

export function App() {
  const [activeFilter, setActiveFilter] = useState("全部");
  const [selectedId, setSelectedId] = useState("jian-deng");
  const [playProjectId, setPlayProjectId] = useState(null);
  const [terminalLines, setTerminalLines] = useState([
    "developer@portfolio:~$ sync projects",
    "9 projects indexed",
    "voice model: ready",
  ]);

  const filters = ["全部", "已完成", "开发中", "2D", "3D / VR"];
  const filteredProjects = useMemo(() => {
    if (activeFilter === "全部") return projects;
    if (activeFilter === "3D / VR") {
      return projects.filter((project) => /3D|VR|展馆|漫游|乐园/.test(project.type + project.title));
    }
    if (activeFilter === "2D") return projects.filter((project) => project.type.includes("2D"));
    return projects.filter((project) => project.status === activeFilter);
  }, [activeFilter]);
  const selectedProject = projects.find((project) => project.id === selectedId) ?? projects[0];
  const playProject = projects.find((project) => project.id === playProjectId);

  const selectProject = (project) => {
    setSelectedId(project.id);
    setTerminalLines((lines) => [
      ...lines.slice(-3),
      `open project --name "${project.title}"`,
      `video source attached: ${project.status}`,
    ]);
  };

  return (
    <main className="lab-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="AI Game Lab Console">
          <span className="brand-mark"><Command size={20} weight="bold" /></span>
          <span>AI GAME LAB<br />CONSOLE</span>
        </a>

        <nav className="side-nav" aria-label="主导航">
          {nav.map(([id, label, Icon]) => (
            <a key={id} href={`#${id}`} className="side-link">
              <Icon size={20} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <section className="terminal-card" aria-label="Lab terminal">
          <p className="panel-kicker">LAB TERMINAL</p>
          <div className="terminal">
            {terminalLines.map((line, index) => (
              <span key={`${line}-${index}`}>{line}</span>
            ))}
            <span className="cursor">_</span>
          </div>
        </section>

        <section className="monitor-card">
          <p className="panel-kicker">实时监控</p>
          {["CPU 38%", "MEM 6.1 / 16GB", "GPU 22%"].map((item) => (
            <div className="monitor-row" key={item}>
              <span>{item}</span>
              <i />
            </div>
          ))}
          <dl>
            <div><dt>PROJECTS</dt><dd>9</dd></div>
            <div><dt>COMMITS</dt><dd>487</dd></div>
            <div><dt>BUILD STATUS</dt><dd>成功</dd></div>
          </dl>
        </section>
      </aside>

      <div className="content">
        <header className="topbar">
          <div>
            <span className="muted">SYSTEM STATUS</span>
            <strong>ALL SYSTEMS OPERATIONAL</strong>
          </div>
          <div className="top-pills">
            <span><Code size={18} /> Unity / C#</span>
            <span><GithubLogo size={18} /> Git Synced</span>
            <span><Circuitry size={18} /> AI Agents Online</span>
            <time>2026-06-16</time>
          </div>
        </header>

        <section className="hero" id="overview">
          {isLocalPreview ? (
            <video className="hero-bg" src={media("缄灯：归渡/演示视频.mp4")} autoPlay muted loop playsInline />
          ) : (
            <img className="hero-bg" src={poster("jian-deng")} alt="" />
          )}
          <div className="hero-copy">
            <p className="eyebrow">GAME DEVELOPER / PROGRAMMER</p>
            <h1>用代码构建想象<br />用 <span>AI</span> 放大创造</h1>
            <p className="hero-text">
              成都东软学院在读，从大一自学 Unity 到大一下开始用 GPT 辅助写代码，再到 AI 工具链加持的独立游戏开发者。
              专注游戏玩法、系统架构、游戏策划、沉浸式展馆与 2D 叙事体验，全流程覆盖策划、程序、美术、音效和发布。
            </p>
            <div className="hero-actions">
              <a href="#projects">查看项目库</a>
              <a href="#playable">进入试玩区</a>
              <a href={resumeUrl} target="_blank" rel="noreferrer">打开简历 PDF</a>
            </div>
          </div>

          <div className="metrics-panel" aria-label="开发者仪表盘">
            <div className="panel-title">
              <span>开发者仪表盘 / LIVE METRICS</span>
              <ChartLineUp size={18} />
            </div>
            <div className="metric-grid">
              <div><small>项目总数</small><strong>9</strong><span>TOTAL PROJECTS</span></div>
              <div><small>已发布</small><strong>7</strong><span>PUBLISHED</span></div>
              <div><small>开发时长</small><strong>3200+</strong><span>HOURS</span></div>
            </div>
            <div className="bar-chart" aria-hidden="true">
              {Array.from({ length: 24 }, (_, index) => (
                <i key={index} style={{ height: `${28 + ((index * 17) % 48)}%` }} />
              ))}
            </div>
            <div className="line-chart" aria-hidden="true">
              <svg viewBox="0 0 420 120" role="img" aria-label="开发活跃度折线图">
                <polyline points="8,92 70,58 132,82 194,34 256,69 318,42 390,62" />
                <circle cx="70" cy="58" r="5" />
                <circle cx="194" cy="34" r="5" />
                <circle cx="318" cy="42" r="5" />
              </svg>
            </div>
          </div>
        </section>

        <section className="featured panel" aria-label="精选项目">
          <div className="section-heading">
            <span><VideoCamera size={18} /> 终端：重点项目 / FEATURED PROJECT</span>
            <StatusBadge status={selectedProject.status} />
          </div>
          <div className="featured-grid">
            <div className="video-frame">
              <ProjectMedia project={selectedProject} />
            </div>
            <article className="project-inspector">
              <p className="panel-kicker">PROJECT INFO</p>
              <h2>{selectedProject.title}</h2>
              <dl>
                <div><dt>类型</dt><dd>{selectedProject.type}</dd></div>
                <div><dt>角色</dt><dd>{selectedProject.role}</dd></div>
                <div><dt>年份</dt><dd>{selectedProject.year}</dd></div>
                <div><dt>状态</dt><dd><StatusBadge status={selectedProject.status} /></dd></div>
              </dl>
              <p>{selectedProject.brief}</p>
              <div className="tool-list">
                {selectedProject.tools.map((tool) => <span key={tool}>{tool}</span>)}
              </div>
              <div className="play-actions">
                {selectedProject.play ? (
                  <>
                    {selectedProject.play.type === "web" ? (
                      <>
                        <a href={selectedProject.play.url} target="_blank" rel="noreferrer">
                          <Play size={18} weight="fill" /> 全屏网页游玩
                        </a>
                        <button type="button" onClick={() => setPlayProjectId(selectedProject.id)}>
                          站内预览
                        </button>
                      </>
                    ) : selectedProject.play.type === "local" && selectedProject.play.url ? (
                      <a href={selectedProject.play.url} target="_blank" rel="noreferrer">
                        <Play size={18} weight="fill" /> {selectedProject.play.label}
                      </a>
                    ) : (
                      <span>{selectedProject.play.label}</span>
                    )}
                    {selectedProject.play.packageUrl ? (
                      <a href={selectedProject.play.packageUrl} target="_blank" rel="noreferrer">
                        本地试玩包
                      </a>
                    ) : null}
                  </>
                ) : (
                  <span>暂无可接入试玩构建</span>
                )}
              </div>
            </article>
          </div>
        </section>

        <section className="panel" id="projects">
          <div className="section-heading">
            <span><Archive size={18} /> 项目库 / PROJECT BOARD</span>
            <div className="filters" role="group" aria-label="项目筛选">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={activeFilter === filter ? "active" : ""}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="project-grid">
            {filteredProjects.map((project) => (
              <button
                type="button"
                className={`project-tile ${project.id === selectedId ? "selected" : ""}`}
                key={project.id}
                onClick={() => selectProject(project)}
              >
                <ProjectThumb project={project} />
                <span className="play-chip"><Play size={18} weight="fill" /> 演示视频</span>
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.type}</p>
                  <div className="tile-meta">
                    <StatusBadge status={project.status} />
                    {project.play ? <span className="playable-chip">可试玩</span> : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel" id="playable">
          <div className="section-heading">
            <span><Play size={18} weight="fill" /> 游戏试玩 / PLAYABLE BUILDS</span>
            <strong>{projects.filter((project) => project.play).length} builds connected</strong>
          </div>
          <div className="playable-grid">
            {projects.filter((project) => project.play).map((project) => (
              <article key={`${project.id}-play`} className="playable-card">
                <ProjectThumb project={project} />
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.play.type === "web" ? "可在当前页面内嵌试玩" : project.play.type === "cdn" ? "大体积试玩包，适合后续接入 CDN" : "Windows 本地构建包"}</p>
                  <div className="play-actions compact">
                    {project.play.type === "web" ? (
                      <>
                        <a href={project.play.url} target="_blank" rel="noreferrer">
                          <Play size={17} weight="fill" /> 全屏网页游玩
                        </a>
                        <button type="button" onClick={() => setPlayProjectId(project.id)}>
                          站内预览
                        </button>
                      </>
                    ) : project.play.type === "local" && project.play.url ? (
                      <a href={project.play.url} target="_blank" rel="noreferrer">
                        <Play size={17} weight="fill" /> 打开试玩包
                      </a>
                    ) : (
                      <span>{project.play.label}</span>
                    )}
                    {project.play.packageUrl ? (
                      <a href={project.play.packageUrl} target="_blank" rel="noreferrer">备用本地包</a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="toolchain">
          <div className="section-heading">
            <span><Circuitry size={18} /> AI 工具链 / AI TOOLCHAIN PIPELINE</span>
            <strong>All agents working in sync.</strong>
          </div>
          <div className="pipeline">
            {[
              ["需求 & 设计", "Trea", "创意拆解 / 任务拆分"],
              ["架构 & 代码", "Claude Code", "复杂逻辑 / 代码重构"],
              ["实现 & 调试", "Codex", "功能实现 / 问题修复"],
              ["美术 & 音频", "GPT 生图 / nanobanana2", "生图辅助 / 音效素材查找"],
              ["测试 & 优化", "Playtest / AI", "体验反馈 / 平衡调整"],
              ["发布 & 运营", "Unity Build", "构建发布 / 复盘分析"],
            ].map(([step, tool, note]) => (
              <div className="pipeline-node" key={step}>
                <strong>{step}</strong>
                <span>{tool}</span>
                <small>{note}</small>
              </div>
            ))}
          </div>
          <div className="runtime-log">
            <span>[09:12:10] Trea: 项目需求拆成可执行任务</span>
            <span>[09:18:22] Claude Code: 重构核心系统结构</span>
            <span>[09:41:15] Codex: 项目页面与交互完成</span>
          </div>
        </section>

        <section className="panel" id="competitions">
          <div className="section-heading">
            <span><Trophy size={18} /> 竞赛追踪 / COMPETITION TRACKER</span>
          </div>
          <div className="competition-grid">
            <article className="award-card">
              <GraduationCap size={36} />
              <h3>腾讯 3 日极限游戏开发挑战赛</h3>
              <p>川大合作，负责程序，团队作品获得创意奖，并加入川大游研社。</p>
              <strong>创意奖</strong>
            </article>
            <div className="competition-table">
              {competitions.map(([name, host, state, year]) => (
                <div className="competition-row" key={name}>
                  <span>{name}</span>
                  <span>{host}</span>
                  <StatusBadge status={state} />
                  <span>{year}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel" id="timeline">
          <div className="section-heading">
            <span><Pulse size={18} /> 开发历程 / DEVELOPMENT TIMELINE</span>
          </div>
          <div className="timeline">
            {timeline.map(([time, title, note]) => (
              <article key={time}>
                <strong>{time}</strong>
                <h3>{title}</h3>
                <p>{note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bottom-grid">
          <section className="panel" id="skills">
            <div className="section-heading">
              <span><BracketsCurly size={18} /> 技能栈 / SKILLS</span>
            </div>
            <div className="skills-grid">
              {skillGroups.map(([group, skills]) => (
                <div className="skill-row" key={group}>
                  <strong>{group}</strong>
                  <div>{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel contact-panel" id="contact">
            <div className="section-heading">
              <span><User size={18} /> 简历 / 联系 / RESUME & CONTACT</span>
            </div>
            <dl className="profile-list">
              <div><dt>姓名</dt><dd>李本研</dd></div>
              <div><dt>学校</dt><dd>成都东软学院（在读）</dd></div>
              <div><dt>方向</dt><dd>游戏开发 / 程序设计 / 游戏策划</dd></div>
            </dl>
            <a className="download" href={resumeUrl} target="_blank" rel="noreferrer">
              查看完整简历 PDF <DownloadSimple size={20} />
            </a>
            <a className="contact-link" href="mailto:developer@example.com"><EnvelopeSimple size={18} /> 联系我</a>
            <a className="contact-link" href="#projects"><GithubLogo size={18} /> 查看更多项目</a>
          </section>
        </section>

        <footer>
          <span>© 2026 AI Game Lab Console. Built with Unity and AI.</span>
          <span>Last updated: 2026-06-16</span>
        </footer>
      </div>

      {playProject?.play?.type === "web" ? (
        <div className="play-modal" role="dialog" aria-modal="true" aria-label={`${playProject.title} 试玩`}>
          <div className="play-modal-header">
            <div>
              <p className="panel-kicker">PLAYABLE BUILD</p>
              <h2>{playProject.title}</h2>
            </div>
            <div className="play-modal-actions">
              <a href={playProject.play.url} target="_blank" rel="noreferrer">全屏网页游玩</a>
              <button type="button" onClick={() => setPlayProjectId(null)}>关闭</button>
            </div>
          </div>
          <iframe title={`${playProject.title} playable build`} src={playProject.play.url} />
        </div>
      ) : null}
    </main>
  );
}
