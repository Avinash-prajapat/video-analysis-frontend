const resultMessage = document.getElementById('resultMessage');
const backBtn = document.getElementById('backBtn');

const message = localStorage.getItem('uploadResultMessage');

if (message) {
    resultMessage.textContent = message;
} else {
    resultMessage.textContent = "No submission status available.";
}

backBtn.addEventListener('click', () => {
    window.location.href = "dashboard.html";
});
