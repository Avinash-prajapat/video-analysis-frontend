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
