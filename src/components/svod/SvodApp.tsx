import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Home, Clock, Star, Search, FileText, Scale, ListChecks, Users, ChevronRight, ChevronDown,
  Plus, Eye, SmilePlus, Paperclip, MessageSquare, Pencil, Link2, Type, Heading2, List,
  SquareCheck, PanelLeft, Table, Columns2, ChevronsDownUp, Image, ListTree, FolderTree, FileSymlink,
  Check, X, type LucideIcon,
} from "lucide-react";
import {
  PAGES, SPACES, TREE, HOME_LISTS, UPDATES, byId, statusDot, statusLabel,
  type Page, type PageType, type Status, type TreeNode,
} from "./data";

type Screen =
  | { name: "home" }
  | { name: "space"; tab: "tree" | "updates" }
  | { name: "read"; id: string }
  | { name: "edit"; id: string };

const typeIcon: Record<PageType, LucideIcon> = { doc: FileText, decision: Scale, howto: ListChecks, meeting: Users };
const I = { strokeWidth: 1.5, size: 16 };

function Dot({ s }: { s: Status }) {
  return <span title={statusLabel[s]} className={`inline-block size-2 shrink-0 rounded-full ${statusDot[s]}`} />;
}

function Avatar({ name, size = "size-7" }: { name: string; size?: string }) {
  const ini = name.split(" ").map((w) => w[0]).join("");
  return (
    <span className={`${size} grid shrink-0 place-items-center rounded-full bg-hover text-[11px] font-medium text-foreground ring-2 ring-canvas`}>
      {ini}
    </span>
  );
}

export function SvodApp() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [searchOpen, setSearchOpen] = useState(false);
  const open = (id: string) => setScreen({ name: "read", id });

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="flex h-screen min-w-[1280px] overflow-hidden bg-canvas text-foreground">
      <Sidebar screen={screen} setScreen={setScreen} onSearch={() => setSearchOpen(true)} />
      <main className="flex-1 overflow-y-auto">
        {screen.name === "home" && <HomeScreen open={open} goSpace={() => setScreen({ name: "space", tab: "tree" })} />}
        {screen.name === "space" && <SpaceScreen tab={screen.tab} setTab={(tab) => setScreen({ name: "space", tab })} open={open} />}
        {screen.name === "read" && (
          <ReadScreen key={screen.id} page={byId(screen.id)} edit={() => setScreen({ name: "edit", id: screen.id })} goSpace={() => setScreen({ name: "space", tab: "tree" })} />
        )}
        {screen.name === "edit" && <EditScreen page={byId(screen.id)} done={() => open(screen.id)} />}
      </main>
      {searchOpen && <SearchPalette close={() => setSearchOpen(false)} open={(id) => { open(id); setSearchOpen(false); }} />}
    </div>
  );
}

