// Combien de dodo? — all the site logic lives in this file.
// A "dodo" is one night: the count is the number of days between today and the target date.

const day = (y, m, d) => new Date(y, m - 1, d);

// Next occurrence (today included) of a yearly date computed by fn(year).
const yearly = (fn) => (today) => {
  const d = fn(today.getFullYear());
  return d < today ? fn(today.getFullYear() + 1) : d;
};

// Next given weekday (0 = Sunday … 6 = Saturday), today included.
const nextWeekday = (wd) => (today) =>
  day(today.getFullYear(), today.getMonth() + 1, today.getDate() + ((wd - today.getDay() + 7) % 7));

// n-th Sunday of a month (n = -1: last one).
function sunday(y, m, n) {
  if (n < 0) {
    const last = day(y, m + 1, 0);
    return day(y, m, last.getDate() - last.getDay());
  }
  const first = day(y, m, 1);
  return day(y, m, 1 + ((7 - first.getDay()) % 7) + 7 * (n - 1));
}

// Easter Sunday (anonymous Gregorian algorithm).
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return day(y, Math.floor(n / 31), (n % 31) + 1);
}

// Mother's Day (France): last Sunday of May, or first Sunday of June if that is Pentecost.
function mothersDay(y) {
  const d = sunday(y, 5, -1);
  const p = easter(y);
  const pentecost = day(y, p.getMonth() + 1, p.getDate() + 49);
  return d.getTime() === pentecost.getTime() ? sunday(y, 6, 1) : d;
}

// Configured events. Adding an entry here is enough to create the /slug page.
// `label` and `today` are user-facing French text.
const EVENTS = {
  "noel":            { label: "Noël", emoji: "🎄", next: yearly((y) => day(y, 12, 25)) },
  "nouvel-an":       { label: "le Nouvel An", emoji: "🎆", next: yearly((y) => day(y, 1, 1)) },
  "week-end":        { label: "le week-end", emoji: "🛝", next: (t) => (t.getDay() % 6 === 0 ? t : nextWeekday(6)(t)), today: "C'est le week-end !" },
  "mercredi":        { label: "mercredi", emoji: "🎨", next: nextWeekday(3) },
  "epiphanie":       { label: "la galette des rois", emoji: "👑", next: yearly((y) => day(y, 1, 6)) },
  "chandeleur":      { label: "la Chandeleur", emoji: "🥞", next: yearly((y) => day(y, 2, 2)) },
  "saint-valentin":  { label: "la Saint-Valentin", emoji: "💌", next: yearly((y) => day(y, 2, 14)) },
  "poisson-d-avril": { label: "le poisson d'avril", emoji: "🐟", next: yearly((y) => day(y, 4, 1)) },
  "paques":          { label: "Pâques", emoji: "🥚", next: yearly(easter) },
  "fete-des-meres":  { label: "la fête des mères", emoji: "💐", next: yearly(mothersDay) },
  "fete-des-peres":  { label: "la fête des pères", emoji: "👔", next: yearly((y) => sunday(y, 6, 3)) },
  "printemps":       { label: "le printemps", emoji: "🌷", next: yearly((y) => day(y, 3, 20)) },
  "ete":             { label: "l'été", emoji: "☀️", next: yearly((y) => day(y, 6, 21)) },
  "14-juillet":      { label: "le 14 juillet", emoji: "🎇", next: yearly((y) => day(y, 7, 14)) },
  "halloween":       { label: "Halloween", emoji: "🎃", next: yearly((y) => day(y, 10, 31)) },
  "automne":         { label: "l'automne", emoji: "🍂", next: yearly((y) => day(y, 9, 23)) },
  "hiver":           { label: "l'hiver", emoji: "⛄", next: yearly((y) => day(y, 12, 21)) },
};

// Nights between two local dates (via UTC to ignore DST changes).
const nights = (from, to) =>
  Math.round((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
              Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / 864e5);

// "2027-05-12" -> Date, or null if invalid.
function parseDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  if (!m) return null;
  const d = day(+m[1], +m[2], +m[3]);
  return d.getMonth() === m[2] - 1 && d.getDate() === +m[3] ? d : null;
}

// Resolves a URL to { label, emoji, date, todayText }, or null.
function resolve(path, today) {
  const slug = path.replace(/^\/+|\/+$/g, "").toLowerCase();
  const d = parseDate(slug);
  if (d) return { label: "le " + d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), emoji: "📅", date: d };
  if (/^\d{4}$/.test(slug)) return { label: slug, emoji: "🎉", date: day(+slug, 1, 1) };
  const e = EVENTS[slug];
  return e && { label: e.label, emoji: e.emoji, date: e.next(today), todayText: e.today };
}

function render() {
  const $ = (id) => document.getElementById(id);
  const now = new Date();
  const today = day(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const path = location.pathname;
  // Lets style.css theme each event: [data-dodo="noel"] { … }
  document.body.dataset.dodo = path.replace(/^\/+|\/+$/g, "").toLowerCase() || "home";

  if (path.replace(/\/+/g, "") === "") {
    // Date picker: go to /YYYY-MM-DD.
    $("form").addEventListener("submit", (e) => {
      e.preventDefault();
      location.href = "/" + e.target.elements.d.value;
    });
    $("events").innerHTML = Object.entries(EVENTS)
      .map(([slug, e]) => [slug, e, nights(today, e.next(today))])
      .sort((a, b) => a[2] - b[2])
      .map(([slug, e, n]) => {
      return `<li><a href="/${slug}">${e.emoji} /${slug}<small>${n === 0 ? "aujourd'hui !" : n + " dodo" + (n > 1 ? "s" : "")}</small></a></li>`;
    }).join("");
    $("home").hidden = false;
    return;
  }

  const ev = resolve(path, today);
  $("countdown").hidden = false;
  if (!ev) {
    document.title = "Dodo inconnu";
    $("title").textContent = "🤔 Je ne connais pas ce dodo…";
    return;
  }

  const n = nights(today, ev.date);
  const title = `Combien de dodo avant ${ev.label} ?`;
  document.title = title;
  $("title").textContent = `${ev.emoji} ${title}`;
  if (n > 1) $("count").innerHTML = `Encore <strong>${n}</strong> dodos`;
  else if (n === 1) $("count").innerHTML = `Plus que <strong>1</strong> dodo !`;
  else if (n === 0) $("count").textContent = ev.todayText || "C'est aujourd'hui ! 🎉";
  else $("count").innerHTML = `C'était il y a <strong>${-n}</strong> dodo${n < -1 ? "s" : ""}`;
  $("moons").textContent = n > 0 && n <= 60 ? "🌙".repeat(n) : "";
  $("date").textContent = ev.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// Browser: render the page. Node: export the date logic for testing.
if (typeof document !== "undefined") render();
else module.exports = { EVENTS, resolve, nights, parseDate, easter, mothersDay, day };
