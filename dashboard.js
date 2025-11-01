document.addEventListener('DOMContentLoaded', () => {
    // BACK & REFRESH HANDLING START 
    if (!sessionStorage.getItem("fromInstruction")) {
        window.location.replace("index.html");
    }

    // On load, set current page as fromInstruction
    window.onload = function() {
        sessionStorage.setItem("fromInstruction", "true");
        // Replace history to prevent back to previous pages
        history.replaceState(null, null, "dashboard.html");
    };

    // Back button handle karna
    window.addEventListener('popstate', function() {
        window.location.replace("index.html");
    });

    // Optional: refresh handling
    window.addEventListener('beforeunload', function() {
        sessionStorage.removeItem("fromInstruction");
    });
    // BACK & REFRESH HANDLING END 

    // Custom Alert Elements 
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    const alertOkBtn = document.getElementById('alertOkBtn');

    // Function to show alert 
    function showAlert(message) {
        alertMessage.textContent = message;
        customAlert.style.display = 'flex';
    }

    // OK button hides the alert 
    alertOkBtn.addEventListener('click', () => {
        customAlert.style.display = 'none';
    });

    // DOM Elements
    const videoElement = document.getElementById('userVideo');
    const startBtn = document.getElementById('startBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const chatMessages = document.getElementById('chatMessages');
    const currentQuestion = document.getElementById('currentQuestion');
    const statusIndicator = document.getElementById('statusIndicator');
    const timerText = document.getElementById('timerText');
    const timerBar = document.getElementById('timerBar');
    const currentSubjectContainer = document.getElementById('currentSubjectContainer');
    const overviewPanel = document.getElementById('overviewPanel');
    const overviewTotalSubjects = document.getElementById('overviewTotalSubjects');
    const overviewTotalQuestions = document.getElementById('overviewTotalQuestions');
    const overviewTotalTime = document.getElementById('overviewTotalTime');
    const subjectsDetailsList = document.getElementById('subjectsDetailsList');

    let allQuestions = [];
    let currentSubjectIndex = 0;
    let currentQuestionIndex = 0;
    let timerDuration = 0;
    let subjectTimers = {};
    let subjectNames = {};
    let subjectQuestionCounts = {};
    let currentSubjectCode = '';
    let currentSubjectTime = 0;
    let subjectStartTime = 0;
    let subjectTimerInterval;

    let questionBank = {};
    let mediaStream;
    let mediaRecorder;
    let recordedChunks = [];
    let recognition;
    let isRecording = false;
    let timerInterval;

    // Function to update the overview panel
    function updateOverviewPanel() {
        const totalSubjects = Object.keys(subjectNames).length;
        const totalQuestions = allQuestions.length;
        
        // Calculate total time in minutes and seconds
        const minutes = Math.floor(timerDuration / 60);
        const seconds = timerDuration % 60;
        const timeText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        
        // Update overview stats
        overviewTotalSubjects.textContent = totalSubjects;
        overviewTotalQuestions.textContent = totalQuestions;
        overviewTotalTime.textContent = timeText;
        
        // Clear and populate subjects details
        subjectsDetailsList.innerHTML = '';
        
        for (const [code, name] of Object.entries(subjectNames)) {
            const questionCount = subjectQuestionCounts[code] || 0;
            const timeLimit = subjectTimers[code] || 300; // Default 5 minutes
            const subjectMinutes = Math.floor(timeLimit / 60);
            const subjectSeconds = timeLimit % 60;
            
            const subjectDiv = document.createElement('div');
            subjectDiv.className = 'subject-detail-item';
            subjectDiv.innerHTML = `
                <div class="subject-detail-left">
                    <div class="subject-detail-name">${name}</div>
                    <div class="subject-detail-code">Code: ${code.toUpperCase()}</div>
                </div>
                <div class="subject-detail-right">
                    <div class="subject-detail-questions">${questionCount} Questions</div>
                    <div class="subject-detail-time">${subjectMinutes}m ${subjectSeconds.toString().padStart(2, '0')}s</div>
                </div>
            `;
            
            subjectsDetailsList.appendChild(subjectDiv);
        }
    }

    // Function to hide overview and show current subject
    function hideOverviewShowSubject() {
        overviewPanel.style.display = 'none';
        currentSubjectContainer.style.display = 'block';
    }

    // Display current subject and its questions
    function displayCurrentSubject(subjectCode) {
        currentSubjectContainer.innerHTML = '';
        
        if (!questionBank[subjectCode]) return;
        
        const subjectName = subjectNames[subjectCode] || subjectCode;
        const questionCount = subjectQuestionCounts[subjectCode] || 0;
        const timeLimit = subjectTimers[subjectCode] || 300; // Default 5 minutes
        const minutes = Math.floor(timeLimit / 60);
        const seconds = timeLimit % 60;
        
        const subjectElement = document.createElement('div');
        subjectElement.className = 'current-subject';
        subjectElement.innerHTML = `
            <div class="subject-title">${subjectName}</div>
            <div class="subject-details">
                <span>Questions: ${questionCount}</span>
                <span>Time: ${minutes}m ${seconds}s</span>
            </div>
        `;
        
        currentSubjectContainer.appendChild(subjectElement);
        
        const questionsContainer = document.createElement('div');
        questionsContainer.className = 'subject-questions';
        
        questionBank[subjectCode].forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            questionItem.id = `question-${subjectCode}-${index}`;
            questionItem.innerHTML = `
                <div class="question-text">Q${index + 1}: ${question}</div>
            `;
            questionsContainer.appendChild(questionItem);
        });
        
        currentSubjectContainer.appendChild(questionsContainer);
        
        // Highlight the first question
        const firstQuestion = document.getElementById(`question-${subjectCode}-0`);
        if (firstQuestion) {
            firstQuestion.classList.add('current');
        }
    }

    // Helper function to format time as mm:ss
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Update timer color based on remaining time
    function updateTimerColor(percent) {
        if (percent > 50) {
            timerBar.style.background = "linear-gradient(to right, #25D366, #ffcc00)";
            timerText.style.color = "#25D366";
        } else if (percent > 25) {
            timerBar.style.background = "linear-gradient(to right, #ffcc00, #ff9933)";
            timerText.style.color = "#ffcc00";
        } else {
            timerBar.style.background = "linear-gradient(to right, #ff9933, #ff3333)";
            timerText.style.color = "#ff3333";
        }
    }

    // Initialize speech recognition - FIXED VERSION
    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

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
                // ❌ STOP RECORDING नहीं करें - सिर्फ error log करें
                if (event.error === 'not-allowed') {
                    addMessage("🔇 Microphone permission denied. Video recording will continue.", 'system');
                } else if (event.error === 'audio-capture') {
                    addMessage("🎤 No microphone detected. Video recording will continue.", 'system');
                }
                // Recording continue रहेगी
            };

            recognition.onend = () => {
                console.log("Speech recognition ended");
                // Automatically restart recognition if still recording
                if (isRecording && recognition) {
                    try {
                        setTimeout(() => {
                            recognition.start();
                            console.log("Speech recognition restarted");
                        }, 100);
                    } catch (e) {
                        console.log("Could not restart speech recognition:", e);
                    }
                }
            };

        } else {
            console.warn('Speech recognition not supported');
            addMessage("🗣️ Speech recognition not supported. Video recording will work normally.", 'system');
        }
    }

    // Function to add messages to chat
    function addMessage(text, sender) {
        const interimMessages = document.querySelectorAll('.interim');
        interimMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Display current question
    function displayCurrentQuestion() {
        if (currentQuestionIndex < allQuestions.length) {
            const currentQ = allQuestions[currentQuestionIndex];
            const subjectName = subjectNames[currentQ.subject] || currentQ.subject;
            const questionText = `Subject: ${subjectName} - Question ${currentQuestionIndex + 1}: ${currentQ.question}`;
            currentQuestion.textContent = questionText;
            
            if (currentSubjectCode !== currentQ.subject) {
                currentSubjectCode = currentQ.subject;
                currentSubjectTime = subjectTimers[currentSubjectCode] || 300; // Default 5 minutes
                subjectStartTime = Date.now();
                
                displayCurrentSubject(currentSubjectCode);
                startSubjectTimer();
            }
            
            document.querySelectorAll('.question-item').forEach(item => {
                item.classList.remove('current', 'completed');
            });
            
            const subjectQuestions = questionBank[currentSubjectCode];
            const subjectQuestionIndex = subjectQuestions.indexOf(currentQ.question);
            
            if (subjectQuestionIndex >= 0) {
                const currentQuestionElement = document.getElementById(`question-${currentSubjectCode}-${subjectQuestionIndex}`);
                if (currentQuestionElement) {
                    currentQuestionElement.classList.add('current');
                }
                
                for (let i = 0; i < subjectQuestionIndex; i++) {
                    const prevQuestionElement = document.getElementById(`question-${currentSubjectCode}-${i}`);
                    if (prevQuestionElement) {
                        prevQuestionElement.classList.add('completed');
                    }
                }
            }
        } else {
            currentQuestion.textContent = "All questions completed. Ready to submit.";
            nextBtn.disabled = true;
            submitBtn.disabled = false;
            clearInterval(subjectTimerInterval);
        }
    }

    // Start subject timer - FIXED VERSION
    function startSubjectTimer() {
        clearInterval(subjectTimerInterval);
        
        // Current subject का time calculate करें
        const currentQ = allQuestions[currentQuestionIndex];
        currentSubjectCode = currentQ.subject;
        currentSubjectTime = subjectTimers[currentSubjectCode] || 300; // Default 5 minutes
        
        let timeLeft = currentSubjectTime;
        
        console.log(`🕒 Subject timer started: ${currentSubjectCode} for ${timeLeft} seconds`);
        
        subjectTimerInterval = setInterval(() => {
            if (!isRecording) {
                clearInterval(subjectTimerInterval);
                return;
            }
            
            timeLeft--;
            
            // Display subject time in console for debugging
            if (timeLeft % 30 === 0) {
                console.log(`🕒 ${currentSubjectCode} time left: ${timeLeft}s`);
            }
            
            if (timeLeft <= 0) {
                clearInterval(subjectTimerInterval);
                console.log(`🕒 Subject timer ended for ${currentSubjectCode}`);
                
                // User को inform करें, लेकिन automatic next नहीं करें
                addMessage(`⏰ Time for ${subjectNames[currentSubjectCode]} has ended. You can continue to next question when ready.`, 'system');
            }
        }, 1000);
    }

    // Start timer function - FIXED VERSION  
    function startTimer() {
        clearInterval(timerInterval);
        let timeLeft = timerDuration;
        
        console.log(`⏰ Main timer started: ${timeLeft} seconds total`);
        
        timerText.textContent = formatTime(timeLeft);
        timerBar.style.width = '100%';
        updateTimerColor(100);

        timerInterval = setInterval(() => {
            if (!isRecording) {
                clearInterval(timerInterval);
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerText.textContent = `${minutes}:${seconds.toString().padStart(2,'0')}`;

            const percent = (timeLeft / timerDuration) * 100;
            timerBar.style.width = `${percent}%`;
            updateTimerColor(percent);

            timeLeft--;

            // Debug logging
            if (timeLeft % 60 === 0) {
                console.log(`⏰ Main timer: ${minutes}:${seconds.toString().padStart(2,'0')} remaining`);
            }

            if (timeLeft < 0) {
                clearInterval(timerInterval);
                console.log("⏰ Total time ended - auto submitting");
                addMessage("⏰ Total interview time has ended! Auto-submitting your video.", 'system');
                uploadRecordedVideo();
            }
        }, 1000);
    }

    // Fetch data from Google Sheets
    async function fetchDataFromGoogleSheets() {
        try {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.innerHTML = '<span class="loading"></span> Loading subjects...';
            loadingIndicator.className = 'message system';
            chatMessages.appendChild(loadingIndicator);
            
            const sheetURL = "https://docs.google.com/spreadsheets/d/1W7omv5Q2GMI4-3jz61ZmH-H1x_V1YRG-xz2EfkdseDM/gviz/tq?tqx=out:json";
            const response = await fetch(sheetURL);
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const text = await response.text();
            const jsonData = JSON.parse(text.substr(47).slice(0, -2));
            const rows = jsonData.table.rows;
            const newQuestionBank = {};
            
            rows.forEach(row => {
                const subjectCode = row.c[0]?.v?.toString().toLowerCase() || '';
                const subjectName = row.c[1]?.v || subjectCode;
                const timer = row.c[2]?.v ? parseInt(row.c[2].v) : 300; // Default 5 minutes
                
                if (subjectCode) {
                    subjectTimers[subjectCode] = timer;
                    subjectNames[subjectCode] = subjectName;
                    timerDuration += timer;
                }
                
                const subjectQuestions = [];
                for (let i = 3; i < row.c.length; i++) {
                    if (row.c[i] && row.c[i].v && row.c[i].v.toString().trim() !== '') {
                        subjectQuestions.push(row.c[i].v.toString().trim());
                    }
                }
                
                if (subjectCode && subjectQuestions.length > 0) {
                    newQuestionBank[subjectCode] = subjectQuestions;
                    subjectQuestionCounts[subjectCode] = subjectQuestions.length;
                    
                    allQuestions = allQuestions.concat(subjectQuestions.map(q => ({
                        question: q,
                        subject: subjectCode
                    })));
                }
            });
            
            chatMessages.removeChild(loadingIndicator);
            
            if (Object.keys(newQuestionBank).length > 0) {
                questionBank = newQuestionBank;
                
                // Update the overview panel with all subject details
                updateOverviewPanel();
                
                startBtn.disabled = false;
                showAlert("Press OK, then Click Start to begin the interview.");
            } else {
                showAlert("Error: No data found from server. Please check your configuration.");
                startBtn.disabled = true;
            }
            
            return true;
        } catch (error) {
            console.error('Error fetching data from Dataset:', error);
            
            const loadingIndicators = document.querySelectorAll('.loading');
            loadingIndicators.forEach(indicator => indicator.parentElement.remove());
            
            showAlert("Server error: Could not fetch data from server. Please check your internet connection and try again.");
            startBtn.disabled = true;
            
            return false;
        }
    }

    // Start recording video, audio, speech-to-text, and timer - FIXED VERSION
    async function startRecording() {
        try {
            if (allQuestions.length === 0) {
                showAlert("No questions available!");
                return;
            }
            
            currentQuestionIndex = 0;

            // Hide overview panel and show current subject
            hideOverviewShowSubject();

            // Access camera & microphone with better configuration
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: 1280, 
                    height: 720 
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
            videoElement.srcObject = mediaStream;

            // Setup MediaRecorder with better configuration
            const options = {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 2500000 // 2.5 Mbps
            };
            
            try {
                mediaRecorder = new MediaRecorder(mediaStream, options);
            } catch (e) {
                console.log("Trying fallback MIME type");
                mediaRecorder = new MediaRecorder(mediaStream); // Default MIME type
            }
            
            recordedChunks = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                    console.log(`Recorded chunk: ${event.data.size} bytes`);
                }
            };

            mediaRecorder.onstop = () => {
                console.log("MediaRecorder stopped");
                console.log(`Total recorded chunks: ${recordedChunks.length}`);
                console.log(`Total data: ${recordedChunks.reduce((acc, chunk) => acc + chunk.size, 0)} bytes`);
            };

            // Start with larger timeslice
            mediaRecorder.start(1000); // 1 second chunks
            console.log("MediaRecorder started");

            // Start speech recognition if available
            if (recognition) {
                try {
                    recognition.start();
                    console.log("Speech recognition started");
                } catch (e) {
                    console.log("Speech recognition already started or failed:", e);
                }
            }
            
            isRecording = true;
            
            // Update status indicator
            statusIndicator.classList.add('status-recording');

            startBtn.disabled = true;
            nextBtn.disabled = false;

            displayCurrentQuestion();
            startTimer();

            // Success message
            addMessage("🎥 Recording started successfully! You can now answer the questions.", 'system');

        } catch (error) {
            console.error('Error accessing media devices:', error);
            
            if (error.name === 'NotAllowedError') {
                showAlert("❌ Camera/microphone permission denied. Please allow permissions and refresh the page.");
            } else if (error.name === 'NotFoundError') {
                showAlert("❌ No camera/microphone found. Please check your devices.");
            } else {
                showAlert("❌ Error accessing camera/microphone: " + error.message);
            }
        }
    }

    // Move to next question
    function nextQuestion() {
        if (isRecording) {
            currentQuestionIndex++;
            displayCurrentQuestion();

            if (currentQuestionIndex >= allQuestions.length) {
                nextBtn.disabled = true;
                submitBtn.disabled = false;
                
                // Mark all questions as completed
                document.querySelectorAll('.question-item').forEach(item => {
                    item.classList.add('completed');
                });
            }
        }
    }

    // Function to stop recording and cleanup
    function stopRecording() {
        try {
            // Stop media recorder
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            
            // Stop speech recognition
            if (recognition) {
                recognition.stop();
            }
            
            // Stop media stream (camera/microphone)
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
            
            // Clear timers
            clearInterval(timerInterval);
            clearInterval(subjectTimerInterval);
            
            // Update status
            isRecording = false;
            statusIndicator.classList.remove('status-recording');
            
            console.log("Recording stopped and cleaned up");
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    }

    // Upload recorded video to server
    function uploadRecordedVideo() {
        if (recordedChunks.length === 0) {
            showAlert("⚠️ No recording available to upload!");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        const username = localStorage.getItem("username") || "user";
        const mobile = localStorage.getItem("mobile") || "0000000000";

        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const finalFilename = `${username}_${mobile}_${Date.now()}.webm`;
        const file = new File([blob], finalFilename, { type: 'video/webm' });

        const formData = new FormData();
        formData.append('video', file);
        formData.append('username', username);
        formData.append('mobile', mobile);

        fetch("https://copy-video-analysis-backend.onrender.com/upload", {
            method: "POST",
            body: formData
        })
        .then(res => {
            if (!res.ok) throw new Error("❌ Server error: " + res.status);
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

            showAlert(message);
        })
        .catch(err => {
            console.error("❌ Upload failed:", err);
            const errorMsg = "⚠️ Something went wrong. Please try again.";
            showAlert(errorMsg);

            // Re-enable submit button for retry
            submitBtn.disabled = false;
            submitBtn.textContent = "Retry Upload";
            submitBtn.style.background = "#ff9933";
        });
    }

    // Event listeners
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
    
    // Fetch data from Google Sheets when page loads
    fetchDataFromGoogleSheets();

    // Debug monitoring
    setInterval(() => {
        if (isRecording) {
            console.log(`🔴 Recording active - Chunks: ${recordedChunks.length}, Total size: ${recordedChunks.reduce((acc, chunk) => acc + chunk.size, 0)} bytes`);
        }
    }, 10000); // Every 10 seconds
});















