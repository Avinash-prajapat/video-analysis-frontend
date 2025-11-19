function login(event) {
    event.preventDefault(); // Enter press hone par reload na ho

    const loginBtn = document.getElementById("loginBtn");
    const errorMsg = document.getElementById("errorMsg");

    // Disable button while logging in
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
    loginBtn.style.backgroundColor = "#999";  
    loginBtn.style.cursor = "not-allowed";

    const username = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    fetch('https://copy-video-analysis-backend.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Save user details
            localStorage.setItem("username", data.username || "");
            localStorage.setItem("mobile", data.mobile || "");
            localStorage.setItem("name", data.name || "");

            // Session flag
            sessionStorage.setItem("isLoggedIn", "true");

            window.location.href = "instruction.html"; 
        } else {
            errorMsg.textContent = "❌ " + data.message;
            enableLoginButton(loginBtn); // Reset button
        }
    })
    .catch(err => {
        console.error("⚠️ Login Error:", err);
        errorMsg.textContent = "⚠️ Server error. Try again.";
        enableLoginButton(loginBtn); // Reset button
    });
}

function enableLoginButton(loginBtn) {
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
    loginBtn.style.backgroundColor = "#128C7E"; 
    loginBtn.style.cursor = "pointer";
}

document.getElementById("loginForm").addEventListener("submit", login);


