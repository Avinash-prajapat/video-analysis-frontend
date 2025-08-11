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
    

    <script>
        // Page load hone par check karo aur redirect karo agar message nahi hai
        window.onload = function() {
            const message = localStorage.getItem('uploadResultMessage');
            if (!message) {
                // Agar message nahi mila toh login page par bhej do
                window.location.href = "index.html";
            } else {
                // Agar message mil gaya toh dikhado
                document.getElementById('resultMessage').textContent = message;
            }
        };

      
    </script>
</body>
</html>