// document.addEventListener('DOMContentLoaded', () => {
//        //  BACK & REFRESH HANDLING START 
//         if (!sessionStorage.getItem("fromInstruction")) {
//             window.location.replace("index.html");
//         }

//         // On load, set current page as fromInstruction
//         window.onload = function() {
//             sessionStorage.setItem("fromInstruction", "true");
//             // Replace history to prevent back to previous pages
//             history.replaceState(null, null, "dashboard.html");
//         };

//         // Back button handle karna
//         window.addEventListener('popstate', function() {
//             window.location.replace("index.html");
//         });

//         // Optional: refresh handling
//         window.addEventListener('beforeunload', function() {
//             sessionStorage.removeItem("fromInstruction");
//         });
//         //  BACK & REFRESH HANDLING END 

//         // Custom Alert Elements 
//         const customAlert = document.getElementById('customAlert');
//         const alertMessage = document.getElementById('alertMessage');
//         const alertOkBtn = document.getElementById('alertOkBtn');

//         // Function to show alert 
//         function showAlert(message) {
//             alertMessage.textContent = message;
//             customAlert.style.display = 'flex';
//         }

//         // OK button hides the alert 
//         alertOkBtn.addEventListener('click', () => {
//             customAlert.style.display = 'none';
//         });

//         // DOM Elements
//         const videoElement = document.getElementById('userVideo');
//         const startBtn = document.getElementById('startBtn');
//         const nextBtn = document.getElementById('nextBtn');
//         const submitBtn = document.getElementById('submitBtn');
//         const chatMessages = document.getElementById('chatMessages');
//         const currentQuestion = document.getElementById('currentQuestion');
//         const statusIndicator = document.getElementById('statusIndicator');
//         const timerText = document.getElementById('timerText');
//         const timerBar = document.getElementById('timerBar');
//         const currentSubjectContainer = document.getElementById('currentSubjectContainer');
//         const overviewPanel = document.getElementById('overviewPanel');
//         const overviewTotalSubjects = document.getElementById('overviewTotalSubjects');
//         const overviewTotalQuestions = document.getElementById('overviewTotalQuestions');
//         const overviewTotalTime = document.getElementById('overviewTotalTime');
//         const subjectsDetailsList = document.getElementById('subjectsDetailsList');

