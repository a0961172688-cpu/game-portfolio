import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CloudRain,
  Code,
  Copy,
  DownloadSimple,
  EnvelopeSimple,
  GameController,
  GithubLogo,
  GraduationCap,
  List,
  MoonStars,
  Paperclip,
  Play,
  Sword,
  Train,
  Waves,
  X,
} from "@phosphor-icons/react";
import {
  featured,
  moreWorks,
  projects,
  resumeDocx,
  resumePdf,
} from "./portfolio-data";
import type { PortfolioProject } from "./portfolio-data";
import "./portfolio.css";
import {
  CoverCarousel,
  VideoArchive,
  FilmDetail,
  ProjectFilms,
  CompetitionArchive,
  PlayShelf,
  films,
} from "./PortfolioExtras";

const email = "381983619@qq.com";
const iconMap = {
  game: GameController,
  train: Train,
  rain: CloudRain,
  sword: Sword,
  moon: MoonStars,
  water: Waves,
  book: BookOpen,
};
function ProjectIcon({ name, size = 32 }: { name: string; size?: number }) {
  const Icon = iconMap[name as keyof typeof iconMap] || GameController;
  return <Icon size={size} weight="duotone" aria-hidden="true" />;
}
function SectionTitle({
  number,
  title,
  copy,
}: {
  number: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="section-heading">
      <span className="section-number" aria-hidden="true">
        {number}
      </span>
      <h2>{title}</h2>
      <p>{copy}</p>
      <span className="section-english" aria-hidden="true">
        {number === "01"
          ? "GAME ARCHIVE"
          : number === "02"
            ? "DEVELOPMENT FILMS"
            : number === "03"
              ? "COMPETITIONS"
              : "ABOUT MUYAN"}
      </span>
    </div>
  );
}
function App() {
  const [active, setActive] = useState("bainian");
  const [route, setRoute] = useState(() =>
    decodeURIComponent(window.location.hash.slice(1)),
  );
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const savedScroll = useRef(0);
  const originProject = useRef<string | null>(null);
  const originFilm = useRef<string | null>(null);
  const selected = featured.find((p) => p.id === active)!;
  const detail = route.startsWith("project/")
    ? projects.find((p) => p.id === route.slice(8))
    : undefined;
  const film = route.startsWith("video/")
    ? films.find((f) => f.id === route.slice(6))
    : undefined;
  useEffect(() => {
    const change = () => {
      setRoute(decodeURIComponent(location.hash.slice(1)));
      setMenu(false);
      setVideoError(false);
    };
    window.addEventListener("hashchange", change);
    window.addEventListener("popstate", change);
    return () => {
      window.removeEventListener("hashchange", change);
      window.removeEventListener("popstate", change);
    };
  }, []);
  useEffect(() => {
    if (detail || film) {
      document.title = `${film?.title || detail?.title} · 木砚做游戏`;
      window.scrollTo(0, 0);
    } else {
      document.title = "木砚做游戏 · 李本研的个人作品集";
      if (originProject.current || originFilm.current) {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedScroll.current);
          document
            .getElementById(
              originFilm.current
                ? `film-${originFilm.current}`
                : `folder-${originProject.current}`,
            )
            ?.focus({ preventScroll: true });
          originProject.current = null;
          originFilm.current = null;
        });
      }
    }
  }, [detail, film]);
  function sectionLink(e: React.MouseEvent<HTMLAnchorElement>) {
    const id = e.currentTarget.hash.slice(1);
    originProject.current = null;
    originFilm.current = null;
    setMenu(false);
    if (detail || film) {
      e.preventDefault();
      history.pushState({}, "", `#${id}`);
      setRoute(id);
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ behavior: "instant" }),
      );
    }
  }
  function openProject(e: React.MouseEvent, id: string) {
    e.preventDefault();
    if (!detail && !film) {
      savedScroll.current = window.scrollY;
      originProject.current = id;
      originFilm.current = null;
    }
    history.pushState({ portfolioDetail: true }, "", `#project/${id}`);
    setRoute(`project/${id}`);
    setVideoError(false);
  }
  function openFilm(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    if (!detail && !film) {
      savedScroll.current = window.scrollY;
      originFilm.current = id;
      originProject.current = null;
    }
    history.pushState({ portfolioDetail: true }, "", `#video/${id}`);
    setRoute(`video/${id}`);
  }
  function backToFilms(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (history.state?.portfolioDetail) history.back();
    else location.hash = "notes";
  }
  function backToWorks(e: React.MouseEvent) {
    e.preventDefault();
    if (history.state?.portfolioDetail) history.back();
    else {
      location.hash = "works";
    }
  }
  function projectLink(p: PortfolioProject, className = "project-link") {
    return (
      <a
        className={className}
        href={`#project/${p.id}`}
        onClick={(e) => openProject(e, p.id)}
      >
        查看项目 <ArrowRight size={18} />
      </a>
    );
  }
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      location.href = `mailto:${email}`;
    }
  }
  return (
    <>
      <a href="#main-content" className="skip-link">
        跳到主要内容
      </a>
      <header className="site-header">
        <div className="nav-inner">
          <a className="wordmark" href="#home" onClick={sectionLink}>
            <span>木砚</span>
            <span className="brand-caption">
              独立游戏开发者<small>MUYAN / GAME DEVELOPER</small>
            </span>
          </a>
          <button
            className="menu-button"
            aria-label={menu ? "关闭菜单" : "打开菜单"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={25} /> : <List size={25} />}
          </button>
          <nav
            className={menu ? "navigation open" : "navigation"}
            aria-label="主要导航"
          >
            <a href="#home" onClick={sectionLink}>
              首页
            </a>
            <a href="#about" onClick={sectionLink}>
              关于我
            </a>
            <a href="#works" onClick={sectionLink}>
              游戏档案
            </a>
            <a href="#notes" onClick={sectionLink}>
              视频档案
            </a>
            <a href="#competitions" onClick={sectionLink}>
              竞赛经历
            </a>
            <a href="#contact" onClick={sectionLink}>
              联系
            </a>
          </nav>
        </div>
      </header>
      {film ? (
        <FilmDetail
          key={film.id}
          film={film}
          openFilm={openFilm}
          back={backToFilms}
          openProject={openProject}
        />
      ) : detail ? (
        <main id="main-content" className="detail-page" key={detail.id}>
          <a href="#works" className="back-link" onClick={backToWorks}>
            <ArrowLeft size={19} /> 返回游戏档案
          </a>
          <div className="detail-heading">
            <div>
              <p className="eyebrow">GAME ARCHIVE / {detail.status}</p>
              <h1>{detail.title}</h1>
              <p className="detail-subtitle">{detail.subtitle}</p>
            </div>
            <span className={`date-stamp ${detail.tone}`}>{detail.date}</span>
          </div>
          <p className="detail-intro">{detail.description}</p>
          <div
            className={`detail-media ${detail.id === "pandaku" ? "portrait" : ""}`}
          >
            <video
              controls
              playsInline
              preload="metadata"
              poster={detail.cover}
              onError={() => setVideoError(true)}
              aria-label={`${detail.title}实机演示`}
            >
              <source src={detail.video} type="video/mp4" />
              你的浏览器暂不支持视频播放。
            </video>
          </div>
          {videoError && (
            <p className="media-message" role="status">
              视频暂时未能载入，可以稍后重试。下方的项目说明仍可阅读。
            </p>
          )}
          <div className="detail-columns">
            <section>
              <h2>我在项目中做了什么</h2>
              <ul className="contributions">
                {detail.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              {detail.note && <p className="scope-note">{detail.note}</p>}
            </section>
            <aside className="project-facts">
              <dl>
                <dt>我的职责</dt>
                <dd>{detail.role}</dd>
                <dt>项目周期</dt>
                <dd>{detail.date}</dd>
                <dt>使用工具</dt>
                <dd>{detail.tech.join(" / ")}</dd>
              </dl>
              {detail.play && (
                <a
                  href={detail.play}
                  target="_blank"
                  rel="noreferrer"
                  className="button primary"
                >
                  打开网页试玩 <ArrowUpRight size={18} />
                </a>
              )}
              {detail.download && (
                <a className="text-link" href={detail.download} download>
                  <DownloadSimple size={17} />{" "}
                  {detail.downloadLabel || "下载 Windows 试玩包"}
                </a>
              )}
              {detail.extraDownloads?.map((download) => (
                <a
                  className="text-link"
                  href={download.url}
                  key={download.url}
                  download
                >
                  <DownloadSimple size={17} /> {download.label}
                </a>
              ))}
              <a
                href={resumePdf}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                查看个人简历 <DownloadSimple size={17} />
              </a>
            </aside>
          </div>
          <ProjectFilms projectId={detail.id} openFilm={openFilm} />
          <div className="detail-bottom">
            <a href="#works" onClick={backToWorks}>
              <ArrowLeft size={19} /> 继续翻阅作品
            </a>
            <a href="#contact" onClick={sectionLink}>
              聊聊你的想法 <ArrowRight size={19} />
            </a>
          </div>
        </main>
      ) : (
        <main id="main-content">
          <section className="hero" id="home">
            <div className="hero-inner">
              <div className="hero-copy">
                <p className="eyebrow">
                  MUYAN
                  <br />
                  GAME DEVELOPER
                </p>
                <h1>木砚</h1>
                <p className="hero-role">独立游戏开发者</p>
                <p className="hero-statement">把想法，做成可以玩的世界。</p>
                <div className="hero-actions">
                  <a className="button primary" href="#works">
                    打开游戏档案 <ArrowRight size={18} />
                  </a>
                  <a className="button secondary" href="#about">
                    关于我
                  </a>
                </div>
                <p className="hero-note">
                  游戏是
                  <br />
                  记录世界的另一种方式。
                </p>
              </div>
              <CoverCarousel openProject={openProject} />
            </div>
          </section>
          <section id="works" className="works section-wrap">
            <SectionTitle
              number="01"
              title="游戏档案"
              copy={"记录正在制作的游戏，\n也记录走过的路。"}
            />
            <div className="archive-layout">
              <div
                className="folder-stack"
                role="tablist"
                aria-label="选择重点作品"
                aria-orientation="vertical"
              >
                {featured.map((p, i) => (
                  <button
                    key={p.id}
                    id={`folder-${p.id}`}
                    role="tab"
                    aria-selected={active === p.id}
                    aria-controls="archive-preview"
                    tabIndex={active === p.id ? 0 : -1}
                    className={`folder ${p.tone} ${active === p.id ? "selected" : ""}`}
                    style={{ "--folder-index": i } as React.CSSProperties}
                    onClick={() => setActive(p.id)}
                    onKeyDown={(e) => {
                      if (
                        [
                          "ArrowDown",
                          "ArrowUp",
                          "ArrowLeft",
                          "ArrowRight",
                          "Home",
                          "End",
                        ].includes(e.key)
                      ) {
                        e.preventDefault();
                        const next =
                          e.key === "Home"
                            ? 0
                            : e.key === "End"
                              ? featured.length - 1
                              : (i +
                                  (["ArrowDown", "ArrowRight"].includes(e.key)
                                    ? 1
                                    : -1) +
                                  featured.length) %
                                featured.length;
                        setActive(featured[next].id);
                        document
                          .getElementById(`folder-${featured[next].id}`)
                          ?.focus();
                      }
                    }}
                  >
                    <ProjectIcon name={p.icon} size={34} />
                    <span>
                      <strong>{p.title}</strong>
                      <small>{p.subtitle}</small>
                    </span>
                  </button>
                ))}
              </div>
              <article
                id="archive-preview"
                role="tabpanel"
                aria-labelledby={`folder-${active}`}
                className="archive-preview"
              >
                <span className="paper-label">{selected.status}</span>
                <div
                  className={`archive-image ${selected.id === "pandaku" ? "portrait" : ""}`}
                >
                  <a
                    href={`#project/${selected.id}`}
                    onClick={(e) => openProject(e, selected.id)}
                    aria-label={`查看${selected.title}详情`}
                  >
                    <img
                      key={selected.id}
                      src={selected.cover}
                      alt={`${selected.title}实机画面`}
                      width="1280"
                      height="720"
                    />
                    <span className="play-label">
                      <Play size={15} weight="fill" /> 实机演示
                    </span>
                  </a>
                </div>
                <div className="archive-copy">
                  <p className="eyebrow">
                    {String(featured.indexOf(selected) + 1).padStart(2, "0")} /
                    SELECTED WORK
                  </p>
                  <h3>{selected.title}</h3>
                  <p className="archive-subtitle">{selected.subtitle}</p>
                  <div className="small-rule" />
                  <p className="project-summary">{selected.summary}</p>
                  <span className="project-date">{selected.date}</span>
                  {projectLink(selected, "button primary")}
                </div>
              </article>
            </div>
            <details className="more-works">
              <summary>
                再翻翻早期作品 <span>{moreWorks.length} 份成长记录</span>
                <ArrowRight size={19} />
              </summary>
              <div className="more-grid">
                {moreWorks.map((p) => (
                  <a
                    className="small-project"
                    key={p.id}
                    href={`#project/${p.id}`}
                    onClick={(e) => openProject(e, p.id)}
                  >
                    <img
                      src={p.cover}
                      alt={`${p.title}画面`}
                      width="480"
                      height="270"
                      loading="lazy"
                    />
                    <div>
                      <h3>{p.title}</h3>
                      <p>{p.subtitle}</p>
                      <ArrowUpRight size={19} />
                    </div>
                  </a>
                ))}
              </div>
            </details>
            <PlayShelf openProject={openProject} />
          </section>
          <section id="notes" className="notes-section">
            <div className="section-wrap">
              <SectionTitle
                number="02"
                title="视频档案"
                copy={"把过程留下来，\n让每一次尝试都有迹可循。"}
              />
              <VideoArchive openFilm={openFilm} />
            </div>
          </section>
          <section id="competitions" className="competition-section">
            <div className="section-wrap">
              <SectionTitle
                number="03"
                title="竞赛与荣誉"
                copy={"在合作与挑战里，\n让想法走得更远。"}
              />
              <CompetitionArchive />
            </div>
          </section>
          <section id="about" className="section-wrap about-section">
            <SectionTitle
              number="04"
              title="关于木砚"
              copy={"做游戏，也在游戏里，\n寻找表达自己的方式。"}
            />
            <div className="about-layout">
              <div className="about-name">
                <span className="eyebrow">HELLO, WORLD</span>
                <h3>
                  你好，
                  <br />
                  我是李本研。<small>也可以叫我木砚。</small>
                </h3>
                <p>独立游戏开发者 / AI 辅助创作</p>
              </div>
              <div className="about-copy">
                <p>
                  我在成都东软学院学习数字媒体技术。从自学 Unity
                  开始，慢慢把想法变成能运行、能体验的作品，也把游戏开发用在真实的委托项目中。
                </p>
                <p>
                  我喜欢把玩法、故事、画面和声音放在一起思考。AI
                  是我的开发助手，而规则、体验与最终呈现，需要一轮轮回到游戏里打磨。
                </p>
                <p>
                  曾在猪佳科技进行两个月的暑期 AI 产品开发实习，负责四川农业大学
                  120 年校庆游戏《百廿列车》的设计与程序实现。
                </p>
                <dl className="about-facts">
                  <div>
                    <dt>
                      <GraduationCap size={21} /> 教育
                    </dt>
                    <dd>
                      成都东软学院
                      <br />
                      数字媒体技术 · 本科在读
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Code size={21} /> 开发
                    </dt>
                    <dd>
                      Unity / C#
                      <br />
                      Three.js / WebGL
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <GameController size={21} /> 实践
                    </dt>
                    <dd>
                      玩法与交互 · 美术音效整合
                      <br />
                      移动端构建 · 独立游戏
                    </dd>
                  </div>
                </dl>
                <p className="about-award">
                  曾与四川大学团队合作参加腾讯 3
                  日极限游戏开发挑战赛，团队获得创意奖。
                </p>
                <div className="resume-actions">
                  <a
                    className="button primary"
                    href={resumePdf}
                    target="_blank"
                    rel="noreferrer"
                  >
                    查看个人简历 <DownloadSimple size={18} />
                  </a>
                  <a className="text-link" href={resumeDocx} download>
                    下载 Word 版 <ArrowDownIcon />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
      <section id="contact" className="contact-section">
        <div className="section-wrap contact-inner">
          <div>
            <p className="eyebrow">LET’S MAKE SOMETHING PLAYABLE</p>
            <h2>
              有个想法？
              <br />
              一起把它做成游戏。
            </h2>
            <p>游戏定制、项目合作，或只是交流一个有趣的念头。</p>
          </div>
          <div className="contact-links">
            <a className="email-link" href={`mailto:${email}`}>
              <EnvelopeSimple size={25} />
              {email}
              <ArrowUpRight size={23} />
            </a>
            <div className="contact-secondary">
              <button onClick={copyEmail} className="text-link">
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <span aria-live="polite">
                  {copied ? "邮箱已复制" : "复制邮箱"}
                </span>
              </button>
              <a
                href="https://github.com/a0961172688-cpu/game-portfolio"
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                <GithubLogo size={19} /> GitHub <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>
      <footer className="site-footer">
        <div className="section-wrap">
          <span>© 2026 木砚做游戏</span>
          <span>用认真和一点好奇心，制作。</span>
          <a href="#home" onClick={sectionLink}>
            回到首页 <ArrowUpRight size={15} />
          </a>
        </div>
      </footer>
    </>
  );
}
function ArrowDownIcon() {
  return <DownloadSimple size={16} />;
}
export default App;
