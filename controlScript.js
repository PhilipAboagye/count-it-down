class TimerController {
    constructor() {
        // Elements from index.html
        this.el = {
            inputMinutes: document.getElementById("input-minutes"),
            inputSeconds: document.getElementById("input-seconds"),
            eventTitle: document.getElementById("event-title"),
            startBtn: document.getElementById("start-btn"),
            controlBtn: document.getElementById("control-btn"),
            resetBtn: document.getElementById("reset-btn"),
            openDisplayBtn: document.getElementById("open-display-btn"),
            addTimeBtn: document.getElementById("add-time-btn"),
            subtractTimeBtn: document.getElementById("subtract-time-btn"),
            displayContainer: document.getElementById("local-timer-display"),
            syncMinuteBtn: document.getElementById("sync-minute-btn"),
            syncHourBtn: document.getElementById("sync-hour-btn"),
            
            // NEW: Image Upload Elements
            imageUpload: document.getElementById("image-upload"),
            imagePreview: document.getElementById("image-preview"),
            clearImageBtn: document.getElementById("clear-image-btn"),
        };

        this.interval = null;
        this.remainingSeconds = 0;
        this.displayWindow = null; 
        
        this.timerMode = 'duration'; 
        this.targetTime = null; 

        this.el.displayContainer.innerHTML = TimerController.getDisplayHTML();
        this.el.minutesDisplay = this.el.displayContainer.querySelector(".timer__part--minutes");
        this.el.secondsDisplay = this.el.displayContainer.querySelector(".timer__part--seconds");

        // Clear all local storage on init
        localStorage.removeItem('timerSeconds');
        localStorage.removeItem('eventTitle');
        localStorage.removeItem('timerTotalSeconds');
        localStorage.removeItem('completionImage'); // NEW
        
        this.updateLocalDisplay(); 

        // Setup Event Listeners
        this.el.startBtn.addEventListener("click", () => this.handleStartFromSettings());
        this.el.controlBtn.addEventListener("click", () => this.handleControlClick());
        this.el.resetBtn.addEventListener("click", () => this.handleResetClick());
        this.el.openDisplayBtn.addEventListener("click", () => this.openDisplayWindow());
        
        this.el.addTimeBtn.addEventListener("click", () => this.handleAddTime());
        this.el.subtractTimeBtn.addEventListener("click", () => this.handleSubtractTime());
        
        this.el.syncMinuteBtn.addEventListener("click", () => this.handleSyncToMinute());
        this.el.syncHourBtn.addEventListener("click", () => this.handleSyncToHour());

        this.el.inputMinutes.addEventListener("input", () => this.updateTimeFromInputs(false));
        this.el.inputSeconds.addEventListener("input", () => this.updateTimeFromInputs(false));
        this.el.eventTitle.addEventListener("input", () => {
             localStorage.setItem('eventTitle', this.el.eventTitle.value);
        });

        // NEW: Image Upload Listeners
        this.el.imageUpload.addEventListener("change", (e) => this.handleImageUpload(e));
        this.el.clearImageBtn.addEventListener("click", () => this.handleClearImage());
    }
    
    // --- Data & Sync Methods ---

    updateTimeFromInputs(shouldStart = true) {
// ... (existing code, no changes) ...
        this.timerMode = 'duration';
        this.targetTime = null;

        const inputMin = parseInt(this.el.inputMinutes.value) || 0;
        const inputSec = parseInt(this.el.inputSeconds.value) || 0;
        
        const validatedSec = Math.min(Math.max(inputSec, 0), 59);
        this.el.inputSeconds.value = validatedSec; 

        const totalSeconds = (inputMin * 60) + validatedSec;
        
        if (totalSeconds > 0) {
            this.stop();
            this.remainingSeconds = totalSeconds;
            localStorage.setItem('timerTotalSeconds', totalSeconds.toString()); 
            
            this.updateLocalDisplay(); 
            
            if (shouldStart) {
                this.start();
                this.openDisplayWindow();
            }
            return true;
        }
        
        if (!shouldStart) {
             this.remainingSeconds = totalSeconds;
             this.updateLocalDisplay();
        }
        
        return false;
    }

    updateLocalDisplay() {
// ... (existing code, no changes) ...
        const totalSeconds = Math.ceil(this.remainingSeconds);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
    
        this.el.minutesDisplay.textContent = minutes.toString().padStart(2, "0");
        this.el.secondsDisplay.textContent = seconds.toString().padStart(2, "0");
        
        localStorage.setItem('timerSeconds', this.remainingSeconds.toString());
        localStorage.setItem('eventTitle', this.el.eventTitle.value);
    }

    updateControlState() {
// ... (existing code, no changes) ...
        if (this.interval === null) {
            this.el.controlBtn.innerHTML = `<span class="material-icons text-3xl">play_arrow</span>`;
            this.el.controlBtn.classList.remove("bg-yellow-600", "hover:bg-yellow-700");
            this.el.controlBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
            this.el.controlBtn.setAttribute('data-action', 'play');
        } else {
            this.el.controlBtn.innerHTML = `<span class="material-icons text-3xl">pause</span>`;
            this.el.controlBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
            this.el.controlBtn.classList.add("bg-yellow-600", "hover:bg-yellow-700");
            this.el.controlBtn.setAttribute('data-action', 'pause');
        }
    }
    
    openDisplayWindow() {
// ... (existing code, no changes) ...
        if (!this.displayWindow || this.displayWindow.closed) {
            this.displayWindow = window.open('display.html', 'TimerDisplayWindow', 'width=800,height=600');
        }
        this.displayWindow.focus();
    }

    // --- Timer Logic ---

    start() {
// ... (existing code, no changes) ...
        if (this.remainingSeconds <= 0 && this.timerMode !== 'target') return;
        this.stop(); 
        
        this.interval = setInterval(() => {
            
            if (this.timerMode === 'target' && this.targetTime) {
                this.remainingSeconds = (this.targetTime - Date.now()) / 1000;
            } else {
                this.remainingSeconds -= 0.05; // Subtract 50ms
            }

            if (this.remainingSeconds <= 0) {
                this.remainingSeconds = 0;
                this.stop();
                this.targetTime = null; // Clear target once hit
                this.timerMode = 'duration'; // Reset to duration mode
            }
            
            this.updateLocalDisplay();
        }, 50); // 20 times per second
        
        this.updateControlState();
    }

    stop() {
// ... (existing code, no changes) ...
        clearInterval(this.interval);
        this.interval = null;
        this.updateControlState();
    }

    // --- Event Handlers ---

    handleStartFromSettings() {
// ... (existing code, no changes) ...
        const success = this.updateTimeFromInputs(true);
        if (!success) {
            console.error("Please set a time greater than zero before starting.");
        }
    }

    handleControlClick() {
// ... (existing code, no changes) ...
        if (this.remainingSeconds <= 0 && this.timerMode === 'duration') {
            this.handleStartFromSettings(); 
        } else if (this.interval === null) {
            this.start(); // This will auto-sync if in 'target' mode
        } else {
            this.stop(); // Pause
        }
    }

    handleResetClick() {
// ... (existing code, no changes) ...
        this.stop();
        this.timerMode = 'duration';
        this.targetTime = null;
        this.remainingSeconds = 0;
        this.el.inputMinutes.value = 0;
        this.el.inputSeconds.value = 0;
        this.el.eventTitle.value = "";
        
        localStorage.setItem('timerTotalSeconds', '0');
        this.handleClearImage(); // NEW: Clear image on reset

        this.updateLocalDisplay();
    }

    handleAddTime() {
// ... (existing code, no changes) ...
        if (this.remainingSeconds <= 0) return;

        if (this.timerMode === 'target' && this.targetTime) {
            this.targetTime += 60000;
            const newTotal = parseFloat(localStorage.getItem('timerTotalSeconds') || '0') + 60;
            localStorage.setItem('timerTotalSeconds', newTotal.toString());
        }
        this.remainingSeconds += 60;
        this.updateLocalDisplay();
    }

    handleSubtractTime() {
// ... (existing code, no changes) ...
        if (this.remainingSeconds <= 0) return;

        if (this.timerMode === 'target' && this.targetTime) {
            this.targetTime -= 30000;
            const newTotal = parseFloat(localStorage.getItem('timerTotalSeconds') || '0') - 30;
            localStorage.setItem('timerTotalSeconds', newTotal.toString());
        }
        this.remainingSeconds = Math.max(0, this.remainingSeconds - 30);
        this.updateLocalDisplay();
    }

    handleSyncToMinute() {
// ... (existing code, no changes) ...
        const now = new Date();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        
        const remaining = 60.0 - seconds - (milliseconds / 1000.0);

        this.stop();
        this.timerMode = 'target';
        this.targetTime = now.getTime() + (remaining * 1000);
        
        this.remainingSeconds = remaining;
        localStorage.setItem('timerTotalSeconds', remaining.toString()); 

        this.el.eventTitle.value = "Syncing to top of minute...";
        this.updateLocalDisplay();
        this.start();
        this.openDisplayWindow();
    }

    handleSyncToHour() {
// ... (existing code, no changes) ...
        const now = new Date();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();

        const remainingSecsInMin = 60.0 - seconds - (milliseconds / 1000.0);
        const remainingMinsInHour = 59 - minutes;
        
        const totalRemaining = (remainingMinsInHour * 60) + remainingSecsInMin;
        
        this.stop();
        this.timerMode = 'target';
        this.targetTime = now.getTime() + (totalRemaining * 1000);
        
        this.remainingSeconds = totalRemaining;
        localStorage.setItem('timerTotalSeconds', totalRemaining.toString()); 

        this.el.eventTitle.value = "Syncing to top of hour...";
        this.updateLocalDisplay();
        this.start();
        this.openDisplayWindow();
    }

    // --- NEW: Image Handlers ---

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (e.g., 2MB limit for localStorage)
        if (file.size > 2 * 1024 * 1024) {
            alert("Image is too large! Please choose a file under 2MB.");
            this.el.imageUpload.value = null; // Reset input
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const base64String = e.target.result;
            
            // 1. Save to localStorage for the display tab
            localStorage.setItem('completionImage', base64String);
            
            // 2. Show preview in controller
            this.el.imagePreview.src = base64String;
            this.el.imagePreview.classList.remove('hidden');
            this.el.clearImageBtn.classList.remove('hidden');
        };

        // Read the file as a Data URL (Base64)
        reader.readAsDataURL(file);
    }

    handleClearImage() {
        // 1. Clear from localStorage
        localStorage.removeItem('completionImage');
        
        // 2. Clear preview in controller
        this.el.imagePreview.src = '';
        this.el.imagePreview.classList.add('hidden');
        this.el.clearImageBtn.classList.add('hidden');
        
        // 3. Reset the file input field
        this.el.imageUpload.value = null;
    }


    // --- HTML Template ---

    static getDisplayHTML() {
// ... (existing code, no changes) ...
        return `
            <span class="timer__part timer__part--minutes">00</span>
            <span class="timer__part">:</span>
            <span class="timer__part timer__part--seconds">00</span>
        `;
    }
}

new TimerController();