//         let allQuestions = [];
//         let currentSubjectIndex = 0;
//         let currentQuestionIndex = 0;
//         let timerDuration = 0;
//         let subjectTimers = {};
//         let subjectNames = {};
//         let subjectQuestionCounts = {};
//         let currentSubjectCode = '';
//         let currentSubjectTime = 0;
//         let subjectStartTime = 0;
//         let subjectTimerInterval;

//         let questionBank = {};
//         let mediaStream;
//         let mediaRecorder;
//         let recordedChunks = [];
//         let recognition;
//         let isRecording = false;
//         let timerInterval;

//         // Function to update the overview panel
//         function updateOverviewPanel() {
//             const totalSubjects = Object.keys(subjectNames).length;
//             const totalQuestions = allQuestions.length;
            
//             // Calculate total time in minutes and seconds
//             const minutes = Math.floor(timerDuration / 60);
//             const seconds = timerDuration % 60;
//             const timeText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
            
//             // Update overview stats
//             overviewTotalSubjects.textContent = totalSubjects;
//             overviewTotalQuestions.textContent = totalQuestions;
//             overviewTotalTime.textContent = timeText;
            
//             // Clear and populate subjects details
//             subjectsDetailsList.innerHTML = '';
            
//             for (const [code, name] of Object.entries(subjectNames)) {
//                 const questionCount = subjectQuestionCounts[code] || 0;
//                 const timeLimit = subjectTimers[code] || 60;
//                 const subjectMinutes = Math.floor(timeLimit / 60);
//                 const subjectSeconds = timeLimit % 60;
                
