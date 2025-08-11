const resultContent = document.getElementById('resultContent');
const backBtn = document.getElementById('backBtn');

const storedResult = localStorage.getItem('uploadResult');

if (storedResult) {
    try {
        const resultObj = JSON.parse(storedResult);
        resultContent.textContent = JSON.stringify(resultObj, null, 2);
    } catch (e) {
        resultContent.textContent = storedResult;
    }
} else {
    resultContent.textContent = "No submission result found.";
}

backBtn.addEventListener('click', () => {
    window.location.href = "dashboard.html";
});
