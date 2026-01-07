console.log("script.js 로드됨 ✅");

// ===== 요소 =====
const dateInput = document.getElementById("dateInput");
const memoInput = document.querySelector('input[type="text"]');
const moneyInput = document.querySelector('input[type="number"]');
const categorySelect = document.getElementById("category");
const addBtn = document.getElementById("addBtn");
const variableList = document.getElementById("variableList");

const progressPercentEl = document.getElementById("progressPercent");
const barFill = document.getElementById("barFill");
const barText = document.getElementById("barText");

// ===== 오늘 날짜 기본값 =====
(function setToday() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  if (dateInput) dateInput.value = `${yyyy}-${mm}-${dd}`;
})();

// ===== 월/예산 =====
function getSelectedMonth() {
  const v = dateInput?.value || "";
  return v ? v.slice(0, 7) : "";
}

function getBudgetForMonth(month) {
  const saved = localStorage.getItem(`monthlyBudget_${month}`);
  return saved ? Number(saved) : 0;
}

// ===== 포맷 =====
function formatWon(n) {
  const num = Number(n);
  return Number.isNaN(num) ? "0" : num.toLocaleString("ko-KR");
}

// ===== 합계 / 진행률 =====
function updateTotal() {
  let sum = 0;

  document.querySelectorAll("#variableList .item").forEach(item => {
    const text = item.querySelector("span")?.innerText || "";
    const m = text.match(/([\d,]+)원/);
    if (m) sum += Number(m[1].replaceAll(",", ""));
  });

  if (barText) barText.innerText = `${sum.toLocaleString("ko-KR")}원`;

  const month = getSelectedMonth();
  const budget = month ? getBudgetForMonth(month) : 0;

  if (budget > 0) {
    const percent = Math.min((sum / budget) * 100, 100);

    if (progressPercentEl) progressPercentEl.innerText = `${Math.floor(percent)}%`;
    if (barFill) barFill.style.width = percent + "%";
    if (barText) barText.style.color = percent >= 55 ? "#fff" : "#222";

  } else {
    if (progressPercentEl) progressPercentEl.innerText = "0%";
    if (barFill) barFill.style.width = "0%";
    if (barText) barText.style.color = "#222";
  }
}

// ===== 등록 =====
addBtn?.addEventListener("click", () => {
  const memo = memoInput?.value.trim();
  const money = moneyInput?.value.trim();
  const cat = categorySelect?.value;

  if (!memo || !money) {
    alert("지출 메모와 금액을 입력해줘!");
    return;
  }

  const li = document.createElement("li");
  li.className = "item";
  li.innerHTML = `
    <span>[${cat}] ${memo} - ${formatWon(money)}원</span>
    <button class="x" aria-label="삭제">X</button>
  `;
  variableList.prepend(li);

  memoInput.value = "";
  moneyInput.value = "";

  updateTotal();
});

// ===== 삭제 =====
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".x");
  if (!btn) return;

  const item = btn.closest(".item");
  if (!item) return;

  item.remove();
  updateTotal();
});

// ===== 날짜 변경 =====
dateInput?.addEventListener("change", updateTotal);

// ===== 시작 =====
updateTotal();
