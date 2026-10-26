const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") !== "true";
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.textContent = open ? "Close" : "Menu";
  navLinks.dataset.open = String(open);
});
navLinks?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.dataset.open = "false";
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.textContent = "Menu";
  }),
);
const form = document.querySelector("[data-inquiry]");
function connectBrief(title, collect) {
  if (!form) return;
  form
    .querySelectorAll('[type="submit"]')
    .forEach((button) => (button.disabled = false));
  const result = document.getElementById("brief-result"),
    area = document.getElementById("brief-text"),
    email = document.getElementById("email-brief"),
    status = document.getElementById("copy-status");
  const update = () => {
    email.href =
      "mailto:josephjilovec@pm.me?subject=" +
      encodeURIComponent(title) +
      "&body=" +
      encodeURIComponent(area.value);
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    area.value =
      title +
      "\n\n" +
      collect(new FormData(form)) +
      "\n\nI understand this service is in development. Please let me know whether a suitable pilot is available and agree the scope before any engagement.";
    update();
    result.hidden = false;
    document.getElementById("brief-heading").focus();
    status.textContent =
      "Draft created in this browser. Nothing has been sent.";
  });
  area.addEventListener("input", update);
  document.getElementById("copy-brief").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(area.value);
      status.textContent =
        "Copied. Paste the draft into your preferred email app.";
    } catch {
      area.focus();
      area.select();
      status.textContent =
        "Select and copy the draft above using your device’s copy command.";
    }
  });
  form.addEventListener("input", (e) => {
    if (e.target.closest("#brief-result")) return;
    result.hidden = true;
    status.textContent = "";
  });
}
function observeChapters(selector, onChange) {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      const active = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (active) onChange(active.target.dataset.chapter);
    },
    { rootMargin: "-18% 0px -36% 0px", threshold: [0, 0.25, 0.5] },
  );
  document.querySelectorAll(selector).forEach((e) => observer.observe(e));
}
const routeData = {
  balanced: [
    ["Arrive & settle", "A short wander. An easy first evening."],
    ["Follow your curiosity", "One neighborhood, then an open afternoon."],
    [
      "One meaningful anchor",
      "A cultural or food interest, if the details fit.",
    ],
    ["Move once", "Allow time for the transfer and a quiet arrival."],
    ["A different horizon", "A local walk with a weather alternative."],
    ["Leave with space", "Keep the departure day simple."],
  ],
  slow: [
    ["Arrive & settle", "A meal, a small walk, and time to arrive."],
    ["Find your corner", "Stay near the base. Leave the afternoon open."],
    ["An unclaimed day", "A favorite place again, or nothing planned."],
    ["Move once", "One transfer, with no competing reservation."],
    ["Linger by the coast", "A short outing only if it feels right."],
    ["Leave with space", "Keep the departure day simple."],
  ],
};
function selectPace(pace) {
  document
    .querySelectorAll("[data-pace]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.pace === pace)),
    );
  document.querySelectorAll("#journey-route li").forEach((li, i) => {
    li.querySelector("h3").textContent = routeData[pace][i][0];
    li.querySelector("p").textContent = routeData[pace][i][1];
  });
  document.getElementById("pace-note").textContent =
    pace === "slow"
      ? "Take it slowly: fewer fixed anchors, a fully open day, and a single change of base."
      : "A little more exploring: a few considered anchors, with an open afternoon and a single change of base.";
  const radios = document.querySelectorAll("[name=pace]");
  radios[pace === "slow" ? 0 : 1].checked = true;
  document.getElementById("brief-result").hidden = true;
  document.getElementById("copy-status").textContent = "";
}
document
  .querySelectorAll("[data-pace]")
  .forEach((b) =>
    b.addEventListener("click", () => selectPace(b.dataset.pace)),
  );
document.querySelectorAll("[name=pace]").forEach((e, i) =>
  e.addEventListener("change", () => {
    if (e.checked) selectPace(i === 0 ? "slow" : "balanced");
  }),
);
let journeyStep = 0;
const panels = [...document.querySelectorAll("[data-step-panel]")];
function setStep(step, focus = true) {
  journeyStep = step;
  panels.forEach((p, i) => (p.hidden = i !== step));
  document.querySelectorAll("[data-go-step]").forEach((b) => {
    if (Number(b.dataset.goStep) === step)
      b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  });
  document.getElementById("previous-step").hidden = step === 0;
  document.getElementById("next-step").hidden = step === 2;
  document.getElementById("journey-submit").hidden = step !== 2;
  document.getElementById("brief-result").hidden = true;
  if (focus) panels[step].querySelector("legend").focus();
}
setStep(0, false);
document
  .getElementById("next-step")
  .addEventListener("click", () => setStep(Math.min(2, journeyStep + 1)));
document
  .getElementById("previous-step")
  .addEventListener("click", () => setStep(Math.max(0, journeyStep - 1)));
document
  .querySelectorAll("[data-go-step]")
  .forEach((b) =>
    b.addEventListener("click", () => setStep(Number(b.dataset.goStep))),
  );
connectBrief(
  "Experience Elsewhere — a first journey note",
  (d) =>
    "My travel rhythm: " +
    d.get("pace") +
    "\nInterests: " +
    (d.getAll("interests").join(", ") || "To explore together") +
    "\nRegion: " +
    (d.get("region") || "Not decided") +
    "\nApproximate trip length: " +
    d.get("length") +
    "\nThe feeling I am looking for: " +
    (d.get("context") || "To discuss") +
    "\n\nI am interested in a planning conversation, not making a reservation. I will verify current details and book directly with providers.",
);
