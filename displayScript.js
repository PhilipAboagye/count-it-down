// displayScript.js

// --- 1. Audio Context Setup ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let beepBuffer = null;

(function createBeep() {
    if (!audioCtx) return;
    const duration = 0.1; // 100ms beep
    const sampleRate = audioCtx.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate;
        data[i] = Math.sin(t * 2 * Math.PI * 880); // 880Hz tone (A5)
    }
    beepBuffer = buffer;
})();

function playBeep() {
    if (!audioCtx || !beepBuffer) return;
    const source = audioCtx.createBufferSource();
    source.buffer = beepBuffer;
    source.connect(audioCtx.destination);
    source.start();
}
// --- End Audio Setup ---


// --- 2. Element & State Setup ---
const timerDisplay = document.querySelector(".timer");
const titleDisplay = document.getElementById("event-title-display");
const overlay = document.getElementById("completion-overlay");
const progressBar = document.getElementById("progress-bar");

let timeUp = false;
let totalDuration = 0; 


// --- 3. Main Display Update Function ---
function updateDisplay(remaining) {
    // --- Timer Logic ---
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = Math.floor(remaining % 60);
    const milliseconds = Math.floor((remaining - Math.floor(remaining)) * 100);

    // Format and inject HTML
    //<span class="timer__part">${hours.toString().padStart(2, "0")}</span>
       // <span class="timer__part--colon">:</span>
    timerDisplay.innerHTML = `
        
        <span class="timer__part">${minutes.toString().padStart(2, "0")}</span>
        <span class="timer__part--colon">:</span>
        <span class="timer__part">${seconds.toString().padStart(2, "0")}</span>
        <span class="timer__part--milliseconds">.${milliseconds.toString().padStart(2, "0")}</span>
    `;

    // --- Progress Bar Logic ---
    if (totalDuration > 0) {
        const percentage = Math.max(0, Math.min(100, (remaining / totalDuration) * 100));
        progressBar.style.width = `${percentage}%`;
    } else {
        progressBar.style.width = '0%';
    }

    // --- Urgency & Completion Logic ---
    if (remaining <= 0) {
        if (!timeUp) {
            timeUp = true;
            playBeep();
            overlay.style.display = "block";
            setTimeout(() => overlay.classList.add("show"), 10);
        }
    } else {
        if (timeUp) {
            timeUp = false;
            overlay.classList.remove("show");
            setTimeout(() => overlay.style.display = "none", 2000);
        }

        // Urgency visual state (under 10 seconds)
        if (remaining < 10) {
            document.body.classList.add("urgency");
            timerDisplay.classList.add("urgency-text");
            progressBar.classList.add("urgency-bar");
        } else {
            document.body.classList.remove("urgency");
            timerDisplay.classList.remove("urgency-text");
            progressBar.classList.remove("urgency-bar");
        }
    }
}


// --- 4. Storage Event Listener ---
window.addEventListener('storage', (event) => {
    if (event.key === 'timerSeconds') {
        const newTime = parseFloat(event.newValue) || 0;
        updateDisplay(newTime);
    }
    
    if (event.key === 'eventTitle') {
        titleDisplay.textContent = event.newValue || "";
    }

    if (event.key === 'timerTotalSeconds') {
        totalDuration = parseFloat(event.newValue) || 0;
        const currentTime = parseFloat(localStorage.getItem('timerSeconds')) || 0;
        updateDisplay(currentTime);
    }

    // NEW: Listen for the completion image
    if (event.key === 'completionImage') {
        const newImage = event.newValue;
        if (newImage) {
            // User uploaded an image, so set it.
            overlay.style.backgroundImage = `url(${newImage})`;
        } else {
            // User cleared the image. Reset the inline style.
            // This will make the browser use the default from the CSS.
            overlay.style.backgroundImage = ''; 
        }
    }
});


// --- 5. Initial Load ---
const initialTime = parseFloat(localStorage.getItem('timerSeconds')) || 0;
const initialTitle = localStorage.getItem('eventTitle') || "";
totalDuration = parseFloat(localStorage.getItem('timerTotalSeconds')) || 0;
// NEW: Load the image on initial load
const initialImage = localStorage.getItem('completionImage');

if (initialImage) {
    // If a user image exists in storage, apply it
    overlay.style.backgroundImage = `url(${initialImage})`;
}
// If initialImage is null, no inline style is set, so the
// default CSS from display.html is automatically used.

titleDisplay.textContent = initialTitle;
updateDisplay(initialTime);

// Ensure overlay is hidden on initial load
if (initialTime > 0) {
    overlay.classList.remove("show");
    overlay.style.display = "none";
}

