//  Set total questions & time
const totalQuestions = 3;  // Total questions
const totalTime = 15;      // Total time in minutes

document.getElementById("totalQuestions").textContent = totalQuestions;
document.getElementById("totalTime").textContent = totalTime;

//  Checkbox & Button References
const agreeCheck = document.getElementById("agreeCheck");
const agreeBtn = document.getElementById("agreeBtn");

//  Enable button only if checkbox is checked
agreeCheck.addEventListener("change", () => {
    agreeBtn.disabled = !agreeCheck.checked;
});

//  Redirect to dashboard when agreed
agreeBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
});
