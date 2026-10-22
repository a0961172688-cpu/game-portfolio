import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CaretLeft,
  CaretRight,
  FilmStrip,
  Medal,
  Paperclip,
  Pause,
  Play,
  Trophy,
} from "@phosphor-icons/react";
import episodes from "./portfolio-film-data.json";
import { projects } from "./portfolio-data";
import "./portfolio-extras.css";

type OpenFilm = (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
export type Film = {
  id: string;
  project: string | null;
  series: string;
  title: string;
  summary: string;
  cover: string;
  video: string;
  duration?: number;
};
const projectFilm = (
  id: string,
  title: string,
  series: string,
  duration: number,
): Film => {
  const p = projects.find((p) => p.id === id)!;
  return {
    id: `${id}-demo`,
    project: id,
    series,
    title,
    summary: p.summary,
    cover: p.cover,
    video: p.video!,
    duration,
  };
};
export const films: Film[] = [
  ...episodes,
  projectFilm("rain-night", "雨夜漫步 · 一场雨，一杯咖啡", "玩法实验", 113),
  projectFilm("dead-frame", "断帧 · 在出刀与子弹之间", "玩法实验", 71),
  projectFilm("jian-deng", "03 · 无声戏台与灯楼", "缄灯归渡", 310),
  projectFilm("dark-knight", "黑暗骑士 · 让每一刀都有重量", "玩法实验", 82),
  projectFilm("water-park", "水上乐园 · 一个运转的经营循环", "玩法实验", 147),
  projectFilm("bainian", "百廿列车 · 校史互动项目汇报", "百廿列车", 118),
  projectFilm("pandaku", "Pandaku · 移动端内测实机", "玩法实验", 347),
];
const time = (seconds?: number) =>
  seconds
    ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
    : "实机记录";
const coverIds = [
  "bainian",
  "rain-night",
  "jian-deng",
  "dead-frame",
  "dark-knight",
  "water-park",
];
const covers = coverIds.map((id) => {
  const p = projects.find((p) => p.id === id)!;
  return {
    ...p,
    image:
      id === "bainian"
        ? "/portfolio/hero-bainian.webp"
        : id === "jian-deng"
          ? "/portfolio/hero-jiandeng.webp"
          : p.cover,
  };
});

export function CoverCarousel({
  openProject,
}: {
  openProject: (event: MouseEvent, id: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  useEffect(() => {
    if (paused || hovered || focused || hidden) return;
    const timer = window.setTimeout(
      () => setIndex((i) => (i + 1) % covers.length),
      6500,
    );
    return () => clearTimeout(timer);
  }, [index, paused, hovered, focused, hidden]);
  const current = covers[index];
  const previous = covers[(index + 1) % covers.length];
  return (
    <div
      className="hero-gallery cover-carousel"
      role="region"
      aria-roledescription="轮播"
      aria-label="作品封面"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <figure className="photo photo-back" aria-hidden="true">
        <img src={previous.image} alt="" width="1600" height="900" />
        <figcaption>
          {previous.title} / {previous.subtitle}
        </figcaption>
      </figure>
      <figure className="photo photo-front">
        <a
          href={`#project/${current.id}`}
          onClick={(e) => openProject(e, current.id)}
          aria-label={`查看封面作品：${current.title}`}
        >
          <img
            key={current.id}
            className="cover-reveal"
            src={current.image}
            alt={`${current.title}游戏实机画面`}
            width="1600"
            height="900"
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        </a>
        <figcaption>
          {current.title} / {current.subtitle}
        </figcaption>
        <Paperclip className="photo-clip" size={53} weight="thin" />
      </figure>
      <div className="cover-controls">
        <button
          className="cover-arrow"
          aria-label="上一张作品封面"
          onClick={() =>
            setIndex((i) => (i - 1 + covers.length) % covers.length)
          }
        >
          <CaretLeft size={17} />
        </button>
        <div className="cover-dots" aria-label="选择封面">
          {covers.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setIndex(i)}
              aria-label={`切换到${p.title}封面`}
              aria-current={i === index ? "true" : undefined}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          className="cover-arrow"
          aria-label="下一张作品封面"
          onClick={() => setIndex((i) => (i + 1) % covers.length)}
        >
          <CaretRight size={17} />
        </button>
        <span className="cover-count" aria-live={paused ? "polite" : "off"}>
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(covers.length).padStart(2, "0")}
        </span>
        <button
          className="cover-pause"
          aria-label={paused ? "开始封面轮播" : "暂停封面轮播"}
          aria-pressed={paused}
          onClick={() => {
            setPaused((p) => !p);
            setFocused(false);
          }}
        >
          {paused ? (
            <Play size={13} weight="fill" />
          ) : (
            <Pause size={13} weight="fill" />
          )}
          <span>{paused ? "播放" : "暂停"}</span>
        </button>
      </div>
    </div>
  );
}

export function VideoArchive({ openFilm }: { openFilm: OpenFilm }) {
  const categories = ["全部", "百廿列车", "缄灯归渡", "玩法实验", "创作手记"];
  const [view, setView] = useState<{ series: string; limit: number }>(() => {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("muyan-film-view") || "null",
      );
      if (
        saved &&
        categories.includes(saved.series) &&
        Number.isInteger(saved.limit)
      )
        return {
          series: saved.series,
          limit: Math.max(9, Math.min(saved.limit, films.length)),
        };
    } catch {
      /* Storage may be unavailable in private browsing. */
    }
    return { series: "全部", limit: 9 };
  });
  const { series, limit } = view;
  useEffect(() => {
    try {
      sessionStorage.setItem("muyan-film-view", JSON.stringify(view));
    } catch {
      /* Browsing remains available without storage. */
    }
  }, [view]);
  const filtered = films.filter(
    (f) => series === "全部" || f.series === series,
  );
  return (
    <div className="film-archive">
      <div className="film-intro">
        <p>
          <FilmStrip size={21} /> <strong>{films.length} 支完整记录</strong>
          <span>从第一条视频，到一轮轮可以看见的进展。</span>
        </p>
        <span className="archive-mark">THE WORK BEHIND THE WORK</span>
      </div>
      <div className="film-filters" role="group" aria-label="筛选视频系列">
        {categories.map((c) => (
          <button
            key={c}
            className={series === c ? "active" : ""}
            aria-pressed={series === c}
            onClick={() => {
              setView({ series: c, limit: 9 });
            }}
          >
            {c}
            <small>
              {c === "全部"
                ? films.length
                : films.filter((f) => f.series === c).length}
            </small>
          </button>
        ))}
      </div>
      <div className="film-results" role="status" aria-live="polite">
        {series === "全部" ? "全部视频" : series} · {filtered.length} 支
      </div>
      <div className="film-grid">
        {filtered.slice(0, limit).map((f, i) => (
          <a
            href={`#video/${f.id}`}
            className="film-card"
            id={`film-${f.id}`}
            key={f.id}
            onClick={(e) => openFilm(e, f.id)}
          >
            <div className="film-photo">
              <img
                src={f.cover}
                alt={`${f.title}视频封面`}
                width="960"
                height="540"
                loading="lazy"
              />
              <span className="film-play">
                <Play size={18} weight="fill" />
              </span>
              <span className="film-duration">{time(f.duration)}</span>
            </div>
            <div className="film-meta">
              <span>{f.series}</span>
              <span>RECORD {String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3>{f.title}</h3>
            <p>{f.summary}</p>
            <span className="film-watch">
              播放这段记录 <ArrowUpRight size={16} />
            </span>
          </a>
        ))}
      </div>
      {limit < filtered.length && (
        <button
          className="button film-more"
          onClick={() => setView((v) => ({ ...v, limit: v.limit + 9 }))}
        >
          继续翻阅 · 还有 {filtered.length - limit} 支 <ArrowRight size={18} />
        </button>
      )}
      <p className="film-endnote">把过程留下来，也把走过的路留下来。</p>
    </div>
  );
}

export function FilmDetail({
  film,
  openFilm,
  back,
  openProject,
}: {
  film: Film;
  openFilm: OpenFilm;
  back: (event: MouseEvent<HTMLAnchorElement>) => void;
  openProject: (event: MouseEvent, id: string) => void;
}) {
  const [failed, setFailed] = useState(false);
  const related = films.filter(
    (f) => f.series === film.series && f.id !== film.id,
  );
  return (
    <main id="main-content" className="detail-page film-detail" key={film.id}>
      <a href="#notes" className="back-link" onClick={back}>
        <ArrowLeft size={19} /> 返回视频档案
      </a>
      <p className="eyebrow">DEVELOPMENT FILM / {film.series}</p>
      <div className="film-detail-heading">
        <h1>{film.title}</h1>
        <span>{time(film.duration)}</span>
      </div>
      <p className="detail-intro">{film.summary}</p>
      <div className="detail-media">
        <video
          key={film.video}
          controls
          playsInline
          preload="metadata"
          poster={film.cover}
          onError={() => setFailed(true)}
          aria-label={`${film.title}完整视频`}
        >
          <source src={film.video} type="video/mp4" />
          你的浏览器暂不支持视频播放。
        </video>
      </div>
      {failed && (
        <p className="media-message" role="status">
          视频暂时未能载入，请稍后重试。
        </p>
      )}
      <div className="film-after">
        <span>声音、画面与过程，都在这段记录里。</span>
        {film.project && (
          <a
            href={`#project/${film.project}`}
            onClick={(e) => openProject(e, film.project!)}
          >
            查看对应游戏 <ArrowUpRight size={17} />
          </a>
        )}
      </div>
      {related.length > 0 && (
        <section className="related-films">
          <h2>接着看 · {film.series}</h2>
          <div>
            {related.map((f) => (
              <a
                key={f.id}
                href={`#video/${f.id}`}
                onClick={(e) => openFilm(e, f.id)}
              >
                <img
                  src={f.cover}
                  alt=""
                  width="320"
                  height="180"
                  loading="lazy"
                />
                <span>
                  {f.title}
                  <small>{time(f.duration)}</small>
                </span>
                <Play size={17} />
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export function ProjectFilms({
  projectId,
  openFilm,
}: {
  projectId: string;
  openFilm: OpenFilm;
}) {
  const related = films.filter((f) => f.project === projectId);
  return related.length > 0 ? (
    <section className="project-film-list">
      <h2>
        这个游戏的开发记录 <span>{related.length} 支</span>
      </h2>
      <div>
        {related.map((f) => (
          <a
            href={`#video/${f.id}`}
            key={f.id}
            onClick={(e) => openFilm(e, f.id)}
          >
            <Play size={15} weight="fill" />
            <span>{f.title}</span>
            <small>{time(f.duration)}</small>
            <ArrowUpRight size={17} />
          </a>
        ))}
      </div>
    </section>
  ) : null;
}

export function CompetitionArchive() {
  const entries = [
    "2026 CUSCHA 中国大学生游戏开发大赛",
    "2026 腾讯游戏创作大赛",
    "2026 网易 MINI-GAME 高校挑战赛",
    "光子游戏大赛",
  ];
  return (
    <div className="competition-layout">
      <article className="award-paper">
        <div className="award-topline">
          <span>2026 / TEAM WORK</span>
          <Trophy size={25} weight="duotone" />
        </div>
        <div className="award-medal">
          <Medal size={65} weight="thin" />
        </div>
        <p className="award-category">与四川大学团队合作</p>
        <h3>
          腾讯 3 日极限
          <br />
          游戏开发挑战赛
        </h3>
        <span className="award-ribbon">创意奖</span>
        <p className="award-copy">
          在短时间里，把团队的想法变成能玩的作品。负责程序开发，也在合作中积累设计沟通与版本整合经验。
        </p>
        <div className="award-footer">A SMALL AWARD, A REAL STEP FORWARD.</div>
      </article>
      <div className="competition-records">
        <p className="eyebrow">KEEP CREATING, KEEP TRYING</p>
        <h3>把作品带到更大的场合</h3>
        <p className="competition-description">
          一次获奖经历，也是一段持续参与游戏创作的旅程。
        </p>
        <div className="competition-lines">
          {entries.map((name, i) => (
            <div key={name}>
              <span className="competition-index">0{i + 1}</span>
              <h4>{name}</h4>
              <span className="competition-state">参赛记录</span>
            </div>
          ))}
        </div>
        <p className="competition-footnote">
          上述四项沿用旧站参赛记录，后续结果待补充。
        </p>
      </div>
    </div>
  );
}

export function PlayShelf({
  openProject,
}: {
  openProject: (event: MouseEvent, id: string) => void;
}) {
  const playable = projects.filter((p) => p.play || p.download);
  return (
    <div className="play-shelf">
      <div className="play-shelf-heading">
        <h3>试玩书架</h3>
        <p>从看见一个世界，到亲自走进去。</p>
        <span>{playable.length} 份可体验作品</span>
      </div>
      <div className="play-shelf-grid">
        {playable.map((p, i) => (
          <a
            href={`#project/${p.id}`}
            onClick={(e) => openProject(e, p.id)}
            key={p.id}
          >
            <small>
              {String(i + 1).padStart(2, "0")} /{" "}
              {p.play ? "WEB GAME" : p.downloadPlatform || "WINDOWS"}
            </small>
            <h4>{p.title}</h4>
            <span>
              {p.play
                ? "浏览器试玩"
                : p.downloadPlatform?.includes("ANDROID")
                  ? "安装包试玩下载"
                  : "Windows 试玩下载"}{" "}
              <ArrowUpRight size={16} />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
