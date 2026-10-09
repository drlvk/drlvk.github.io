/* ============================================================
   MAT 284 grade calculator
   Everything that changes from semester to semester is in COURSE.
   The form, the letter-scale table, and the group totals are all
   built from it, so there is nothing to edit in index.html.
   ============================================================ */

const COURSE = {
  term: "Fall 2026",

  // weight: percent of the course grade (must add up to 100)
  // note:   shown under the name; keep it short
  //
  // The weights in each group add up to that group's fixed share of the
  // grade (Coursework 32, Exams 68). The group's average is taken over the
  // boxes filled in so far, weighted by these numbers, and always counts
  // for that share, however many of the group's boxes are filled in.
  categories: [
    { id: "homework", group: "Coursework", name: "Homework",       weight: 10, note: "WeBWorK average; can exceed 100% with early-completion credit" },
    { id: "quizzes",  group: "Coursework", name: "Quizzes",        weight: 15, note: "Recitation quiz average" },
    { id: "ccq",      group: "Coursework", name: "Concept Checks", weight: 4,  note: "Average on Blackboard" },
    { id: "polls",    group: "Coursework", name: "Polls",          weight: 3,  note: "In-class participation rate" },
    { id: "exam1",    group: "Exams",      name: "Exam 1",         weight: 12, note: "Sep 16" },
    { id: "exam2",    group: "Exams",      name: "Exam 2",         weight: 12, note: "Oct 5" },
    { id: "exam3",    group: "Exams",      name: "Exam 3",         weight: 12, note: "Oct 26" },
    { id: "exam4",    group: "Exams",      name: "Exam 4",         weight: 12, note: "Nov 16" },
    { id: "final",    group: "Exams",      name: "Final exam",     weight: 20, note: "Dec 11, cumulative" },
  ],

  // [lowest score for the letter, letter], highest first
  scale: [
    [93, "A"], [90, "A−"], [87, "B+"], [83, "B"], [80, "B−"],
    [77, "C+"], [73, "C"], [70, "C−"], [60, "D"], [0, "F"],
  ],
};

/* ---------- helpers ---------------------------------------- */

const $ = (id) => document.getElementById(id);
const STORE = "mat284-grade-calculator-" + COURSE.term.toLowerCase().replace(/\s+/g, "-");

// Groups in the order they first appear, each with its share of the grade.
const GROUPS = [...new Set(COURSE.categories.map((c) => c.group))].map((name) => ({
  name,
  weight: COURSE.categories.filter((c) => c.group === name).reduce((s, c) => s + c.weight, 0),
}));

// Grades are shown rounded DOWN, so the page never shows 93.00 for a
// 92.996 that is still an A-minus.
const floor2 = (x) => (Math.floor(x * 100 + 1e-9) / 100).toFixed(2);

function letterFor(x) {
  for (const [min, letter] of COURSE.scale) if (x >= min) return letter;
  return COURSE.scale[COURSE.scale.length - 1][1];
}

function el(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const kid of kids) node.append(kid);
  return node;
}

