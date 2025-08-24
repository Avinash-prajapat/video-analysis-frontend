// 👉 Listen for the signup form submission
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault(); // ❌ Prevent the page from reloading when form is submitted

    // ✅ Get input values from the form
    const name = document.getElementById('name').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // ✅ Get the signup button
    const signupBtn = document.getElementById("signupBtn");

    // 🔒 Disable the button to stop multiple clicks
    signupBtn.disabled = true;
    signupBtn.textContent = "Signing up...";   // Change button text
    signupBtn.style.backgroundColor = "#999";  // Change button color to grey
    signupBtn.style.cursor = "not-allowed";    // Change cursor style

    // 🌐 Send signup data to the backend (API call)
    fetch('https://video-analysis-backend-2l85.onrender.com/signup', {
        method: 'POST',  // Use POST request
        headers: { 'Content-Type': 'application/json' }, // Send JSON data
        body: JSON.stringify({ name, mobile, username, password }) // Convert form data to JSON
    })
    .then(res => res.json()) // Convert response into JSON
    .then(data => {
        const msg = document.getElementById('message'); // Get the message box
        if (data.success) {
            // ✅ If signup is successful
            msg.style.color = 'green';
            msg.innerText = data.message; // Show success message
            setTimeout(() => { 
                window.location.href = "index.html"; // Redirect to login page after 1.5 sec
            }, 1500);
        } else {
            // ❌ If signup failed (e.g. username already exists)
            msg.style.color = 'red';
            msg.innerText = data.message;
            enablesignupButton(signupBtn); // Reset the button back to normal
        }
    })
    .catch(err => {
        // ⚠️ If there is a server error or network issue
        console.error('Signup Error:', err);
        document.getElementById('message').innerText = "⚠️ Something went wrong.";
        enablesignupButton(signupBtn); // Reset the button back to normal
    });
});

// 🔄 Function to enable/reset the button back to normal
function enablesignupButton(signupBtn) {
    signupBtn.disabled = false;             // Enable button again
    signupBtn.textContent = "Signup";       // Reset button text (was "Login", should be "Signup")
    signupBtn.style.backgroundColor = "#128C7E"; // Green color
    signupBtn.style.cursor = "pointer";     // Normal cursor
}

// 👁 Toggle Password Visibility
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordField = document.getElementById('password');
    // If input type is "password", change to "text", otherwise back to "password"
    passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
});

