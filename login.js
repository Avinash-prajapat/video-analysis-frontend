function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");

    // ✅ Check credentials
    if (user.trim() !== "" && pass === "1234") {
        window.location.href = "index.html"; // Go to main page
    } else {
        errorMsg.textContent = "❌ Invalid username or password!";
    }
}
