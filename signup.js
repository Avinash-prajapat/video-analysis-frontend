document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    fetch('https://video-analysis-backend-2l85.onrender.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, username, password })
    })
    .then(res => res.json())
    .then(data => {
        const msg = document.getElementById('message');
        if (data.success) {
            msg.style.color = 'green';
            msg.innerText = data.message;
            setTimeout(() => { window.location.href = "index.html"; }, 1500);
        } else {
            msg.style.color = 'red';
            msg.innerText = data.message;
        }
    })
    .catch(err => {
        console.error('Signup Error:', err);
        document.getElementById('message').innerText = "⚠️ Something went wrong.";
    });
});

// 👁 Toggle Password Visibility
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordField = document.getElementById('password');
    passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
});
