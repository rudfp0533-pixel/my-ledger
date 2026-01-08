console.log("settings.js 로드됨 ✅");

// ===== 월별 목표(기존 기능) =====
const monthInput = document.getElementById("monthInput");
const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const saveMsg = document.getElementById("saveMsg");

function setThisMonthDefault() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  if (monthInput && !monthInput.value) monthInput.value = `${yyyy}-${mm}`;
}
setThisMonthDefault();

function loadBudgetForMonth(month) {
  const saved = localStorage.getItem(`monthlyBudget_${month}`);
  return saved ? Number(saved) : 0;
}

function showBudgetForSelectedMonth() {
  const m = monthInput?.value;
  if (!m) return;
  const v = loadBudgetForMonth(m);
  if (budgetInput) budgetInput.value = v ? String(v) : "";
}

monthInput?.addEventListener("change", showBudgetForSelectedMonth);
showBudgetForSelectedMonth();

saveBudgetBtn?.addEventListener("click", () => {
  const m = monthInput?.value;
  const v = budgetInput?.value;

  if (!m) {
    alert("월을 선택해줘!");
    return;
  }
  const num = Number(v);
  if (!v || Number.isNaN(num) || num < 0) {
    alert("목표금액을 올바르게 입력해줘!");
    return;
  }

  localStorage.setItem(`monthlyBudget_${m}`, String(num));
  if (saveMsg) saveMsg.textContent = "저장 완료 ✅";
  setTimeout(() => {
    if (saveMsg) saveMsg.textContent = "";
  }, 1500);
});

// ===== 자주 쓰는 카드 =====
const favList = document.getElementById("favList");
const cardNameInput = document.getElementById("cardNameInput");
const addCardBtn = document.getElementById("addCardBtn");
const resetCardsBtn = document.getElementById("resetCardsBtn");
const cardMsg = document.getElementById("cardMsg");
const typeBtns = document.querySelectorAll(".type-btn");

const LS_FAV = "favoriteCards";                 // [{name, type}]
const LS_DEF_CREDIT = "defaultCard_credit";     // "롯데"
const LS_DEF_CHECK = "defaultCard_check";       // "농협"

let currentType = "credit"; // credit | check

function defaultSeed() {
  return [
    { name: "농협", type: "check" },
    { name: "롯데", type: "credit" },
  ];
}

function loadFavCards() {
  try {
    const raw = localStorage.getItem(LS_FAV);
    if (!raw) return defaultSeed();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultSeed();
    return parsed
      .filter(x => x && typeof x.name === "string" && (x.type === "credit" || x.type === "check"))
      .map(x => ({ name: x.name.trim(), type: x.type }));
  } catch {
    return defaultSeed();
  }
}

function saveFavCards(list) {
  localStorage.setItem(LS_FAV, JSON.stringify(list));
}

function getDefaultName(type) {
  return localStorage.getItem(type === "credit" ? LS_DEF_CREDIT : LS_DEF_CHECK) || "";
}

function setDefaultName(type, name) {
  localStorage.setItem(type === "credit" ? LS_DEF_CREDIT : LS_DEF_CHECK, name);
}

function typeLabel(t) {
  return t === "credit" ? "신용" : "체크";
}

function showMsg(el, text) {
  if (!el) return;
  el.textContent = text;
  setTimeout(() => {
    el.textContent = "";
  }, 1500);
}

function normalizeName(s) {
  return (s || "").trim().replace(/\s+/g, " ");
}

function renderFavCards() {
  if (!favList) return;

  const list = loadFavCards();
  const defCredit = getDefaultName("credit");
  const defCheck = getDefaultName("check");

  // 보기 좋게 정렬: 신용 먼저, 체크 다음, 이름순
  const sorted = [...list].sort((a, b) => {
    if (a.type !== b.type) return a.type === "credit" ? -1 : 1;
    return a.name.localeCompare(b.name, "ko");
  });

  favList.innerHTML = "";

  sorted.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "fav-item";

    const tag = document.createElement("div");
    tag.className = "fav-tag";
    tag.textContent = `${item.name} (${typeLabel(item.type)})`;

    const actions = document.createElement("div");
    actions.className = "fav-actions";

    const star = document.createElement("button");
    star.type = "button";
    star.className = "star";
    star.setAttribute("aria-label", "기본 카드로 설정");

    const isDefault =
      (item.type === "credit" && item.name === defCredit) ||
      (item.type === "check" && item.name === defCheck);

    if (isDefault) star.classList.add("active");
    star.textContent = "★";

    star.addEventListener("click", () => {
      setDefaultName(item.type, item.name);
      showMsg(cardMsg, "기본 카드 설정 ✅");
      renderFavCards();
    });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "del";
    del.setAttribute("aria-label", "삭제");
    del.textContent = "X";

    del.addEventListener("click", () => {
      const now = loadFavCards();
      // 정렬된 화면 idx는 원본 idx가 아닐 수 있으니 name+type으로 삭제
      const next = now.filter(x => !(x.name === item.name && x.type === item.type));
      saveFavCards(next);

      // 기본값이 삭제된 카드였으면 기본값도 제거
      if (item.type === "credit" && getDefaultName("credit") === item.name) {
        localStorage.removeItem(LS_DEF_CREDIT);
      }
      if (item.type === "check" && getDefaultName("check") === item.name) {
        localStorage.removeItem(LS_DEF_CHECK);
      }

      showMsg(cardMsg, "삭제 완료 ✅");
      renderFavCards();
    });

    actions.appendChild(star);
    actions.appendChild(del);

    li.appendChild(tag);
    li.appendChild(actions);
    favList.appendChild(li);
  });
}

typeBtns?.forEach(btn => {
  btn.addEventListener("click", () => {
    typeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type === "check" ? "check" : "credit";
  });
});

addCardBtn?.addEventListener("click", () => {
  const name = normalizeName(cardNameInput?.value);
  if (!name) {
    alert("카드명을 입력해줘!");
    return;
  }

  const list = loadFavCards();
  const exists = list.some(x => x.name === name && x.type === currentType);
  if (exists) {
    showMsg(cardMsg, "이미 있어 ✅");
    return;
  }

  list.push({ name, type: currentType });
  saveFavCards(list);

  // 해당 타입에 기본값이 없으면 방금 추가한 걸 기본으로
  if (!getDefaultName(currentType)) setDefaultName(currentType, name);

  if (cardNameInput) cardNameInput.value = "";
  showMsg(cardMsg, "추가 완료 ✅");
  renderFavCards();
});

resetCardsBtn?.addEventListener("click", () => {
  const ok = confirm("자주 쓰는 카드 목록을 초기화할까?");
  if (!ok) return;

  const seed = defaultSeed();
  saveFavCards(seed);
  setDefaultName("credit", seed.find(x => x.type === "credit")?.name || "");
  setDefaultName("check", seed.find(x => x.type === "check")?.name || "");
  showMsg(cardMsg, "초기화 완료 ✅");
  renderFavCards();
});

// 시작 렌더
renderFavCards();
