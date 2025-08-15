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


sessionStorage.removeItem("fromIndex");

// 🔹 BACK & REFRESH HANDLING START 🔹
// Agar user page refresh ya direct access kare, index.html par redirect
if (!sessionStorage.getItem("fromIndex")) {
    sessionStorage.setItem("fromIndex", "true"); // Mark as visited
} 

window.onload = function() {
    // Replace history to prevent back to previous pages
    history.replaceState(null, null, "instruction.html");
};

// Back button handle karna
window.addEventListener('popstate', function() {
    window.location.replace("index.html");
});

// 🔹 BACK & REFRESH HANDLING END 🔹


// Set total questions & time
const totalQuestions = 3;  // Total questions
const totalTime = 1;      // Total time in minutes

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
    // Set sessionStorage flag to allow dashboard access
    sessionStorage.setItem("fromInstruction", "true");
    window.location.href = "dashboard.html";
});

