<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Submission Result</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            text-align: center;
        }
        #resultMessage {
            font-size: 20px;
            margin-bottom: 20px;
            white-space: pre-wrap;
        }
        button {
            padding: 10px 25px;
            font-size: 16px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>Submission Result</h1>
    <div id="resultMessage">Loading...</div>
    <button onclick="goBack()">Back to Dashboard</button>

    <script>
        // Fetch message from localStorage
        const message = localStorage.getItem('uploadResultMessage');
        const resultDiv = document.getElementById('resultMessage');
        if (message) {
            resultDiv.textContent = message;
        } else {
            resultDiv.textContent = "No submission status available.";
        }

        // Go back function
        function goBack() {
            window.location.href = "dashboard.html";
        }
    </script>
</body>
</html>
