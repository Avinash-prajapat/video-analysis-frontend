// Fetch the result container and back button elements
const resultContent = document.getElementById('resultContent');
const backBtn = document.getElementById('backBtn');

// Get the result JSON string from localStorage
const storedResult = localStorage.getItem('uploadResult');

if (storedResult) {
    try {
        // Parse JSON and pretty-print with indentation
        const resultObj = JSON.parse(storedResult);
        resultContent.textContent = JSON.stringify(resultObj, null, 2);
    } catch (e) {
        // If parsing fails, show raw text
        resultContent.textContent = storedResult;
    }
} else {
    resultContent.textContent = "No submission result found.";
}

// Back button returns user to dashboard page
backBtn.addEventListener('click', () => {
    window.location.href = "dashboard.html";
});