//                 const subjectDiv = document.createElement('div');
//                 subjectDiv.className = 'subject-detail-item';
//                 subjectDiv.innerHTML = `
//                     <div class="subject-detail-left">
//                         <div class="subject-detail-name">${name}</div>
//                         <div class="subject-detail-code">Code: ${code.toUpperCase()}</div>
//                     </div>
//                     <div class="subject-detail-right">
//                         <div class="subject-detail-questions">${questionCount} Questions</div>
//                         <div class="subject-detail-time">${subjectMinutes}m ${subjectSeconds.toString().padStart(2, '0')}s</div>
//                     </div>
//                 `;
                
//                 subjectsDetailsList.appendChild(subjectDiv);
//             }
//         }

//         // Function to hide overview and show current subject
//         function hideOverviewShowSubject() {
//             overviewPanel.style.display = 'none';
//             currentSubjectContainer.style.display = 'block';
//         }

//         // Display current subject and its questions
//         function displayCurrentSubject(subjectCode) {
//             currentSubjectContainer.innerHTML = '';
            
//             if (!questionBank[subjectCode]) return;
            
//             const subjectName = subjectNames[subjectCode] || subjectCode;
//             const questionCount = subjectQuestionCounts[subjectCode] || 0;
//             const timeLimit = subjectTimers[subjectCode] || 60;
//             const minutes = Math.floor(timeLimit / 60);
//             const seconds = timeLimit % 60;
            