// "a", "a and b", "a, b and c"
function joinAnd(items) {
  return items.length < 2 ? items.join("") : items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

let storage = null;
try {
  localStorage.setItem(STORE + "-test", "1");
  localStorage.removeItem(STORE + "-test");
  storage = localStorage;
} catch (e) { storage = null; }

/* ---------- build the page from COURSE --------------------- */

function buildForm() {
  const fields = $("fields");

  for (const g of GROUPS) {
    const cats = COURSE.categories.filter((c) => c.group === g.name);
    const fs = el("fieldset", { class: "group" },
      el("legend", {}, el("span", { text: g.name }), el("span", { class: "group-weight", text: g.weight + "% of grade" })));

    for (const c of cats) {
      const input = el("input", {
        id: c.id, name: c.id, type: "text", inputmode: "decimal",
        "aria-describedby": c.id + "-note " + c.id + "-err",
      });
      const row = el("div", { class: "row" },
        el("label", { for: c.id },
          el("span", { class: "name", text: c.name }),
          el("span", { class: "note", id: c.id + "-note" },
            el("span", { class: "weight", text: c.weight + "% of grade" }),
            document.createTextNode(c.note ? " · " + c.note : ""))),
        el("span", { class: "box" }, input, el("span", { class: "unit", "aria-hidden": "true", text: "%" })),
        el("p", { class: "err", id: c.id + "-err" }));
      fs.append(row);
    }
    fields.append(fs);
  }

  const sum = COURSE.categories.reduce((s, c) => s + c.weight, 0);
  if (Math.abs(sum - 100) > 1e-9) {
    fields.prepend(el("p", { class: "warn", text: "Check the settings in script.js: the weights add up to " + sum + "%, not 100%." }));
  }
}

function buildScale() {
  const rows = COURSE.scale.map(([min, letter], i) => {
    const top = i === 0 ? null : COURSE.scale[i - 1][0];
    const range = top === null ? min + " and above" : min + " to below " + top;
    return el("tr", {}, el("th", { scope: "row", text: letter }), el("td", { text: range }));
  });
  $("scale").append(el("table", { class: "scale" },
    el("thead", {}, el("tr", {}, el("th", { scope: "col", text: "Letter" }), el("th", { scope: "col", text: "Course grade" }))),
    el("tbody", {}, ...rows)));
}

/* ---------- read, validate, compute ------------------------ */

// Only checks that each entry is a number. Any value is accepted.
function readScores() {
  const entered = [];
  for (const c of COURSE.categories) {
    const input = $(c.id);
    const err = $(c.id + "-err");
    const raw = input.value.trim().replace(/%$/, "").trim();
    let msg = "";

    if (raw !== "") {
      if (/^-?(\d+(\.\d*)?|\.\d+)$/.test(raw)) entered.push({ c, v: parseFloat(raw) });
      else msg = "Enter a number, like 87.5";
    }
    err.textContent = msg;
    if (msg) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    input.closest(".row").classList.toggle("has-error", msg !== "");
  }
  return entered;
}

// Each group's average is weighted over its entered boxes only, then the
// group averages are combined with the fixed group shares (32 and 68).
// A group with nothing entered yet is left out until it has a score.
function compute(entered) {
  const done = entered.reduce((s, e) => s + e.c.weight, 0);   // percent of course entered
  const groups = GROUPS.map((g) => {
    const mine = entered.filter((e) => e.c.group === g.name);
    const w = mine.reduce((s, e) => s + e.c.weight, 0);
    const avg = w > 0 ? mine.reduce((s, e) => s + e.c.weight * e.v, 0) / w : null;
    return { ...g, avg };
  });
  const present = groups.filter((g) => g.avg !== null);
  const share = present.reduce((s, g) => s + g.weight, 0);
  const grade = share > 0 ? present.reduce((s, g) => s + g.weight * g.avg, 0) / share : null;
  return { done, groups, grade, complete: entered.length === COURSE.categories.length };
}

/* ---------- render ----------------------------------------- */

// The phone strip shows only when there is a grade and the panel is off screen.
let hasGrade = false, panelVisible = false;
function updatePeek() {
  $("peek").classList.toggle("is-on", hasGrade && !panelVisible);
}

function setLabel(text) {
  $("result-label").textContent = text;
  $("peek-label").textContent = text;
}

function render() {
  const entered = readScores();
  const { done, groups, grade, complete } = compute(entered);
  $("bar-fill").style.width = Math.min(Math.max(done, 0), 100) + "%";
  hasGrade = grade !== null;
  updatePeek();

  if (grade === null) {
    setLabel("Your grade");
    $("pct").textContent = "—";
    $("letter").textContent = "";
    $("basis").textContent = "Enter at least one score to see your grade.";
    return;
  }

  const letter = letterFor(grade);
  $("pct").textContent = $("peek-pct").textContent = floor2(grade) + "%";
  $("letter").textContent = $("peek-letter").textContent = letter;

  if (complete) {
    setLabel("Course grade");
    $("basis").textContent = "Every category is entered, so this is the full course grade.";
    return;
  }

  setLabel("Grade so far");
  const missing = groups.filter((g) => g.avg === null);
  const present = groups.filter((g) => g.avg !== null);
  const split = missing.length
    ? "Nothing entered under " + joinAnd(missing.map((g) => g.name)) + " yet, so this is your " +
      joinAnd(present.map((g) => g.name)) + " average alone."
    : "The " + joinAnd(groups.map((g) => g.name)) + " averages count for " +
      joinAnd(groups.map((g) => fmtPct(g.weight))) + " of the grade.";
  $("basis").textContent = "Based on the " + fmtPct(done) + " of the course grade you have entered. " + split;
}

function fmtPct(x) {
  return (Math.round(x * 10) / 10) + "%";
}

/* ---------- save and restore ------------------------------- */

function save() {
  if (!storage) return;
  const data = {};
  for (const c of COURSE.categories) data[c.id] = $(c.id).value;
  try { storage.setItem(STORE, JSON.stringify(data)); } catch (e) { /* storage full or blocked */ }
}

function restore() {
  if (!storage) return;
  try {
    const data = JSON.parse(storage.getItem(STORE) || "{}");
    for (const c of COURSE.categories) if (typeof data[c.id] === "string") $(c.id).value = data[c.id];
  } catch (e) { /* ignore bad data */ }
}

/* ---------- start ------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  $("term").textContent = COURSE.term;
  $("term-foot").textContent = COURSE.term;
  buildForm();
  buildScale();
  restore();
  if (storage) $("saved").hidden = false;

  const form = $("calc");
  form.addEventListener("input", () => { render(); save(); });
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("reset", () => {
    // the browser clears the boxes after this event, so wait a tick
    setTimeout(() => {
      if (storage) { try { storage.removeItem(STORE); } catch (e) {} }
      render();
      $(COURSE.categories[0].id).focus();
    }, 0);
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      panelVisible = entries[0].isIntersecting;
      updatePeek();
    }).observe($("result"));
  }

  render();
});
