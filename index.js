// function login(event) {
//     event.preventDefault(); // ✅ Enter press hone par page reload rokta hai

//     // 🔴 CHANGE: Corrected button ID (B capital)
//     const loginBtn = document.getElementById("loginBtn");
//     const errorMsg = document.getElementById("errorMsg");

//     // 🔴 ADD: Disable button + change style during login process
//     loginBtn.disabled = true;
//     loginBtn.textContent = "Logging in...";  // Show loading text
//     loginBtn.style.backgroundColor = "#999";  
//     loginBtn.style.cursor = "not-allowed";

//     const username = document.getElementById("username").value.trim();
//     const password = document.getElementById("password").value;

//     // 🔴 ADD: Debug log to confirm input captured
//     console.log("🔎 Debug: Username:", username, "Password:", password);

//     fetch('https://video-analysis-backend-2l85.onrender.com/login', { // 🔴 CHANGE: Ensure correct backend URL
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password })
//     })
//     .then(res => res.json())
//     .then(data => {
//         console.log("✅ API Response:", data); // 🔴 ADD: Log API response

//         if (data.success) {
//             // ✅ Save user details to localStorage
//             localStorage.setItem("username", data.username);
//             localStorage.setItem("mobile", data.mobile);
//             localStorage.setItem("name", data.name);

//             window.location.href = "instruction.html"; 
//         } else {
//             errorMsg.textContent = "❌ " + data.message;
//             enableLoginButton(loginBtn);  // 🔴 ADD: Re-enable button on failure
//         }
//     })
//     .catch(err => {
//         console.error("⚠️ Login Error:", err); // 🔴 ADD: Error log for debugging
//         errorMsg.textContent = "⚠️ Server error. Try again.";
//         enableLoginButton(loginBtn);  
//     });
// }

// // 🔴 ADD: Helper function to enable button again
// function enableLoginButton(loginBtn) {
//     loginBtn.disabled = false;
//     loginBtn.textContent = "Login";
//     loginBtn.style.backgroundColor = "#128C7E"; 
//     loginBtn.style.cursor = "pointer";
// }

// // 🔴 ADD: Form submit event listener for Enter key + click
// document.getElementById("loginForm").addEventListener("submit", login);





function login(event) {
    event.preventDefault(); // ✅ Enter press hone par page reload rokta hai

    const loginBtn = document.getElementById("loginBtn");
    const errorMsg = document.getElementById("errorMsg");

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";  // Show loading text
    loginBtn.style.backgroundColor = "#999";  
    loginBtn.style.cursor = "not-allowed";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    console.log("🔎 Debug: Username:", username, "Password:", password);

    fetch('https://video-analysis-backend-2l85.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        console.log("✅ API Response:", data);

        if (data.success) {
            // ✅ Save user details to localStorage — ensure all fields exist
            localStorage.setItem("username", data.username || "");
            localStorage.setItem("mobile", data.mobile || "");
            localStorage.setItem("name", data.name || "");

            window.location.href = "instruction.html"; 
        } else {
            errorMsg.textContent = "❌ " + data.message;
            enableLoginButton(loginBtn);
        }
    })
    .catch(err => {
        console.error("⚠️ Login Error:", err);
        errorMsg.textContent = "⚠️ Server error. Try again.";
        enableLoginButton(loginBtn);
    });
}

function enableLoginButton(loginBtn) {
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
    loginBtn.style.backgroundColor = "#128C7E"; 
    loginBtn.style.cursor = "pointer";
}

document.getElementById("loginForm").addEventListener("submit", login);