//             const subjectElement = document.createElement('div');
//             subjectElement.className = 'current-subject';
//             subjectElement.innerHTML = `
//                 <div class="subject-title">${subjectName}</div>
//                 <div class="subject-details">
//                     <span>Questions: ${questionCount}</span>
//                     <span>Time: ${minutes}m ${seconds}s</span>
//                 </div>
//             `;
            
//             currentSubjectContainer.appendChild(subjectElement);
            
//             const questionsContainer = document.createElement('div');
//             questionsContainer.className = 'subject-questions';
            
//             questionBank[subjectCode].forEach((question, index) => {
//                 const questionItem = document.createElement('div');
//                 questionItem.className = 'question-item';
//                 questionItem.id = `question-${subjectCode}-${index}`;
//                 questionItem.innerHTML = `
//                     <div class="question-text">Q${index + 1}: ${question}</div>
//                 `;
//                 questionsContainer.appendChild(questionItem);
//             });
            
//             currentSubjectContainer.appendChild(questionsContainer);
            
//             // Highlight the first question
//             const firstQuestion = document.getElementById(`question-${subjectCode}-0`);
//             if (firstQuestion) {
//                 firstQuestion.classList.add('current');
//             }
//         }

//         // Helper function to format time as mm:ss
//         function formatTime(seconds) {
//             const minutes = Math.floor(seconds / 60);
//             const remainingSeconds = seconds % 60;
//             return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//         }

