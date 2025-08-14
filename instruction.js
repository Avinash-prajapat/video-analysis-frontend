// 🟢 Total Questions & Time (ye tum hardcode kar sakte ho ya sessionStorage se la sakte ho)
const totalQuestions = 3; // apne hisaab se change karo
const totalTime = 15; // minutes

document.getElementById("totalQuestions").textContent = totalQuestions;
document.getElementById("totalTime").textContent = totalTime;

// 🟢 Checkbox & Button References
const agreeCheck = document.getElementById("agreeCheck");
const agreeBtn = document.getElementById("agreeBtn");

// ✅ Enable button only if checkbox is checked
agreeCheck.addEventListener("change", () => {
    agreeBtn.disabled = !agreeCheck.checked;
});

// 🚀 Redirect to dashboard on click
agreeBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html"; // Interview page
});

