// sessionStorage.removeItem("fromIndex");

// //  Set total questions & time
// const totalQuestions = 3;  // Total questions
// const totalTime = 1;      // Total time in minutes

// document.getElementById("totalQuestions").textContent = totalQuestions;
// document.getElementById("totalTime").textContent = totalTime;

// //  Checkbox & Button References
// const agreeCheck = document.getElementById("agreeCheck");
// const agreeBtn = document.getElementById("agreeBtn");

// //  Enable button only if checkbox is checked
// agreeCheck.addEventListener("change", () => {
//     agreeBtn.disabled = !agreeCheck.checked;
// });

// //  Redirect to dashboard when agreed
// agreeBtn.addEventListener("click", () => {
//     window.location.href = "dashboard.html";
// });


// Clear previous index flag
sessionStorage.removeItem("fromIndex");

// Set total questions & time
const totalQuestions = 3;  // Total questions
const totalTime = 1;       // Total time in minutes

document.getElementById("totalQuestions").textContent = totalQuestions;
document.getElementById("totalTime").textContent = totalTime;

// Checkbox & Button References
const agreeCheck = document.getElementById("agreeCheck");
const agreeBtn = document.getElementById("agreeBtn");

// Enable button only if checkbox is checked
agreeCheck.addEventListener("change", () => {
    agreeBtn.disabled = !agreeCheck.checked;
});

// Redirect to dashboard when agreed
agreeBtn.addEventListener("click", () => {
    // 🔹 Set sessionStorage flag so dashboard knows user came from instruction
    sessionStorage.setItem("fromInstruction", "true");

    // Redirect to dashboard
    //window.location.href = "dashboard.html";
    window.location.replace("dashboard.html");
});