//         // Update timer color based on remaining time
//         function updateTimerColor(percent) {
//             if (percent > 50) {
//                 timerBar.style.background = "linear-gradient(to right, #25D366, #ffcc00)";
//                 timerText.style.color = "#25D366";
//             } else if (percent > 25) {
//                 timerBar.style.background = "linear-gradient(to right, #ffcc00, #ff9933)";
//                 timerText.style.color = "#ffcc00";
//             } else {
//                 timerBar.style.background = "linear-gradient(to right, #ff9933, #ff3333)";
//                 timerText.style.color = "#ff3333";
//             }
//         }

//         // Initialize speech recognition
//         function initSpeechRecognition() {
//             const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

//             if (SpeechRecognition) {
//                 recognition = new SpeechRecognition();
//                 recognition.continuous = true;
//                 recognition.interimResults = true;

//                 recognition.onresult = (event) => {
//                     let interimTranscript = '';
//                     for (let i = event.resultIndex; i < event.results.length; i++) {
//                         const transcript = event.results[i][0].transcript;

//                         if (event.results[i].isFinal) {
//                             addMessage(transcript, 'user');
//                         } else {
//                             interimTranscript += transcript;
//                         }
//                     }

//                     if (interimTranscript) {
//                         const lastMessage = chatMessages.lastChild;
//                         if (lastMessage && lastMessage.classList.contains('interim')) {
//                             lastMessage.textContent = interimTranscript;
//                         } else {
//                             const interimElement = document.createElement('div');
//                             interimElement.className = 'message user interim';
//                             interimElement.textContent = interimTranscript;
//                             chatMessages.appendChild(interimElement);
//                         }
//                     }
//                 };

//                 recognition.onerror = (event) => {
//                     console.error('Speech recognition error', event.error);
//                     stopRecording();
//                 };
//             } else {
//                 console.warn('Speech recognition not supported');
//                 showAlert("Speech recognition not supported in this browser", 'system');
//             }
//         }

//         // Function to add messages to chat
//         function addMessage(text, sender) {
//             const interimMessages = document.querySelectorAll('.interim');
//             interimMessages.forEach(msg => msg.remove());

//             const messageDiv = document.createElement('div');
//             messageDiv.className = `message ${sender}`;
//             messageDiv.textContent = text;

//             chatMessages.appendChild(messageDiv);
//             chatMessages.scrollTo({
//                 top: chatMessages.scrollHeight,
//                 behavior: 'smooth'
//             });
//         }

//         // Display current question
//         function displayCurrentQuestion() {
//             if (currentQuestionIndex < allQuestions.length) {
//                 const currentQ = allQuestions[currentQuestionIndex];
//                 const subjectName = subjectNames[currentQ.subject] || currentQ.subject;
//                 const questionText = `Subject: ${subjectName} - Question ${currentQuestionIndex + 1}: ${currentQ.question}`;
//                 currentQuestion.textContent = questionText;
                
//                 if (currentSubjectCode !== currentQ.subject) {
//                     currentSubjectCode = currentQ.subject;
//                     currentSubjectTime = subjectTimers[currentSubjectCode] || 60;
//                     subjectStartTime = Date.now();
                    
//                     displayCurrentSubject(currentSubjectCode);
//                     startSubjectTimer();
//                 }
                
//                 document.querySelectorAll('.question-item').forEach(item => {
//                     item.classList.remove('current', 'completed');
//                 });
                
//                 const subjectQuestions = questionBank[currentSubjectCode];
//                 const subjectQuestionIndex = subjectQuestions.indexOf(currentQ.question);
                
//                 if (subjectQuestionIndex >= 0) {
//                     const currentQuestionElement = document.getElementById(`question-${currentSubjectCode}-${subjectQuestionIndex}`);
//                     if (currentQuestionElement) {
//                         currentQuestionElement.classList.add('current');
//                     }
                    
//                     for (let i = 0; i < subjectQuestionIndex; i++) {
//                         const prevQuestionElement = document.getElementById(`question-${currentSubjectCode}-${i}`);
//                         if (prevQuestionElement) {
//                             prevQuestionElement.classList.add('completed');
//                         }
//                     }
//                 }
//             } else {
//                 currentQuestion.textContent = "All questions completed. Ready to submit.";
//                 nextBtn.disabled = true;
//                 submitBtn.disabled = false;
//                 clearInterval(subjectTimerInterval);
//             }
//         }

