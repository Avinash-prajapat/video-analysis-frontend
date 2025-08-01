const form = document.getElementById('signupForm');
const signupBtn = document.getElementById('signupBtn');
const message = document.getElementById('message');

// 🔴 NEW: Password toggle
document.getElementById('togglePassword').addEventListener('click', () => {
  const passwordField = document.getElementById('password');
  passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
});

// ✅ Signup form submit event
form.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // 🔴 NEW: Frontend validation
  if (!name || !mobile || !username || !password) {
    message.style.color = 'red';
    message.innerText = "⚠️ All fields are required!";
    return;
  }

  // 🔴 Disable button during request
  signupBtn.disabled = true;
  signupBtn.textContent = "Signing up...";
  signupBtn.style.backgroundColor = "#999";
  signupBtn.style.cursor = "not-allowed";

  fetch('https://video-analysis-backend-2l85.onrender.com/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mobile, username, password })
  })
  .then(res => res.json())
  .then(data => {
      if (data.success) {
          message.style.color = 'green';
          message.innerText = "✅ " + data.message;
          setTimeout(() => window.location.href = "index.html", 1500);
      } else {
          message.style.color = 'red';
          message.innerText = "❌ " + data.message;
          enableSignupButton();
      }
  })
  .catch(err => {
      console.error('Signup Error:', err);
      message.style.color = 'red';
      message.innerText = "⚠️ Server error. Try again.";
      enableSignupButton();
  });
});

// ♻️ Re-enable signup button
function enableSignupButton() {
  signupBtn.disabled = false;
  signupBtn.textContent = "Signup";
  signupBtn.style.backgroundColor = "#128C7E";
  signupBtn.style.cursor = "pointer";
}
