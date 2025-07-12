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
            localStorage.setItem("username", username);
            localStorage.setItem("name", data.name);
            window.location.href = "dashboard.html";
        } else {
            errorMsg.textContent = "❌ " + data.message;
        }
    })
    .catch(err => {
        console.error("Login Error:", err);
        errorMsg.textContent = "⚠️ Server error. Try again.";
    });
}
