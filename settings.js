console.log("settings.js 로드됨 ✅");

const monthInput = document.getElementById("monthInput");
const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const saveMsg = document.getElementById("saveMsg");

function keyOf(month) {
  return `monthlyBudget_${month}`; // 예: monthlyBudget_2026-01
}

function loadForSelectedMonth() {
  const m = monthInput.value;
  if (!m) return;

  const saved = localStorage.getItem(keyOf(m));
  budgetInput.value = saved ? Number(saved) : "";
  saveMsg.innerText = "";
}

// 기본값: 이번 달
const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, "0");
monthInput.value = `${yyyy}-${mm}`;
loadForSelectedMonth();

monthInput.addEventListener("change", loadForSelectedMonth);

saveBudgetBtn.addEventListener("click", () => {
  console.log("저장 버튼 눌림 ✅");

  const m = monthInput.value;
  const v = Number(budgetInput.value);

  if (!m) return alert("월을 선택해줘!");
  if (!v || v <= 0) return alert("목표금액을 숫자로 입력해줘! (예: 300000)");

  localStorage.setItem(keyOf(m), String(v));
  saveMsg.innerText = `${m} 목표 저장됨 ✅ (${v.toLocaleString("ko-KR")}원)`;
});
