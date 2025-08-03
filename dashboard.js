// 🎯 DOM Elements: Fetching elements from the HTML page
const videoElement = document.getElementById('userVideo');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const chatMessages = document.getElementById('chatMessages');
const currentQuestion = document.getElementById('currentQuestion');
const typingIndicator = document.getElementById('typingIndicator'); // Optional

// 🔘 Event Listeners for button actions
startBtn.addEventListener('click', startRecording);
nextBtn.addEventListener('click', nextQuestion);
submitBtn.addEventListener('click', uploadRecordedVideo);

// ❓ Question list for interview/chat simulation
// const questions = [
//     "What is the difference between supervised, unsupervised, and reinforcement learning?",
//     "What is the bias-variance trade-off in machine learning?",
//     "What are overfitting and underfitting? How can they be prevented?",
//     "What is the purpose of cross-validation?",
//     "What are precision, recall, F1-score, and accuracy? When should each be used?",
//     "What is regularization? Explain L1 and L2 regularization.",
//     "What is the difference between bagging and boosting?",
//     "How do decision trees and random forests work?",
//     "What are the assumptions of linear regression?",
//     "What are the differences between generative and discriminative models?"
// ];

let questions = [];  // This will now be dynamically filled based on subject
let selectedSubject = "";
// // 🗂️ Function to get questions based on selected subject
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

// 🔁 State variables to control app flow
let mediaStream;         // Stores video+audio stream
let mediaRecorder;       // Object that records the stream
let recordedChunks = []; // Stores chunks of recorded video
let recognition;         // For speech-to-text
let isRecording = false;
let currentQuestionIndex = 0;  // Tracks which question is active

// 🧠 Initialize speech recognition (if browser supports it)
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;        // Keep listening
        recognition.interimResults = true;    // Show partial speech results

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    addMessage(transcript, 'user'); // Final transcript
                } else {
                    interimTranscript += transcript; // Still speaking
                }
            }

            // Show typing-like interim message
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
        // If not supported
        console.warn('Speech recognition not supported');
        addMessage("Speech recognition not supported in this browser", 'system');
    }
}

// 💬 Add message to chat window
function addMessage(text, sender) {
    // Remove any temporary (interim) messages
    const interimMessages = document.querySelectorAll('.interim');
    interimMessages.forEach(msg => msg.remove());

    // Create new chat message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;

    // Add it to chat
    chatMessages.appendChild(messageDiv);

    // Scroll chat to bottom
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

// ❓ Display the current question
function displayCurrentQuestion() {
    if (currentQuestionIndex < questions.length) {
        const questionText = `Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex]}`;
        currentQuestion.textContent = questionText;
        addMessage(questionText, 'system');
    } else {
        // All questions done
        currentQuestion.textContent = "All questions completed. Ready to submit.";
        nextBtn.disabled = true;
        submitBtn.disabled = false;
    }
}

// 🎥 Start video + audio recording
async function startRecording() {
    try {
        selectedSubject = document.getElementById('subjectSelect').value;
        if (!selectedSubject) {
            alert("⚠️ Please select a subject before starting!");
            return;
        }
        questions = questionBank[selectedSubject];
        // Ask permission for camera and microphone
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });

        videoElement.srcObject = mediaStream; // Show live video

        // Setup recorder
        mediaRecorder = new MediaRecorder(mediaStream);
        recordedChunks = [];

        // Push video chunks to array
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        // Start recording
        mediaRecorder.start(100); // Collect every 100ms

        // Start speech recognition
        if (recognition) {
            recognition.start();
            isRecording = true;
        }

        // Update button states
        startBtn.disabled = true;
        nextBtn.disabled = false;

        // Show first question
        displayCurrentQuestion();

    } catch (error) {
        console.error('Error accessing media devices:', error);
        addMessage("Error accessing camera/microphone", 'system');
    }
}

// ⏭ Go to next question
function nextQuestion() {
    if (isRecording) {
        currentQuestionIndex++;
        displayCurrentQuestion();

        // Disable "Next" if it's the last question
        if (currentQuestionIndex >= questions.length) {
            nextBtn.disabled = true;
        }
    }
}

// 📤 Upload video to Flask backend for processing
// function uploadRecordedVideo() {
//     if (recordedChunks.length === 0) {
//         alert("⚠️ No recording available to upload!");
//         return;
//     }

//     // 🔐 Step 1: Get username from localStorage
//     const username = localStorage.getItem("username");
//     const mobile = localStorage.getItem("mobile");

//     // 🎥 Step 2: Create video blob with username in filename
//     const blob = new Blob(recordedChunks, { type: 'video/webm' });
//     const finalFilename = `${username}_${mobile}_video.webm`;  // ✅  e.g., avinash_9876543210_video.webm
//     const file = new File([blob], finalFilename, { type: 'video/webm' });

//     // 📤 Step 3: Prepare FormData
//     const formData = new FormData();
//     formData.append("video", file);

//     // 🛰️ Step 4: Send POST request
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
//         document.getElementById("result").innerText =
//             `\n✅ Thank You! Your Submission has been sent successfully!\n`;
//     })
//     .catch(err => {
//         console.error("❌ Upload failed", err);
//         document.getElementById("result").innerText =
//             "\n❌ Submission failed. Please try again later.";
//     });
// }

function uploadRecordedVideo() {
    if (recordedChunks.length === 0) {
        alert("⚠️ No recording available to upload!");
        return;
    }

    // Disable submit button immediately
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    // 🔐 Step 1: Get username from localStorage
    const username = localStorage.getItem("username");
    const mobile = localStorage.getItem("mobile");

    // 🎥 Step 2: Create video blob with username in filename
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const finalFilename = `${username}_${mobile}_video.webm`;  // e.g., avinash_9876543210_video.webm
    const file = new File([blob], finalFilename, { type: 'video/webm' });

    // 📤 Step 3: Prepare FormData
    const formData = new FormData();
    formData.append("video", file);

    // 🛰️ Step 4: Send POST request
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
        document.getElementById("result").innerText =
            `✅ Thank You! Your Submission has been sent successfully!`;

        // Disable buttons after successful submission
        startBtn.disabled = true;
        nextBtn.disabled = true;
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitted ✅";
    })
    .catch(err => {
        console.error("❌ Upload failed", err);
        document.getElementById("result").innerText =
            "❌ Submission failed. Please try again later.";

        // Re-enable submit button on failure
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
    });
}


// 🚀 Start speech recognition when script loads
initSpeechRecognition();

