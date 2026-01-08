console.log("script.js 로드됨 ✅");

// ===== 요소 =====
const dateInput = document.getElementById("dateInput");
const memoInput = document.querySelector('input[type="text"]');
const moneyInput = document.querySelector('input[type="number"]');

const paymentInput = document.getElementById("payment");
const payButtons = document.querySelectorAll(".pay-card");

const addBtn = document.getElementById("addBtn");
const variableList = document.getElementById("variableList");

const progressPercentEl = document.getElementById("progressPercent");
const barFillEl = document.getElementById("barFill");
const barTextEl = document.getElementById("barText");

// ===== 기본 방어 (버튼이 안 눌릴 때 1초 컷 진단) =====
console.log("[진단] addBtn:", addBtn);
console.log("[진단] payButtons 개수:", payButtons?.length);
console.log("[진단] barFillEl:", barFillEl, "barTextEl:", barTextEl);

// ===== 오늘 날짜 기본값 =====
(function setToday() {
  if (!dateInput) return;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  dateInput.value = `${yyyy}-${mm}-${dd}`;
})();

// ===== 월/예산 =====
function getSelectedMonth() {
  const v = dateInput?.value || "";
  return v ? v.slice(0, 7) : ""; // "YYYY-MM"
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

// ===== 진행률 바 테마(그라데이션) =====
function setBarTheme(percentRaw) {
  const root = document.documentElement;

  if (!Number.isFinite(percentRaw) || percentRaw <= 0) {
    root.style.setProperty("--barFill", "linear-gradient(90deg, #111, #222)");
    return;
  }

  if (percentRaw < 80) {
    root.style.setProperty("--barFill", "linear-gradient(90deg, #111, #222)");
    return;
  }

  if (percentRaw <= 100) {
    root.style.setProperty("--barFill", "linear-gradient(90deg, #111, #f2c94c)");
    return;
  }

  root.style.setProperty("--barFill", "linear-gradient(90deg, #f2c94c, #f2998a)");
}

// ===== 합계 / 진행률 =====
function calcVariableSumFromDOM() {
  let sum = 0;
  document.querySelectorAll("#variableList .item").forEach((item) => {
    const text = item.querySelector("span")?.innerText || "";
    const m = text.match(/([\d,]+)원/);
    if (m) sum += Number(m[1].replaceAll(",", ""));
  });
  return sum;
}

function updateTotal() {
  const sum = calcVariableSumFromDOM();

  const month = getSelectedMonth();
  const budget = month ? getBudgetForMonth(month) : 0;

  // 요소 없으면 그냥 종료
  if (!progressPercentEl || !barFillEl || !barTextEl) return;

  // 목표 없을 때
  if (!budget || budget <= 0) {
    setBarTheme(0);
    progressPercentEl.innerText = "0%";
    barFillEl.style.width = "0%";
    barTextEl.innerText = `${formatWon(sum)}원 (목표없음)`;
    barTextEl.style.color = "#000200ff";
    return;
  }

  const percentRaw = (sum / budget) * 100;
  setBarTheme(percentRaw);

  // 퍼센트 표시
  progressPercentEl.innerText =
    percentRaw <= 100 ? `${Math.floor(percentRaw)}%` : "초과";

  // 바 너비는 0~100 고정 (초과여도 100%로 꽉 채움)
  const w = percentRaw > 100 ? 100 : Math.max(0, percentRaw);
  barFillEl.style.width = `${w}%`;

  // 바 텍스트
if (sum <= budget) {
  barTextEl.innerText = `${formatWon(sum)} / ${formatWon(budget)}원`;

  // ✅ 채워진 비율 기준으로 글씨색 결정
  if (percentRaw <= 5) {
    // 거의 안 찼을 때 (흰 배경)
    barTextEl.style.color = "#000501ff";
  } else {
    // 바 위에 글씨가 올라간 경우
    barTextEl.style.color = "#e96b05ff";
  }

} else {
  // 초과
  const over = sum - budget;
  barTextEl.innerText = `목표 초과 +${formatWon(over)}원`;

  // 초과 그라데이션은 밝으니까 검정
  barTextEl.style.color = "#222";
}
}

// ===== 결제수단 선택 =====
function bindPaymentButtons() {
  if (!payButtons || payButtons.length === 0) {
    console.warn("⚠️ .pay-card 버튼을 못 찾았어. HTML에서 class/pay-card 확인해줘.");
    return;
  }

  payButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      // data-payment 없으면 선택 불가(등록이 막혀서 버튼이 안 눌린 것처럼 느껴짐)
      const val = btn.dataset.payment;
      if (!val) {
        console.warn("⚠️ 이 버튼에 data-payment가 없어:", btn);
      }

      payButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (paymentInput) paymentInput.value = val || "";

      console.log("결제수단 선택:", paymentInput?.value);
    });
  });
}
bindPaymentButtons();

// ===== 등록 =====
function addExpense() {
  const memo = memoInput?.value?.trim() || "";
  const money = moneyInput?.value?.trim() || "";
  const pay = paymentInput?.value || "";

  if (!memo || !money) {
    alert("지출 메모와 금액을 입력해줘!");
    return;
  }
  if (!pay) {
    alert("결제수단(카드/현금/체크)을 선택해줘!");
    return;
  }

  const amount = Number(money);
  if (!Number.isFinite(amount) || amount <= 0) {
    alert("금액을 올바르게 입력해줘! (0보다 큰 숫자)");
    return;
  }

  const payLabel = pay === "card" ? "카드" : pay === "cash" ? "현금" : "체크";

  const li = document.createElement("li");
  li.className = "item";
  li.innerHTML = `
    <span>[${payLabel}] ${memo} - ${formatWon(amount)}원</span>
    <button type="button" class="x" aria-label="삭제">X</button>
  `;

  variableList?.prepend(li);

  // 입력 초기화
  if (memoInput) memoInput.value = "";
  if (moneyInput) moneyInput.value = "";

  updateTotal();
}

// 등록 버튼
if (addBtn) {
  addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addExpense();
  });
} else {
  console.warn("⚠️ addBtn을 못 찾았어. HTML에서 id='addBtn' 확인해줘.");
}

// Enter로 등록(금액칸에서 엔터)
if (moneyInput) {
  moneyInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addExpense();
  });
}

// ===== 삭제 (이벤트 위임) =====
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".x");
  if (!btn) return;
  btn.closest(".item")?.remove();
  updateTotal();
});

// ===== 날짜 변경 =====
if (dateInput) {
  dateInput.addEventListener("change", () => {
    updateTotal();
  });
}

// ===== 시작 =====
updateTotal();
