document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();  // 🔒 Prevent default form submission

    const name = document.getElementById('name').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const msg = document.getElementById('message');

    // 📡 Send signup data to backend
    fetch('https://video-analysis-backend-2l85.onrender.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            msg.style.color = 'green';
            msg.innerText = data.message;

            // ✅ Optionally store data
            localStorage.setItem("username", username);
            localStorage.setItem("name", name);

            setTimeout(() => {
                window.location.href = "index.html";  // 🔄 Redirect to login
            }, 1500);
        } else {
            msg.style.color = 'red';
            msg.innerText = data.message;
        }
    })
    .catch(err => {
        console.error('Signup Error:', err);
        msg.style.color = 'red';
        msg.innerText = "⚠️ Signup failed. Try again.";
    });
});