//         // Start subject timer
//         function startSubjectTimer() {
//             clearInterval(subjectTimerInterval);
//             let timeLeft = currentSubjectTime;
            
//             subjectTimerInterval = setInterval(() => {
//                 timeLeft--;
                
//                 if (timeLeft <= 0) {
//                     clearInterval(subjectTimerInterval);
//                     if (currentQuestionIndex < allQuestions.length - 1) {
//                         nextQuestion();
//                     }
//                 }
//             }, 1000);
//         }

//         // Start timer function
//         function startTimer() {
//             clearInterval(timerInterval);
//             let timeLeft = timerDuration;
            
//             timerText.textContent = formatTime(timeLeft);
//             timerBar.style.width = '100%';
//             updateTimerColor(100);

//             timerInterval = setInterval(() => {
//                 const minutes = Math.floor(timeLeft / 60);
//                 const seconds = timeLeft % 60;
//                 timerText.textContent = `${minutes}:${seconds.toString().padStart(2,'0')}`;

//                 const percent = (timeLeft / timerDuration) * 100;
//                 timerBar.style.width = `${percent}%`;
//                 updateTimerColor(percent);

//                 timeLeft--;

//                 if (timeLeft < 0) {
//                     clearInterval(timerInterval);
//                     addMessage("⏰ Time is up! Auto-submitting your video.", 'system');
//                     uploadRecordedVideo();
//                 }
//             }, 1000);
//         }

//         // Fetch data from Google Sheets
//         async function fetchDataFromGoogleSheets() {
//             try {
//                 const loadingIndicator = document.createElement('div');
//                 loadingIndicator.innerHTML = '<span class="loading"></span> Loading subjects...';
//                 loadingIndicator.className = 'message system';
//                 chatMessages.appendChild(loadingIndicator);
                
//                 const sheetURL = "https://docs.google.com/spreadsheets/d/1W7omv5Q2GMI4-3jz61ZmH-H1x_V1YRG-xz2EfkdseDM/gviz/tq?tqx=out:json";
//                 const response = await fetch(sheetURL);
                
//                 if (!response.ok) {
//                     throw new Error(`Server returned ${response.status}: ${response.statusText}`);
//                 }
                
//                 const text = await response.text();
//                 const jsonData = JSON.parse(text.substr(47).slice(0, -2));
//                 const rows = jsonData.table.rows;
//                 const newQuestionBank = {};
                
//                 rows.forEach(row => {
//                     const subjectCode = row.c[0]?.v?.toString().toLowerCase() || '';
//                     const subjectName = row.c[1]?.v || subjectCode;
//                     const timer = row.c[2]?.v ? parseInt(row.c[2].v) : 60;
                    
//                     if (subjectCode) {
//                         subjectTimers[subjectCode] = timer;
//                         subjectNames[subjectCode] = subjectName;
//                         timerDuration += timer;
//                     }
                    
//                     const subjectQuestions = [];
//                     for (let i = 3; i < row.c.length; i++) {
//                         if (row.c[i] && row.c[i].v && row.c[i].v.toString().trim() !== '') {
//                             subjectQuestions.push(row.c[i].v.toString().trim());
//                         }
//                     }
                    
//                     if (subjectCode && subjectQuestions.length > 0) {
//                         newQuestionBank[subjectCode] = subjectQuestions;
//                         subjectQuestionCounts[subjectCode] = subjectQuestions.length;
                        
//                         allQuestions = allQuestions.concat(subjectQuestions.map(q => ({
//                             question: q,
//                             subject: subjectCode
//                         })));
//                     }
//                 });
                
//                 chatMessages.removeChild(loadingIndicator);
                
//                 if (Object.keys(newQuestionBank).length > 0) {
//                     questionBank = newQuestionBank;
                    
//                     // Update the overview panel with all subject details
//                     updateOverviewPanel();
                    
//                     startBtn.disabled = false;
//                     showAlert("Press OK, then Click Start to begin the interview.", 'system');
//                 } else {
                    
//                     showAlert("Error: No data found from server. Please check your configuration.");
//                     startBtn.disabled = true;
//                 }
                
//                 return true;
//             } catch (error) {
//                 console.error('Error fetching data from Dataset:', error);
                
//                 const loadingIndicators = document.querySelectorAll('.loading');
//                 loadingIndicators.forEach(indicator => indicator.parentElement.remove());
                
                
//                 showAlert("Server error: Could not fetch data from server. Please check your internet connection and try again.");
//                 startBtn.disabled = true;
                
//                 return false;
//             }
//         }

//         // Start recording video, audio, speech-to-text, and timer
//         async function startRecording() {
//             try {
//                 if (allQuestions.length === 0) {
//                     showAlert("No questions available!");
//                     return;
//                 }
                
//                 currentQuestionIndex = 0;

//                 // Hide overview panel and show current subject
//                 hideOverviewShowSubject();