/* ---------------- Sidebar ---------------- */
function Sidebar({ screen, setScreen, onSearch }: { screen: Screen; setScreen: (s: Screen) => void; onSearch: () => void }) {
  const [openSpace, setOpenSpace] = useState<Record<string, boolean>>({ pay: true });
  const activeId = screen.name === "read" || screen.name === "edit" ? screen.id : null;
  const Item = ({ icon: Ic, label, active, onClick, indent }: { icon?: LucideIcon; label: string; active?: boolean; onClick: () => void; indent?: boolean }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13.5px] transition-colors hover:bg-panel-active ${active ? "bg-panel-active text-panel-fg" : "text-panel-fg/90"} ${indent ? "pl-8" : ""}`}
    >
      {Ic && <Ic {...I} className="text-panel-muted" />}
      <span className="truncate">{label}</span>
    </button>
  );
  const Group = ({ children, title }: { children: ReactNode; title: string }) => (
    <div className="mt-5">
      <div className="mb-1 px-2.5 text-[11px] uppercase tracking-[0.08em] text-panel-muted">{title}</div>
      {children}
    </div>
  );
  return (
    <aside className="flex h-screen w-[248px] shrink-0 flex-col bg-panel px-3 py-4 text-panel-fg">
      <button onClick={() => setScreen({ name: "home" })} className="flex items-center gap-2 rounded-lg px-2.5 py-1">
        <span className="size-3 rounded-[2px] bg-sienna" />
        <span className="font-serif text-[22px] leading-none">Свод</span>
      </button>
      <button onClick={onSearch} className="mt-4 flex items-center gap-2 rounded-lg bg-panel-active px-2.5 py-2 text-[13px] text-panel-muted hover:text-panel-fg">
        <Search {...I} />
        <span className="flex-1 text-left">Искать или перейти…</span>
        <kbd className="font-sans text-[11px]">⌘K</kbd>
      </button>
      <nav className="mt-3 flex-1 overflow-y-auto">
        <Item icon={Home} label="Дом" active={screen.name === "home"} onClick={() => setScreen({ name: "home" })} />
        <Group title="Недавние">
          {["timeouts", "sync", "onboard"].map((id) => (
            <Item key={id} icon={Clock} label={byId(id).title} active={activeId === id} onClick={() => setScreen({ name: "read", id })} />
          ))}
        </Group>
        <Group title="Избранное">
          {["overview", "release"].map((id) => (
            <Item key={id} icon={Star} label={byId(id).title} active={activeId === id} onClick={() => setScreen({ name: "read", id })} />
          ))}
        </Group>
        <Group title="Пространства">
          {SPACES.map((s) => (
            <div key={s.id}>
              <button
                onClick={() => { setOpenSpace((o) => ({ ...o, [s.id]: !o[s.id] })); if (s.id === "pay") setScreen({ name: "space", tab: "tree" }); }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13.5px] hover:bg-panel-active ${screen.name === "space" && s.id === "pay" ? "bg-panel-active" : ""}`}
              >
                {openSpace[s.id] ? <ChevronDown {...I} size={14} className="text-panel-muted" /> : <ChevronRight {...I} size={14} className="text-panel-muted" />}
                <span className="truncate">{s.name}</span>
              </button>
              {openSpace[s.id] &&
                PAGES.filter((p) => p.space === s.name).slice(0, 4).map((p) => (
                  <Item key={p.id} indent label={p.title} active={activeId === p.id} onClick={() => setScreen({ name: "read", id: p.id })} />
                ))}
            </div>
          ))}
        </Group>
      </nav>
      <div className="mt-3 flex items-center gap-2.5 border-t border-panel-active px-2.5 pt-3">
        <span className="grid size-8 place-items-center rounded-full bg-panel-active text-[12px]">АС</span>
        <div className="leading-tight">
          <div className="text-[13.5px]">Аня Савич</div>
          <div className="text-[12px] text-panel-muted">автор</div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Home ---------------- */
function PageRow({ p, time, onClick, showSpace = true }: { p: Page; time: string; onClick: () => void; showSpace?: boolean }) {
  const Ic = typeIcon[p.type];
  return (
    <button onClick={onClick} className="-mx-2.5 flex w-[calc(100%+20px)] items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[14.5px] hover:bg-hover">
      <Ic {...I} className="text-muted-foreground" />
      <span className="truncate">{p.title}</span>
      {showSpace && <span className="truncate text-[13px] text-muted-foreground">{p.space}</span>}
      <span className="flex-1" />
      <Dot s={p.status} />
      <span className="w-24 text-right text-[13px] text-muted-foreground">{time}</span>
    </button>
  );
}

function HomeScreen({ open, goSpace }: { open: (id: string) => void; goSpace: () => void }) {
  return (
    <div className="mx-auto flex max-w-[1080px] gap-16 px-14 py-14">
      <div className="flex-1">
        <h1 className="font-serif text-[40px] leading-tight">Добрый день, Аня</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Три страницы ждут вас.</p>
        <div className="mt-10 space-y-9">
          {HOME_LISTS.map((l) => (
            <section key={l.title}>
              <h2 className="mb-1.5 border-b border-border pb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{l.title}</h2>
              {l.items.map((it, i) => <PageRow key={i} p={byId(it.id)} time={it.time} onClick={() => open(it.id)} />)}
            </section>
          ))}
        </div>
      </div>
      <aside className="w-[240px] pt-[104px]">
        <h2 className="mb-1.5 border-b border-border pb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Пространства</h2>
        {SPACES.map((s) => (
          <button key={s.id} onClick={goSpace} className="-mx-2.5 block w-[calc(100%+20px)] rounded-lg px-2.5 py-2.5 text-left hover:bg-hover">
            <div className="text-[14.5px]">{s.name}</div>
            <div className="text-[13px] leading-snug text-muted-foreground">{s.goal}</div>
          </button>
        ))}
      </aside>
    </div>
  );
}

