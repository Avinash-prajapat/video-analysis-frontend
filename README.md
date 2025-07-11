# 🎥 Live Video Recorder with Voice Transcription

This project records live video and voice from the browser, sends it to the Flask backend, where it is:

1. Uploaded to Google Drive  
2. Transcribed to text using a speech recognition model  
3. The transcribed text is displayed live on the right panel

---

## 🔧 Technologies Used

### Frontend:
- HTML
- CSS
- JavaScript
- MediaRecorder API

### Backend:
- Python Flask (for receiving video, uploading to Google Drive, and transcribing audio)

---

## 📁 Project Structure


---

## 🚀 How to Use

1. Open `index.html` in any browser.
2. Click `Start` to begin recording video and audio.
3. Click `Stop` to stop the recording.
4. Click `Submit` to upload the video and receive the transcription.
5. The transcribed voice will appear on the right side (like a chatbot).

---

## 📌 Notes

- You must have the Flask backend running on `http://localhost:5000/upload`.
- Ensure `CORS` is enabled in Flask.
- Your backend must handle:
  - Receiving video via POST
  - Uploading it to Google Drive
  - Transcribing audio using `speech_recognition` or any ML model
  - Returning the transcript to the frontend

---

## 📷 UI Preview

![UI Screenshot](assets/screenshot.png) *(Optional)*

---

## ✨ Created By

> MCA-AIML Student  
> 🔗 [GitHub Profile Link](https://github.com/Avinash-prajapat)
