export type Status = "draft" | "live" | "review" | "archive";
export const statusLabel: Record<Status, string> = {
  draft: "черновик",
  live: "в силе",
  review: "на пересмотре",
  archive: "архив",
};
export const statusDot: Record<Status, string> = {
  draft: "bg-st-draft",
  live: "bg-st-live",
  review: "bg-st-review",
  archive: "bg-st-archive",
};

export type PageType = "doc" | "decision" | "howto" | "meeting";
export type Page = {
  id: string;
  title: string;
  space: string;
  type: PageType;
  status: Status;
  date: string;
  path: string;
};

export const SPACES = [
  { id: "pay", name: "Платёжный контур", goal: "Как устроены платежи и как мы их меняем" },
  { id: "people", name: "Люди и процессы", goal: "Найм, онбординг и как мы работаем вместе" },
];

export const PAGES: Page[] = [
  { id: "overview", title: "Обзор", space: "Платёжный контур", type: "doc", status: "live", date: "12 сен", path: "Платёжный контур" },
  { id: "timeouts", title: "Таймауты шлюза", space: "Платёжный контур", type: "decision", status: "live", date: "сегодня", path: "Платёжный контур / Решения" },
  { id: "retry", title: "Повтор платежа", space: "Платёжный контур", type: "decision", status: "review", date: "18 окт", path: "Платёжный контур / Решения" },
  { id: "release", title: "Выкладка релиза", space: "Платёжный контур", type: "howto", status: "live", date: "3 окт", path: "Платёжный контур / Инструкции" },
  { id: "sync", title: "Синк 21 октября", space: "Платёжный контур", type: "meeting", status: "draft", date: "21 окт", path: "Платёжный контур / Встречи" },
  { id: "onboard", title: "Онбординг инженера", space: "Люди и процессы", type: "howto", status: "live", date: "2 окт", path: "Люди и процессы" },
  { id: "hiring", title: "Как мы нанимаем", space: "Люди и процессы", type: "doc", status: "archive", date: "4 мая", path: "Люди и процессы" },
];

export const byId = (id: string) => PAGES.find((p) => p.id === id)!;

export type TreeNode = { id?: string; label: string; children?: TreeNode[] };
export const TREE: TreeNode[] = [
  { id: "overview", label: "Обзор" },
  { label: "Решения", children: [{ id: "timeouts", label: "Таймауты шлюза" }, { id: "retry", label: "Повтор платежа" }] },
  { label: "Инструкции", children: [{ id: "release", label: "Выкладка релиза" }] },
  { label: "Встречи", children: [{ id: "sync", label: "Синк 21 октября" }] },
];

export const HOME_LISTS: { title: string; items: { id: string; time: string }[] }[] = [
  { title: "Продолжить", items: [{ id: "timeouts", time: "10 мин назад" }, { id: "sync", time: "вчера" }, { id: "onboard", time: "пн" }] },
  { title: "Задачи на мне", items: [{ id: "retry", time: "до 25 окт" }, { id: "release", time: "до 28 окт" }, { id: "sync", time: "до 30 окт" }] },
  { title: "Избранное", items: [{ id: "overview", time: "12 сен" }, { id: "release", time: "3 окт" }] },
  { title: "Отслеживаемое", items: [{ id: "timeouts", time: "сегодня" }, { id: "hiring", time: "4 мая" }] },
];

export const UPDATES = [
  {
    date: "22 октября",
    author: "Марк Левин",
    body: [
      "Таймауты шлюза переведены в статус «в силе». С понедельника клиентский запрос ждёт ответа банка не дольше 8 секунд, дальше — асинхронная проверка статуса.",
      "Старый порог в 30 секунд остаётся только для СБП до конца месяца, пока партнёр не обновит API.",
    ],
  },
  {
    date: "18 октября",
    author: "Аня Савич",
    body: [
      "Вынесла на пересмотр «Повтор платежа»: идемпотентные ключи живут 24 часа, а повтор после смены карты их обходит.",
      "Прошу до пятницы оставить комментарии в разделе «Риски», после этого соберём синк.",
    ],
  },
  {
    date: "3 октября",
    author: "Олег Дробыш",
    body: [
      "Обновил инструкцию по выкладке релиза: добавили шаг с прогревом пула соединений и ручную проверку вебхуков.",
      "Откат теперь занимает одну команду, расписал её в конце страницы.",
    ],
  },
];