/* ---------------- Space ---------------- */
function SpaceScreen({ tab, setTab, open }: { tab: "tree" | "updates"; setTab: (t: "tree" | "updates") => void; open: (id: string) => void }) {
  const [sel, setSel] = useState("timeouts");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const renderNode = (n: TreeNode, depth: number): ReactNode => {
    const p = n.id ? byId(n.id) : null;
    const isOpen = !collapsed[n.label];
    return (
      <div key={n.label}>
        <button
          onClick={() => { if (n.children) setCollapsed((c) => ({ ...c, [n.label]: !c[n.label] })); else if (n.id) { setSel(n.id); open(n.id); } }}
          className={`flex w-full items-center gap-2 rounded-lg py-2 pr-2.5 text-left text-[14.5px] hover:bg-hover ${p && sel === p.id ? "bg-hover" : ""}`}
          style={{ paddingLeft: 10 + depth * 24 }}
        >
          {n.children ? (isOpen ? <ChevronDown {...I} size={14} className="text-muted-foreground" /> : <ChevronRight {...I} size={14} className="text-muted-foreground" />) : <span className="w-3.5" />}
          {p ? (() => { const Ic = typeIcon[p.type]; return <Ic {...I} className="text-muted-foreground" />; })() : null}
          <span className={n.children ? "text-muted-foreground" : ""}>{n.label}</span>
          <span className="flex-1" />
          {p && <><Dot s={p.status} /><span className="w-16 text-right text-[13px] text-muted-foreground">{p.date}</span></>}
        </button>
        {n.children && isOpen && n.children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  };
  return (
    <div className="mx-auto max-w-[880px] px-14 py-14">
      <div className="flex items-start justify-between gap-8">
        <div>
          <h1 className="font-serif text-[40px] leading-tight">Платёжный контур</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">Как устроены платежи и как мы их меняем</p>
        </div>
        <div className="flex items-center gap-4 pt-3">
          <div className="flex -space-x-2">{["Марк Левин", "Аня Савич", "Олег Дробыш"].map((n) => <Avatar key={n} name={n} />)}</div>
          <button className="flex items-center gap-1.5 rounded-lg bg-sienna px-3.5 py-2 text-[13.5px] font-medium text-sheet hover:opacity-90">
            <Plus {...I} /> Создать
          </button>
        </div>
      </div>
      <div className="mt-8 flex gap-6 border-b border-border text-[14px]">
        {([["tree", "Дерево"], ["updates", "Обновления"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 pb-2.5 ${tab === k ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{l}</button>
        ))}
      </div>
      {tab === "tree" ? (
        <div className="mt-4">{TREE.map((n) => renderNode(n, 0))}</div>
      ) : (
        <div className="mt-8 max-w-[640px] space-y-10">
          {UPDATES.map((u) => (
            <article key={u.date}>
              <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                <Avatar name={u.author} size="size-6" /> <span className="text-foreground">{u.author}</span> · {u.date}
              </div>
              {u.body.map((b, i) => <p key={i} className="mt-3 text-[16px] leading-[1.65]">{b}</p>)}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Read ---------------- */
const THREAD = [
  { who: "Олег Дробыш", when: "09:12", text: "8 секунд — это p99 банка или наш замер? У Альфы в пятницу вечером бывало и 11." },
  { who: "Марк Левин", when: "09:40", text: "Наш замер за сентябрь, p99 = 6,4 с. Пятничные хвосты уходят в асинхронную проверку, клиент не теряет платёж." },
];

function ReadScreen({ page, edit, goSpace }: { page: Page; edit: () => void; goSpace: () => void }) {
  const articleRef = useRef<HTMLDivElement>(null);
  const [selBtn, setSelBtn] = useState<{ top: number; left: number; pid: string } | null>(null);
  const [thread, setThread] = useState<{ pid: string; top: number } | null>(null);
  const [following, setFollowing] = useState(false);
  const [tasks, setTasks] = useState([true, false, false]);

  const onMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !articleRef.current) return setSelBtn(null);
    const node = sel.anchorNode?.parentElement?.closest("[data-pid]") as HTMLElement | null;
    if (!node) return setSelBtn(null);
    const r = sel.getRangeAt(0).getBoundingClientRect();
    const base = articleRef.current.getBoundingClientRect();
    setSelBtn({ top: r.top - base.top - 40, left: r.left - base.left + r.width / 2 - 56, pid: node.dataset.pid! });
  };
  const openThread = () => {
    if (!selBtn || !articleRef.current) return;
    const el = articleRef.current.querySelector(`[data-pid="${selBtn.pid}"]`) as HTMLElement;
    setThread({ pid: selBtn.pid, top: el.offsetTop });
    setSelBtn(null);
    window.getSelection()?.removeAllRanges();
  };
  const P = ({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) => (
    <p data-pid={id} className={`mt-4 ${thread?.pid === id ? "bg-slash" : ""} ${className}`}>{children}</p>
  );
  const isMain = page.id === "timeouts";
  const crumbs = page.path.split(" / ");

  return (
    <div className="mx-auto flex max-w-[1160px] gap-10 px-10 py-10">
      <div className="min-w-0 flex-1 rounded-[2px] bg-sheet px-16 pb-20 pt-10">
        <div className="flex items-center justify-between text-[13px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <button onClick={goSpace} className="hover:text-foreground">{c}</button>
                <ChevronRight {...I} size={12} />
              </span>
            ))}
            <span className="text-foreground">{page.title}</span>
          </div>
          <button onClick={edit} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] text-foreground hover:bg-hover">
            <Pencil {...I} size={14} /> Править
          </button>
        </div>

        <div ref={articleRef} onMouseUp={onMouseUp} className="relative mx-auto mt-10 max-w-[720px] text-[16.5px] leading-[1.65]">
          <div className="flex items-center gap-3 text-[13px]">
            <span className="flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5"><Dot s={page.status} /> {statusLabel[page.status]}</span>
            <span className="text-muted-foreground">владелец <span className="text-foreground">Марк Левин</span></span>
          </div>
          <h1 className="mt-3 font-serif text-[40px] leading-[1.15]">{page.title}</h1>
          <div className="mt-3 flex items-center gap-4 text-[13px] text-muted-foreground">
            <span>обновлено {page.date}</span><span>·</span><span>6 мин чтения</span><span>·</span>
            <button onClick={() => setFollowing((f) => !f)} className="flex items-center gap-1 hover:text-foreground"><Eye {...I} size={14} /> {following ? "вы следите" : "следить"}</button>
            <button className="flex items-center gap-1 hover:text-foreground"><SmilePlus {...I} size={14} /> реакция</button>
          </div>

          {isMain ? (
            <>
              <P id="lead" className="mt-8 text-[18px] text-foreground/85">
                Клиент не должен смотреть на крутящееся колесо дольше, чем банк реально думает. Фиксируем, сколько мы ждём ответа шлюза и что делаем, когда ответа нет.
              </P>
              <div className="mt-6 border-l-[3px] border-sienna bg-canvas px-5 py-3.5 text-[15.5px]">
                <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Сведения</div>
                Решение действует для карточных платежей и Apple Pay. СБП переходит на новые таймауты после обновления API партнёра, ориентир — 1 ноября.
              </div>
              <h2 id="h-context" className="mt-10 font-serif text-[26px]">Контекст</h2>
              <P id="c1">
                Сейчас клиентский запрос держится открытым до 30 секунд. За сентябрь 2,1% платежей упали по таймауту на стороне мобильного клиента, хотя банк в итоге списал деньги. Это обращения в поддержку и ручные возвраты.
              </P>
              <P id="c2">Замеры за сентябрь по трём эквайерам:</P>
              <div className="mt-4 overflow-hidden">
                <table className="w-full text-left text-[15px]">
                  <thead className="text-[12.5px] uppercase tracking-[0.06em] text-muted-foreground">
                    <tr className="border-b border-border"><th className="py-3 pr-6 font-medium">Эквайер</th><th className="py-3 pr-6 font-medium">p99 ответа</th><th className="py-3 font-medium">Доля таймаутов</th></tr>
                  </thead>
                  <tbody>
                    {[["Альфа", "6,4 с", "1,8%"], ["Северный", "4,1 с", "0,6%"], ["Прайм", "9,7 с", "3,9%"]].map((r) => (
                      <tr key={r[0]} className="border-b border-border">{r.map((c, i) => <td key={i} className="py-3.5 pr-6">{c}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h2 id="h-decision" className="mt-10 font-serif text-[26px]">Решение</h2>
              <P id="d1">Делим ожидание на синхронную и асинхронную части:</P>
              <ul className="mt-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground">
                <li>синхронно ждём ответа шлюза не дольше 8 секунд;</li>
                <li>после этого возвращаем клиенту статус «обрабатывается» и опрашиваем шлюз каждые 3 секунды;</li>
                <li>через 2 минуты без ответа ставим платёж на ручную сверку и уведомляем дежурного.</li>
              </ul>
              <blockquote className="mt-8 border-y border-border py-5 font-serif text-[21px] leading-snug">
                <div className="mb-1 font-sans text-[12px] uppercase tracking-[0.08em] text-sienna">Решили</div>
                Синхронный таймаут — 8 секунд для всех эквайеров. Деньги клиента не теряются: всё, что дольше, уходит в асинхронную проверку.
              </blockquote>
              <h2 id="h-check" className="mt-10 font-serif text-[26px]">Как проверяем</h2>
              <P id="k1">
                Дашборд «Шлюз / таймауты» показывает долю асинхронных платежей. Если за неделю она превысит 4%, пересматриваем порог. Ответственный — дежурный платёжного контура.
              </P>
            </>
          ) : (
            <>
              <P id="lead" className="mt-8 text-[18px] text-foreground/85">
                Страница «{page.title}» в пространстве «{page.space}». Здесь собраны договорённости команды и ссылки на связанные решения.
              </P>
              <h2 id="h-context" className="mt-10 font-serif text-[26px]">Контекст</h2>
              <P id="c1">Документ поддерживает владелец пространства. Изменения проходят через черновик и публикуются после ревью одного коллеги.</P>
              <h2 id="h-decision" className="mt-10 font-serif text-[26px]">Решение</h2>
              <P id="d1">Следуем шагам ниже и отмечаем выполненное в задачах страницы.</P>
              <h2 id="h-check" className="mt-10 font-serif text-[26px]">Как проверяем</h2>
              <P id="k1">Раз в квартал владелец перечитывает страницу и подтверждает статус.</P>
            </>
          )}

          <div className="mt-12 flex gap-2 text-[13px]">
            {["платежи", "шлюз"].map((t) => <span key={t} className="rounded-md bg-canvas px-2 py-0.5 text-muted-foreground">#{t}</span>)}
          </div>
          <div className="mt-6 flex items-center gap-2.5 border-y border-border py-3 text-[14.5px]">
            <Paperclip {...I} className="text-muted-foreground" /> gateway-timeouts-sep.csv <span className="text-[13px] text-muted-foreground">48 КБ</span>
          </div>
          <div className="mt-6">
            <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Задачи</div>
            {[["Обновить конфиг шлюза в проде", "Олег Дробыш", "24 окт"], ["Добавить алерт на долю асинхронных", "Аня Савич", "27 окт"], ["Согласовать сроки с СБП-партнёром", "Марк Левин", "1 ноя"]].map((t, i) => (
              <label key={i} className="flex cursor-pointer items-center gap-3 py-2 text-[15px]">
                <input type="checkbox" checked={tasks[i]} onChange={() => setTasks((s) => s.map((v, j) => (j === i ? !v : v)))} className="size-4 accent-sienna" />
                <span className={`flex-1 ${tasks[i] ? "text-muted-foreground line-through" : ""}`}>{t[0]}</span>
                <span className="text-[13px] text-muted-foreground">{t[1]}</span>
                <span className="w-14 text-right text-[13px] text-muted-foreground">{t[2]}</span>
              </label>
            ))}
          </div>

          {selBtn && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={openThread}
              style={{ top: selBtn.top, left: selBtn.left }}
              className="animate-pop absolute z-10 flex items-center gap-1.5 rounded-lg bg-panel px-3 py-1.5 text-[13px] text-panel-fg shadow-md"
            >
              <MessageSquare {...I} size={14} /> Комментарий
            </button>
          )}
          {thread && (
            <div style={{ top: thread.top }} className="animate-pop absolute left-[calc(100%+24px)] z-20 w-[300px] rounded-xl border border-border bg-sheet p-4 text-[14px] leading-normal shadow-[0_4px_16px_-6px_oklch(0.2_0.01_70/0.18)]">
              {THREAD.map((m) => (
                <div key={m.when} className="mb-3">
                  <div className="flex items-center gap-2 text-[12.5px]"><Avatar name={m.who} size="size-5" /><span className="font-medium">{m.who}</span><span className="text-muted-foreground">{m.when}</span></div>
                  <p className="mt-1">{m.text}</p>
                </div>
              ))}
              <textarea placeholder="Ответить…" rows={2} className="w-full resize-none rounded-lg border border-border bg-canvas px-2.5 py-2 text-[14px] outline-none focus:border-sienna" />
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => setThread(null)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[13px] hover:bg-hover"><Check {...I} size={14} /> Закрыть нить</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <aside className="w-[180px] shrink-0">
        <div className="sticky top-10 pt-24 text-[13.5px]">
          <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">На странице</div>
          {[["h-context", "Контекст"], ["h-decision", "Решение"], ["h-check", "Как проверяем"]].map(([id, l]) => (
            <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })} className="block w-full rounded-md px-2 py-1 text-left text-muted-foreground hover:bg-hover hover:text-foreground">{l}</button>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ---------------- Editor ---------------- */
const SLASH: { group: string; items: [LucideIcon, string, string][] }[] = [
  { group: "Текст", items: [[Type, "Текст", "Обычный абзац"], [Heading2, "Заголовок", "Раздел страницы"], [List, "Список", "Маркированный список"], [SquareCheck, "Задача", "С исполнителем и сроком"]] },
  { group: "Вставки", items: [[PanelLeft, "Панель", "Сведения или предупреждение"], [Table, "Таблица", "Строки и столбцы"], [Columns2, "Два столбца", "Текст рядом"], [ChevronsDownUp, "Раскрывающийся блок", "Скрыть подробности"], [Image, "Картинка", "Загрузить или вставить"]] },
  { group: "Из документа", items: [[ListTree, "Оглавление", "Заголовки этой страницы"], [FolderTree, "Список дочерних", "Страницы ниже по дереву"], [FileSymlink, "Врезка страницы", "Фрагмент другой страницы"]] },
];

function EditScreen({ page, done }: { page: Page; done: () => void }) {
  const [title, setTitle] = useState(page.title);
  const [status, setStatus] = useState<Status>("draft");
  const [active, setActive] = useState(5);
  const [slash, setSlash] = useState(true);
  const flat = SLASH.flatMap((g) => g.items);

  useEffect(() => {
    if (!slash) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % flat.length); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + flat.length) % flat.length); }
      if (e.key === "Enter" || e.key === "Escape") { e.preventDefault(); setSlash(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [slash, flat.length]);

  let idx = -1;
  return (
    <div className="mx-auto max-w-[1160px] px-10 py-10">
      <div className="min-h-[760px] rounded-[2px] bg-sheet px-16 pb-24 pt-10">
        <div className="flex items-center justify-between text-[13px] text-muted-foreground">
          <span>Редактирование · <span className="text-foreground">сохранено</span></span>
          <div className="flex items-center gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="rounded-lg border border-border bg-sheet px-2.5 py-1.5 text-[13px] text-foreground">
              {(Object.keys(statusLabel) as Status[]).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
            <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-foreground hover:bg-hover"><Link2 {...I} size={14} /> Ссылка</button>
            <button onClick={done} className="rounded-lg bg-sienna px-3.5 py-1.5 font-medium text-sheet hover:opacity-90">Опубликовать</button>
          </div>
        </div>
        <div className="relative mx-auto mt-10 max-w-[720px] text-[16.5px] leading-[1.65]">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent font-serif text-[40px] leading-[1.15] outline-none" />
          <p className="mt-6" contentEditable suppressContentEditableWarning>
            Клиент не должен смотреть на крутящееся колесо дольше, чем банк реально думает. Фиксируем, сколько мы ждём ответа шлюза.
          </p>
          <p className="mt-4" onClick={() => setSlash(true)}>
            <span className="text-muted-foreground">/таб</span><span className="ml-px inline-block h-5 w-px translate-y-1 animate-pulse bg-foreground" />
          </p>
          {slash && (
            <div className="animate-pop absolute left-0 top-[150px] z-10 w-[340px] max-h-[460px] overflow-y-auto rounded-xl border border-border bg-sheet p-1.5 shadow-[0_6px_20px_-8px_oklch(0.2_0.01_70/0.22)]">
              {SLASH.map((g) => (
                <div key={g.group} className="py-1">
                  <div className="px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{g.group}</div>
                  {g.items.map(([Ic, name, hint]) => {
                    idx++;
                    const i = idx;
                    return (
                      <button key={name} onMouseEnter={() => setActive(i)} onClick={() => setSlash(false)}
                        className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left ${active === i ? "bg-slash" : ""}`}>
                        <span className="grid size-7 place-items-center rounded-md border border-border bg-sheet"><Ic {...I} /></span>
                        <span className="leading-tight">
                          <span className="block text-[14px]">{name}</span>
                          <span className="block text-[12.5px] text-muted-foreground">{hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-muted-foreground/70">Черновик: замеры за сентябрь по трём эквайерам, решение о 8 секундах, проверка через дашборд.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Search ---------------- */
function SearchPalette({ close, open }: { close: () => void; open: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const pages = useMemo(() => PAGES.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())), [q]);
  const spaces = useMemo(() => SPACES.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())), [q]);
  const total = pages.length + spaces.length;
  const choose = (i: number) => { if (i < pages.length) open(pages[i].id); else close(); };

  useEffect(() => setActive(0), [q]);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, total - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && total) choose(active);
    if (e.key === "Escape") close();
  };
  return (
    <div className="fixed inset-0 z-50 bg-panel/25 pt-[14vh]" onMouseDown={close}>
      <div onMouseDown={(e) => e.stopPropagation()} className="animate-pop mx-auto w-[640px] overflow-hidden rounded-xl bg-sheet shadow-[0_8px_24px_-10px_oklch(0.2_0.01_70/0.3)]">
        <div className="flex items-center gap-3 border-b border-border px-5">
          <Search {...I} size={20} className="text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Искать страницы и пространства" className="h-16 flex-1 bg-transparent text-[19px] outline-none placeholder:text-muted-foreground" />
          <button onClick={close} className="text-muted-foreground hover:text-foreground"><X {...I} /></button>
        </div>
        <div className="flex gap-2 border-b border-border px-5 py-2.5">
          {["Пространство", "Статус", "Автор", "Метка"].map((c) => (
            <button key={c} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[12.5px] text-muted-foreground hover:bg-hover">{c} <ChevronDown {...I} size={12} /></button>
          ))}
        </div>
        <div className="max-h-[420px] overflow-y-auto p-2">
          {pages.length > 0 && <div className="px-3 pb-1 pt-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Страницы</div>}
          {pages.map((p, i) => {
            const Ic = typeIcon[p.type];
            return (
              <button key={p.id} onMouseEnter={() => setActive(i)} onClick={() => choose(i)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${active === i ? "bg-slash" : ""}`}>
                <Ic {...I} className="text-muted-foreground" />
                <span className="text-[14.5px]">{p.title}</span>
                <span className="truncate text-[12.5px] text-muted-foreground">{p.path}</span>
                <span className="flex-1" />
                <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground"><Dot s={p.status} />{statusLabel[p.status]}</span>
              </button>
            );
          })}
          {spaces.length > 0 && <div className="px-3 pb-1 pt-3 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Пространства</div>}
          {spaces.map((s, j) => {
            const i = pages.length + j;
            return (
              <button key={s.id} onMouseEnter={() => setActive(i)} onClick={() => choose(i)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${active === i ? "bg-slash" : ""}`}>
                <span className="size-2.5 rounded-[2px] bg-st-archive" />
                <span className="text-[14.5px]">{s.name}</span>
                <span className="truncate text-[12.5px] text-muted-foreground">{s.goal}</span>
              </button>
            );
          })}
          {!total && <div className="px-3 py-6 text-center text-[14px] text-muted-foreground">Ничего не нашлось по «{q}»</div>}
        </div>
      </div>
    </div>
  );
}