//                 // Access camera & microphone
//                 mediaStream = await navigator.mediaDevices.getUserMedia({
//                     video: true,
//                     audio: true
//                 });
//                 videoElement.srcObject = mediaStream;

//                 // Setup MediaRecorder
//                 mediaRecorder = new MediaRecorder(mediaStream);
//                 recordedChunks = [];
//                 mediaRecorder.ondataavailable = (event) => {
//                     if (event.data.size > 0) {
//                         recordedChunks.push(event.data);
//                     }
//                 };
//                 mediaRecorder.start(100);

//                 // Start speech recognition if available
//                 if (recognition) {
//                     recognition.start();
//                 }
//                 isRecording = true;
                
//                 // Update status indicator
//                 statusIndicator.classList.add('status-recording');

//                 startBtn.disabled = true;
//                 nextBtn.disabled = false;

//                 displayCurrentQuestion();
//                 startTimer();

//             } catch (error) {
//                 console.error('Error accessing media devices:', error);
                
//                 showAlert("Error accessing camera/microphone. Please allow permissions and try again.");
//             }
//         }

//         // Move to next question
//         function nextQuestion() {
//             if (isRecording) {
//                 currentQuestionIndex++;
//                 displayCurrentQuestion();

//                 if (currentQuestionIndex >= allQuestions.length) {
//                     nextBtn.disabled = true;
//                     submitBtn.disabled = false;
                    
//                     // Mark all questions as completed
//                     document.querySelectorAll('.question-item').forEach(item => {
//                         item.classList.add('completed');
//                     });
//                 }
//             }
//         }
       

//        // Function to stop recording and cleanup
//         function stopRecording() {
//             try {
//                 // Stop media recorder
//                 if (mediaRecorder && mediaRecorder.state !== 'inactive') {
//                     mediaRecorder.stop();
//                 }
                
//                 // Stop speech recognition
//                 if (recognition) {
//                     recognition.stop();
//                 }
                
//                 // Stop media stream (camera/microphone)
//                 if (mediaStream) {
//                     mediaStream.getTracks().forEach(track => track.stop());
//                 }
                
//                 // Clear timers
//                 clearInterval(timerInterval);
//                 clearInterval(subjectTimerInterval);
                
//                 // Update status
//                 isRecording = false;
//                 statusIndicator.classList.remove('status-recording');
                
//                 console.log("Recording stopped and cleaned up");
//             } catch (error) {
//                 console.error('Error stopping recording:', error);
//             }
//         }

//         // Upload recorded video to server
//         function uploadRecordedVideo() {
//             if (recordedChunks.length === 0) {
//                 showAlert("⚠️ No recording available to upload!");
//                 return;
//             }

              

//             submitBtn.disabled = true;
//             submitBtn.textContent = "Submitting...";

//             const username = localStorage.getItem("username") || "user";
//             const mobile = localStorage.getItem("mobile") || "0000000000";

//             const blob = new Blob(recordedChunks, { type: 'video/webm' });
//             const finalFilename = `${username}_${mobile}_video.webm`;
//             const file = new File([blob], finalFilename, { type: 'video/webm' });

//             const formData = new FormData();
//             formData.append('video', file);
//             formData.append('username', username);
//             formData.append('mobile', mobile);

//             fetch("https://copy-video-analysis-backend.onrender.com/upload", {
//                 method: "POST",
//                 body: formData
//             })
//             .then(res => {
//                 if (!res.ok) throw new Error("❌ Server error");
//                 return res.json();
//             })
//             .then(data => {
//                 console.log("✅ Upload success:", data);
//                 const message = "✅ Thank You! Your Submission has been sent successfully!";
//                 localStorage.setItem('uploadResultMessage', message);

//                 // Optional: trigger analysis
//                 fetch("http://localhost:5000/analyze-drive", {
//                     method: "GET",
//                     mode: "no-cors"
//                 }).catch(err => console.warn("Analyze-drive trigger failed:", err));

//                 // Redirect to result page
//                 sessionStorage.setItem("fromDashboard", "true");
//                 window.location.replace("result.html");

//                showAlert(message);
//             })
//             .catch(err => {
//                 console.error("❌ Upload failed:", err);
//                 const errorMsg = "⚠️ Something went wrong. Please try again.";
//                 showAlert(errorMsg);

//               // Re-enable submit button for retry
//                 submitBtn.disabled = false;
//                 submitBtn.textContent = "Retry Upload";
//                 submitBtn.style.background = "#ff9933";
//             });
//         }

//         // Event listeners
//         startBtn.addEventListener('click', () => {
//             console.log("Start button clicked");
//             startRecording();
//         });

//         nextBtn.addEventListener('click', () => {
//             console.log("Next button clicked");
//             nextQuestion();
//         });

//         submitBtn.addEventListener('click', () => {
//             console.log("Submit button clicked");
//             uploadRecordedVideo();
//         });

//         // Initialize speech recognition
//         initSpeechRecognition();
        
//         // Fetch data from Google Sheets when page loads
//         fetchDataFromGoogleSheets();
//     });











