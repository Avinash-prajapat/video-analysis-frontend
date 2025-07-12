// function login() {
//     const user = document.getElementById("username").value;
//     const pass = document.getElementById("password").value;
//     const errorMsg = document.getElementById("errorMsg");

//     // ✅ Check credentials
//     if (user.trim() !== "" && pass === "1234") {
//         window.location.href = "dashboard.html"; // Go to main page
//     } else {
//         errorMsg.textContent = "❌ Invalid username or password!";
//     }
// }

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");

    fetch('https://video-analysis-backend-2l85.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // ✅ Store login name in localStorage for later use
            localStorage.setItem("username", username);  // for video upload
            localStorage.setItem("name", data.name);      // optional
            window.location.href = "dashboard.html";      // redirect
        } else {
            errorMsg.textContent = "❌ " + data.message;
        }
    })
    .catch(err => {
        console.error("Login Error:", err);
        errorMsg.textContent = "⚠️ Server error. Try again.";
    });
}
