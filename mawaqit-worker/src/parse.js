// Turns the public Mawaqit mosque page into the timetable object the app uses (same shape as mawaqit-times.js).
// Shared by the Cloudflare Worker and tools/update-mawaqit-times.mjs. No network, no secrets.
export const MOSQUE_URL = "https://mawaqit.net/pt/baitul-falah-jam-e-masjid-amadora-2720-130-portugal";
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const OFFSET = /^[+-]\d{1,3}$/;
const ADHAN_INDEX = [0, 2, 3, 4, 5]; // adhan row: fajr shuruq dhuhr asr maghrib isha -> iqama order
const toMin = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const fromMin = m => { const x = ((m % 1440) + 1440) % 1440; return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };

function objectAfter(html, marker) {
  const at = html.indexOf(marker);
  if (at < 0) throw new Error(`"${marker.trim()}" not found in the page`);
  const start = html.indexOf("{", at);
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return JSON.parse(html.slice(start, i + 1));
  }
  throw new Error("confData object is not closed");
}

function monthDays(cal, label) {
  if (!Array.isArray(cal) || cal.length !== 12) throw new Error(`${label}: expected 12 months`);
  return cal.map((m, mi) => {
    const days = Object.keys(m).map(Number).sort((a, b) => a - b);
    if (!days.length || days[0] !== 1 || days.at(-1) !== days.length) throw new Error(`${label}: month ${mi + 1} has missing days`);
    return days.map(d => [d, m[String(d)]]);
  });
}

function adhanRows(cal) {
  return monthDays(cal, "calendar").map((days, mi) => days.map(([d, row]) => {
    if (!Array.isArray(row) || row.length !== 6 || !row.every(t => TIME.test(t))) throw new Error(`calendar: bad row ${mi + 1}/${d}`);
    return row;
  }));
}

// Mawaqit may store an iqama as a delay after the adhan ("+15"); it is resolved to a clock time here.
function iqamaRows(cal, adhan) {
  return monthDays(cal, "iqamaCalendar").map((days, mi) => days.map(([d, row], di) => {
    if (!Array.isArray(row) || row.length !== 5) throw new Error(`iqamaCalendar: bad row ${mi + 1}/${d}`);
    const a = adhan[mi]?.[di];
    if (!a) throw new Error(`iqamaCalendar: no adhan row for ${mi + 1}/${d}`);
    return row.map((t, i) => {
      if (TIME.test(t)) return t;
      if (OFFSET.test(t)) return fromMin(toMin(a[ADHAN_INDEX[i]]) + Number(t));
      throw new Error(`iqamaCalendar: bad time "${t}" at ${mi + 1}/${d}`);
    });
  }));
}

export function parseMawaqitPage(html, { url = MOSQUE_URL, today = new Date() } = {}) {
  const d = objectAfter(html, "confData = ");
  if (!TIME.test(d.jumua || "")) throw new Error("jumua time missing");
  const adhan = adhanRows(d.calendar);
  return {
    mosque: d.name,
    url,
    fetched: today.toISOString().slice(0, 10),
    timezone: d.timezone,
    jumua: d.jumua,
    adhan: adhan.map(m => m.map(r => r.join(" "))),
    iqama: iqamaRows(d.iqamaCalendar, adhan).map(m => m.map(r => r.join(" "))),
  };
}
