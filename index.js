// function login(event) {
//     event.preventDefault(); // Enter press hone par reload na ho

//     const loginBtn = document.getElementById("loginBtn");
//     const errorMsg = document.getElementById("errorMsg");

//     // Disable button while logging in
//     loginBtn.disabled = true;
//     loginBtn.textContent = "Logging in...";
//     loginBtn.style.backgroundColor = "#999";  
//     loginBtn.style.cursor = "not-allowed";

//     const username = document.getElementById("email").value.trim();
//     const password = document.getElementById("password").value;

//     fetch('https://copy-video-analysis-backend.onrender.com/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password })
//     })
//     .then(res => res.json())
//     .then(data => {
//         if (data.success) {
//             // Save user details
//             localStorage.setItem("username", data.username || "");
//             localStorage.setItem("mobile", data.mobile || "");
//             localStorage.setItem("name", data.name || "");

//             // Session flag
//             sessionStorage.setItem("isLoggedIn", "true");

//             window.location.href = "instruction.html"; 
//         } else {
//             errorMsg.textContent = "❌ " + data.message;
//             enableLoginButton(loginBtn); // Reset button
//         }
//     })
//     .catch(err => {
//         console.error("⚠️ Login Error:", err);
//         errorMsg.textContent = "⚠️ Server error. Try again.";
//         enableLoginButton(loginBtn); // Reset button
//     });
// }

// function enableLoginButton(loginBtn) {
//     loginBtn.disabled = false;
//     loginBtn.textContent = "Login";
//     loginBtn.style.backgroundColor = "#128C7E"; 
//     loginBtn.style.cursor = "pointer";
// }

// document.getElementById("loginForm").addEventListener("submit", login);

function login(event) {
    event.preventDefault(); // Enter press hone par reload na ho

    const loginBtn = document.getElementById("loginBtn");
    const errorMsg = document.getElementById("errorMsg");

    // Disable button while logging in - with spinner
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span> Logging in...';
    loginBtn.style.backgroundColor = "#999";  
    loginBtn.style.cursor = "not-allowed";

    const username = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Basic validation
    if (!username || !password) {
        errorMsg.textContent = "❌ Please enter both email and password";
        enableLoginButton(loginBtn);
        return;
    }

    // Add timeout to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    fetch('https://copy-video-analysis-backend.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
    })
    .then(res => {
        clearTimeout(timeoutId);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (data.success) {
            // Save user details
            localStorage.setItem("username", data.username || "");
            localStorage.setItem("mobile", data.mobile || "");
            localStorage.setItem("name", data.name || "");
            localStorage.setItem("email", username); // Save email too

            // Session flag
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("loginTime", Date.now().toString());

            // Show success message
            loginBtn.innerHTML = '✓ Success!';
            loginBtn.style.backgroundColor = "#4CAF50";
            
            // Redirect after brief delay
            setTimeout(() => {
                window.location.href = "instruction.html";
            }, 500);
        } else {
            errorMsg.textContent = "❌ " + (data.message || "Login failed");
            enableLoginButton(loginBtn);
        }
    })
    .catch(err => {
        clearTimeout(timeoutId);
        console.error("⚠️ Login Error:", err);
        
        if (err.name === 'AbortError') {
            errorMsg.textContent = "⚠️ Request timeout. Server not responding.";
        } else {
            errorMsg.textContent = "⚠️ Server error. Please try again.";
        }
        
        enableLoginButton(loginBtn);
    });
}

function enableLoginButton(loginBtn) {
    loginBtn.disabled = false;
    loginBtn.innerHTML = "Login";
    loginBtn.style.backgroundColor = "#128C7E"; 
    loginBtn.style.cursor = "pointer";
}

// CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
    .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Remove any existing listeners and add fresh one
const loginForm = document.getElementById("loginForm");
loginForm.removeEventListener("submit", login);
loginForm.addEventListener("submit", login);

