document.addEventListener('DOMContentLoaded', () => {
    // 🎯 DOM Elements: Fetching elements after DOM is fully loaded
    const videoElement = document.getElementById('userVideo');
    const startBtn = document.getElementById('startBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const chatMessages = document.getElementById('chatMessages');
    const currentQuestion = document.getElementById('currentQuestion');
    const typingIndicator = document.getElementById('typingIndicator'); // Optional

    let questions = [];  // Dynamically filled based on subject
    let selectedSubject = "";

    const questionBank = {
        ml: [
            "What is supervised learning?",
            "What is overfitting?",
            "Explain SVM briefly."
        ],
        ds: [
            "What is a binary tree?",
            "Explain stack vs queue.",
            "What is a hash table?"
        ],
        oops: [
            "What is inheritance?",
            "Explain polymorphism.",
            "What is encapsulation?"
        ],
        cn: [
            "What is OSI model?",
            "What is TCP vs UDP?",
            "Explain IP addressing."
        ],
        dbms: [
            "What is normalization?",
            "What is ACID property?",
            "What is indexing?"
        ]
    };

    let mediaStream;         // Stores video+audio stream
    let mediaRecorder;       // Object that records the stream
    let recordedChunks = []; // Stores chunks of recorded video
    let recognition;         // For speech-to-text
    let isRecording = false;
    let currentQuestionIndex = 0;  // Tracks current question

    // 🧠 Initialize speech recognition (if browser supports it)
    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        addMessage(transcript, 'user');
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (interimTranscript) {
                    const lastMessage = chatMessages.lastChild;
                    if (lastMessage && lastMessage.classList.contains('interim')) {
                        lastMessage.textContent = interimTranscript;
                    } else {
                        const interimElement = document.createElement('div');
                        interimElement.className = 'message user interim';
                        interimElement.textContent = interimTranscript;
                        chatMessages.appendChild(interimElement);
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                stopRecording(); // Optional: stop recording on error
            };
        } else {
            console.warn('Speech recognition not supported');
            addMessage("Speech recognition not supported in this browser", 'system');
        }
    }

    // Function to add messages to chat
    function addMessage(text, sender) {
        // Remove any temporary (interim) messages
        const interimMessages = document.querySelectorAll('.interim');
        interimMessages.forEach(msg => msg.remove());

        // Create new chat message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Display current question from the selected subject
    function displayCurrentQuestion() {
        if (currentQuestionIndex < questions.length) {
            const questionText = `Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex]}`;
            currentQuestion.textContent = questionText;
            addMessage(questionText, 'system');
        } else {
            currentQuestion.textContent = "All questions completed. Ready to submit.";
            nextBtn.disabled = true;
            submitBtn.disabled = false;
        }
    }

    // Start recording video, audio, speech-to-text, and timer
    async function startRecording() {
        try {
            selectedSubject = document.getElementById('subjectSelect').value;
            if (!selectedSubject) {
                alert("⚠️ Please select a subject before starting!");
                return;
            }
            questions = questionBank[selectedSubject];
            currentQuestionIndex = 0; // Reset question index on start

            // ✅ Access camera & microphone
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            videoElement.srcObject = mediaStream;

            // ✅ Setup MediaRecorder
            mediaRecorder = new MediaRecorder(mediaStream);
            recordedChunks = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            mediaRecorder.start(100);

            // ✅ Start speech recognition if available
            if (recognition) {
                recognition.start();
            }
            isRecording = true;

            startBtn.disabled = true;
            nextBtn.disabled = false;
            submitBtn.disabled = true;

            displayCurrentQuestion();

            // ✅ TIMER LOGIC (1 minute)
            let timeLeft = 60; // seconds
            const timerText = document.getElementById('timerText');
            const timerBar = document.getElementById('timerBar');

            const timerInterval = setInterval(() => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerText.textContent = `${minutes}:${seconds.toString().padStart(2,'0')}`;

                // Update timer bar width
                timerBar.style.width = `${(timeLeft / 60) * 100}%`;

                timeLeft--;

                // Auto-submit when timer ends
                if (timeLeft < 0) {
                    clearInterval(timerInterval);
                    addMessage("⏰ Time is up! Auto-submitting your video.", 'system');
                    uploadRecordedVideo();
                }
            }, 1000);

        } catch (error) {
            console.error('Error accessing media devices:', error);
            addMessage("Error accessing camera/microphone", 'system');
        }
    }

    // Move to next question
    function nextQuestion() {
        if (isRecording) {
            currentQuestionIndex++;
            displayCurrentQuestion();

            if (currentQuestionIndex >= questions.length) {
                nextBtn.disabled = true;
            }
        }
    }

    // Upload recorded video to server
    function uploadRecordedVideo() {
        if (recordedChunks.length === 0) {
            alert("⚠️ No recording available to upload!");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        const username = localStorage.getItem("username") || "user";
        const mobile = localStorage.getItem("mobile") || "0000000000";

        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const finalFilename = `video.webm`;  // simple filename
        const file = new File([blob], finalFilename, { type: 'video/webm' });

        const formData = new FormData();
        formData.append("video", file);
        formData.append("username", username);
        formData.append("mobile", mobile);

        fetch("https://video-analysis-backend-2l85.onrender.com/upload", {
            method: "POST",
            body: formData
        })
        .then(res => {
            if (!res.ok) throw new Error("❌ Server error");
            return res.json();
        })
        .then(data => {
            console.log("✅ Upload success:", data);
            const message = "✅ Thank You! Your Submission has been sent successfully!";
            localStorage.setItem('uploadResultMessage', message);

            // Optional: trigger analysis
            fetch("http://localhost:5000/analyze-drive", {
                method: "GET",
                mode: "no-cors"
            }).catch(err => console.warn("Analyze-drive trigger failed:", err));

            // Redirect to result page
            sessionStorage.setItem("fromDashboard", "true");
            window.location.replace("result.html");
        })
        .catch(err => {
            console.error("❌ Upload failed:", err);
            const errorMsg = "⚠️ Something went wrong. Please try again.";
            localStorage.setItem('uploadResultMessage', errorMsg);
            sessionStorage.setItem("fromDashboard", "true");
            window.location.replace("result.html");
        });
    }

    // ✅ Event listeners
    startBtn.addEventListener('click', () => {
        console.log("Start button clicked");
        startRecording();
    });

    nextBtn.addEventListener('click', () => {
        console.log("Next button clicked");
        nextQuestion();
    });

    submitBtn.addEventListener('click', () => {
        console.log("Submit button clicked");
        uploadRecordedVideo();
    });

    // Initialize speech recognition
    initSpeechRecognition();
});
























// // 🚫 Disable refresh and back navigation
// (function preventBackAndRefresh() {
//     window.history.pushState(null, "", window.location.href);
//     window.onpopstate = function () {
//         window.location.href = "login.html"; // back press → login
//     };
//     document.addEventListener("keydown", function (e) {
//         if ((e.ctrlKey && (e.key === 'r' || e.key === 'R')) || e.keyCode === 116) {
//             e.preventDefault(); // prevent refresh
//             window.location.href = "login.html"; // refresh → login
//         }
//     });
//     window.addEventListener("beforeunload", function (e) {
//         e.preventDefault();
//         e.returnValue = "";
//         window.location.href = "login.html";
//     });
// })();

// // 🎯 DOM Elements
// const videoElement = document.getElementById('userVideo');
// const startBtn = document.getElementById('startBtn');
// const nextBtn = document.getElementById('nextBtn');
// const submitBtn = document.getElementById('submitBtn');
// const chatMessages = document.getElementById('chatMessages');
// const currentQuestion = document.getElementById('currentQuestion');

// let questions = [];
// let selectedSubject = "";

// const questionBank = {
//     ml: ["What is supervised learning?", "What is overfitting?", "Explain SVM briefly."],
//     ds: ["What is a binary tree?", "Explain stack vs queue.", "What is a hash table?"],
//     oops: ["What is inheritance?", "Explain polymorphism.", "What is encapsulation?"],
//     cn: ["What is OSI model?", "What is TCP vs UDP?", "Explain IP addressing."],
//     dbms: ["What is normalization?", "What is ACID property?", "What is indexing?"]
// };

// let mediaStream;
// let mediaRecorder;
// let recordedChunks = [];
// let recognition;
// let isRecording = false;
// let currentQuestionIndex = 0;

// // 🧠 Initialize Speech Recognition
// function initSpeechRecognition() {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//         recognition = new SpeechRecognition();
//         recognition.continuous = true;
//         recognition.interimResults = true;

//         recognition.onresult = (event) => {
//             let interimTranscript = '';
//             for (let i = event.resultIndex; i < event.results.length; i++) {
//                 const transcript = event.results[i][0].transcript;
//                 if (event.results[i].isFinal) {
//                     addMessage(transcript, 'user');
//                 } else {
//                     interimTranscript += transcript;
//                 }
//             }
//             if (interimTranscript) {
//                 const lastMessage = chatMessages.lastChild;
//                 if (lastMessage && lastMessage.classList.contains('interim')) {
//                     lastMessage.textContent = interimTranscript;
//                 } else {
//                     const interimElement = document.createElement('div');
//                     interimElement.className = 'message user interim';
//                     interimElement.textContent = interimTranscript;
//                     chatMessages.appendChild(interimElement);
//                 }
//             }
//         };

//         recognition.onerror = (event) => {
//             console.error('Speech recognition error', event.error);
//             stopRecording();
//         };
//     } else {
//         console.warn('Speech recognition not supported');
//         addMessage("Speech recognition not supported in this browser", 'system');
//     }
// }

// function addMessage(text, sender) {
//     document.querySelectorAll('.interim').forEach(msg => msg.remove());
//     const messageDiv = document.createElement('div');
//     messageDiv.className = `message ${sender}`;
//     messageDiv.textContent = text;
//     chatMessages.appendChild(messageDiv);
//     chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
// }

// function displayCurrentQuestion() {
//     if (currentQuestionIndex < questions.length) {
//         const questionText = `Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex]}`;
//         currentQuestion.textContent = questionText;
//         addMessage(questionText, 'system');
//     } else {
//         currentQuestion.textContent = "All questions completed. Ready to submit.";
//         nextBtn.disabled = true;
//         submitBtn.disabled = false;
//     }
// }

// async function startRecording() {
//     try {
//         selectedSubject = document.getElementById('subjectSelect').value;
//         if (!selectedSubject) {
//             alert("⚠️ Please select a subject before starting!");
//             return;
//         }
//         questions = questionBank[selectedSubject];

//         mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         videoElement.srcObject = mediaStream;

//         mediaRecorder = new MediaRecorder(mediaStream);
//         recordedChunks = [];
//         mediaRecorder.ondataavailable = (event) => {
//             if (event.data.size > 0) recordedChunks.push(event.data);
//         };

//         mediaRecorder.start(100);
//         if (recognition) recognition.start();
//         isRecording = true;
//         startBtn.disabled = true;
//         nextBtn.disabled = false;
//         displayCurrentQuestion();

//     } catch (error) {
//         console.error('Error accessing media devices:', error);
//         addMessage("Error accessing camera/microphone", 'system');
//     }
// }

// function nextQuestion() {
//     if (isRecording) {
//         currentQuestionIndex++;
//         displayCurrentQuestion();
//         if (currentQuestionIndex >= questions.length) nextBtn.disabled = true;
//     }
// }

// function uploadRecordedVideo() {
//     if (recordedChunks.length === 0) {
//         alert("⚠️ No recording available to upload!");
//         return;
//     }
//     submitBtn.disabled = true;
//     submitBtn.textContent = "Submitting...";

//     const username = localStorage.getItem("username");
//     const mobile = localStorage.getItem("mobile");
//     const blob = new Blob(recordedChunks, { type: 'video/webm' });
//     const file = new File([blob], `${username}_${mobile}_video.webm`, { type: 'video/webm' });

//     const formData = new FormData();
//     formData.append("video", file);

//     fetch("https://video-analysis-backend-2l85.onrender.com/upload", { method: "POST", body: formData })
//         .then(res => {
//             if (!res.ok) throw new Error("❌ Server error");
//             return res.json();
//         })
//         .then(() => {
//             localStorage.setItem('uploadResultMessage', "✅ Thank You! Your Submission has been sent successfully!");
//             fetch("http://localhost:5000/analyze-drive", { method: "GET", mode: "no-cors" }).catch(() => { });
//             window.location.href = "result.html";
//         })
//         .catch(() => {
//             localStorage.setItem('uploadResultMessage', "⚠️ Something went wrong. Please try again.");
//             window.location.href = "result.html";
//         });
// }

// startBtn.addEventListener('click', startRecording);
// nextBtn.addEventListener('click', nextQuestion);
// submitBtn.addEventListener('click', uploadRecordedVideo);

// initSpeechRecognition();


















// document.addEventListener('DOMContentLoaded', () => {
//     // 🎯 DOM Elements: Fetching elements after DOM is fully loaded
//     const videoElement = document.getElementById('userVideo');
//     const startBtn = document.getElementById('startBtn');
//     const nextBtn = document.getElementById('nextBtn');
//     const submitBtn = document.getElementById('submitBtn');
//     const chatMessages = document.getElementById('chatMessages');
//     const currentQuestion = document.getElementById('currentQuestion');
//     const typingIndicator = document.getElementById('typingIndicator'); // Optional

//     let questions = [];  // Dynamically filled
//     let selectedSubject = "";

//     const questionBank = {
//         ml: [
//             "What is supervised learning?",
//             "What is overfitting?",
//             "Explain SVM briefly."
//         ],
//         ds: [
//             "What is a binary tree?",
//             "Explain stack vs queue.",
//             "What is a hash table?"
//         ],
//         oops: [
//             "What is inheritance?",
//             "Explain polymorphism.",
//             "What is encapsulation?"
//         ],
//         cn: [
//             "What is OSI model?",
//             "What is TCP vs UDP?",
//             "Explain IP addressing."
//         ],
//         dbms: [
//             "What is normalization?",
//             "What is ACID property?",
//             "What is indexing?"
//         ]
//     };

//     let mediaStream;         // Stores video+audio stream
//     let mediaRecorder;       // Object that records the stream
//     let recordedChunks = []; // Stores chunks of recorded video
//     let recognition;         // For speech-to-text
//     let isRecording = false;
//     let currentQuestionIndex = 0;  // Tracks current question

//     // 🧠 Initialize speech recognition (if browser supports it)
//     function initSpeechRecognition() {
//         const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

//         if (SpeechRecognition) {
//             recognition = new SpeechRecognition();
//             recognition.continuous = true;
//             recognition.interimResults = true;

//             recognition.onresult = (event) => {
//                 let interimTranscript = '';
//                 for (let i = event.resultIndex; i < event.results.length; i++) {
//                     const transcript = event.results[i][0].transcript;

//                     if (event.results[i].isFinal) {
//                         addMessage(transcript, 'user');
//                     } else {
//                         interimTranscript += transcript;
//                     }
//                 }

//                 if (interimTranscript) {
//                     const lastMessage = chatMessages.lastChild;
//                     if (lastMessage && lastMessage.classList.contains('interim')) {
//                         lastMessage.textContent = interimTranscript;
//                     } else {
//                         const interimElement = document.createElement('div');
//                         interimElement.className = 'message user interim';
//                         interimElement.textContent = interimTranscript;
//                         chatMessages.appendChild(interimElement);
//                     }
//                 }
//             };

//             recognition.onerror = (event) => {
//                 console.error('Speech recognition error', event.error);
//                 stopRecording(); // Optional: stop recording on error
//             };
//         } else {
//             console.warn('Speech recognition not supported');
//             addMessage("Speech recognition not supported in this browser", 'system');
//         }
//     }

//     function addMessage(text, sender) {
//         // Remove any temporary (interim) messages
//         const interimMessages = document.querySelectorAll('.interim');
//         interimMessages.forEach(msg => msg.remove());

//         // Create new chat message
//         const messageDiv = document.createElement('div');
//         messageDiv.className = `message ${sender}`;
//         messageDiv.textContent = text;

//         chatMessages.appendChild(messageDiv);
//         chatMessages.scrollTo({
//             top: chatMessages.scrollHeight,
//             behavior: 'smooth'
//         });
//     }

//     function displayCurrentQuestion() {
//         if (currentQuestionIndex < questions.length) {
//             const questionText = `Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex]}`;
//             currentQuestion.textContent = questionText;
//             addMessage(questionText, 'system');
//         } else {
//             currentQuestion.textContent = "All questions completed. Ready to submit.";
//             nextBtn.disabled = true;
//             submitBtn.disabled = false;
//         }
//     }

//     async function startRecording() {
//         try {
//             selectedSubject = document.getElementById('subjectSelect').value;
//             if (!selectedSubject) {
//                 alert("⚠️ Please select a subject before starting!");
//                 return;
//             }
//             questions = questionBank[selectedSubject];
//             currentQuestionIndex = 0; // Reset question index on start

//             mediaStream = await navigator.mediaDevices.getUserMedia({
//                 video: true,
//                 audio: true
//             });

//             videoElement.srcObject = mediaStream;

//             mediaRecorder = new MediaRecorder(mediaStream);
//             recordedChunks = [];

//             mediaRecorder.ondataavailable = (event) => {
//                 if (event.data.size > 0) {
//                     recordedChunks.push(event.data);
//                 }
//             };

//             mediaRecorder.start(100);

//             if (recognition) {
//                 recognition.start();
//             }
//             isRecording = true;

//             startBtn.disabled = true;
//             nextBtn.disabled = false;
//             submitBtn.disabled = true;

//             displayCurrentQuestion();

//         } catch (error) {
//             console.error('Error accessing media devices:', error);
//             addMessage("Error accessing camera/microphone", 'system');
//         }
//     }

//     function nextQuestion() {
//         if (isRecording) {
//             currentQuestionIndex++;
//             displayCurrentQuestion();

//             if (currentQuestionIndex >= questions.length) {
//                 nextBtn.disabled = true;
//             }
//         }
//     }

//     function uploadRecordedVideo() {
//     if (recordedChunks.length === 0) {
//         alert("⚠️ No recording available to upload!");
//         return;
//     }

//     submitBtn.disabled = true;
//     submitBtn.textContent = "Submitting...";

//     const username = localStorage.getItem("username") || "user";
//     const mobile = localStorage.getItem("mobile") || "0000000000";

//     const blob = new Blob(recordedChunks, { type: 'video/webm' });
//     const finalFilename = `video.webm`;  // sirf simple naam
//     const file = new File([blob], finalFilename, { type: 'video/webm' });

//     const formData = new FormData();
//     formData.append("video", file);
//     formData.append("username", username);
//     formData.append("mobile", mobile);

//     fetch("https://video-analysis-backend-2l85.onrender.com/upload", {
//         method: "POST",
//         body: formData
//     })
//     .then(res => {
//         if (!res.ok) throw new Error("❌ Server error");
//         return res.json();
//     })
//     .then(data => {
//         console.log("✅ Upload success:", data);

//         const message = "✅ Thank You! Your Submission has been sent successfully!";
//         localStorage.setItem('uploadResultMessage', message);

//         fetch("http://localhost:5000/analyze-drive", {
//             method: "GET",
//             mode: "no-cors"
//         }).catch(err => {
//             console.warn("Analyze-drive trigger failed:", err);
//         });

//         // ✅ Mark that it came from dashboard
//         sessionStorage.setItem("fromDashboard", "true");

//         // ✅ Replace history so dashboard skip हो
//         window.location.replace("result.html");
//     })
//     .catch(err => {
//         console.error("❌ Upload failed:", err);

//         const errorMsg = "⚠️ Something went wrong. Please try again.";
//         localStorage.setItem('uploadResultMessage', errorMsg);

//         sessionStorage.setItem("fromDashboard", "true");
//         window.location.replace("result.html");
//     });
// }


// // Attach event listeners AFTER DOM load
// startBtn.addEventListener('click', () => {
//     console.log("Start button clicked");
//     startRecording();
// });

// nextBtn.addEventListener('click', () => {
//     console.log("Next button clicked");
//     nextQuestion();
// });

// submitBtn.addEventListener('click', () => {
//     console.log("Submit button clicked");
//     uploadRecordedVideo();
// });


//     // Initialize speech recognition
//     initSpeechRecognition();
// });









