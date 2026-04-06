class TimerController {
    constructor() {
        // Elements from index.html
        this.el = {
            inputMinutes: document.getElementById("input-minutes"),
            inputSeconds: document.getElementById("input-seconds"),
            eventTitle: document.getElementById("event-title"), // NEW
            startBtn: document.getElementById("start-btn"),
            controlBtn: document.getElementById("control-btn"),
            resetBtn: document.getElementById("reset-btn"),
            openDisplayBtn: document.getElementById("open-display-btn"),
            addTimeBtn: document.getElementById("add-time-btn"), // NEW
            subtractTimeBtn: document.getElementById("subtract-time-btn"), // NEW
            displayContainer: document.getElementById("local-timer-display"),
        };

        this.interval = null;
        this.remainingSeconds = 0; // This can now be a float
        this.displayWindow = null; 
        
        this.el.displayContainer.innerHTML = TimerController.getDisplayHTML();
        this.el.minutesDisplay = this.el.displayContainer.querySelector(".timer__part--minutes");
        this.el.secondsDisplay = this.el.displayContainer.querySelector(".timer__part--seconds");

        localStorage.removeItem('timerSeconds');
        localStorage.removeItem('eventTitle'); // NEW
        this.updateLocalDisplay(); 

        // Setup Event Listeners
        this.el.startBtn.addEventListener("click", () => this.handleStartFromSettings());
        this.el.controlBtn.addEventListener("click", () => this.handleControlClick());
        this.el.resetBtn.addEventListener("click", () => this.handleResetClick());
        this.el.openDisplayBtn.addEventListener("click", () => this.openDisplayWindow());
        
        // NEW: Listeners for on-the-fly adjustments
        this.el.addTimeBtn.addEventListener("click", () => this.handleAddTime());
        this.el.subtractTimeBtn.addEventListener("click", () => this.handleSubtractTime());
        
        this.el.inputMinutes.addEventListener("input", () => this.updateTimeFromInputs(false));
        this.el.inputSeconds.addEventListener("input", () => this.updateTimeFromInputs(false));
        // NEW: Update title in storage as user types
        this.el.eventTitle.addEventListener("input", () => {
             localStorage.setItem('eventTitle', this.el.eventTitle.value);
        });
    }
    
    // --- Data & Sync Methods ---

    updateTimeFromInputs(shouldStart = true) {
        const inputMin = parseInt(this.el.inputMinutes.value) || 0;
        const inputSec = parseInt(this.el.inputSeconds.value) || 0;
        
        const validatedSec = Math.min(Math.max(inputSec, 0), 59);
        this.el.inputSeconds.value = validatedSec; 

        const totalSeconds = (inputMin * 60) + validatedSec;
        
        if (totalSeconds > 0) {
            this.stop();
            this.remainingSeconds = totalSeconds;
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
        // Use Math.ceil to avoid showing 00:00 when there's still < 1 second left
        const totalSeconds = Math.ceil(this.remainingSeconds);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
    
        this.el.minutesDisplay.textContent = minutes.toString().padStart(2, "0");
        this.el.secondsDisplay.textContent = seconds.toString().padStart(2, "0");
        
        // Broadcast the precise float value
        localStorage.setItem('timerSeconds', this.remainingSeconds.toString());
        // Broadcast the title
        localStorage.setItem('eventTitle', this.el.eventTitle.value);
    }

    updateControlState() {
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
        if (!this.displayWindow || this.displayWindow.closed) {
            this.displayWindow = window.open('display.html', 'TimerDisplayWindow', 'width=800,height=600');
        }
        this.displayWindow.focus();
    }

    // --- Timer Logic ---

    start() {
        if (this.remainingSeconds <= 0) return;
        this.stop(); 
        
        // NEW: Update 20 times per second (every 50ms)
        this.interval = setInterval(() => {
            this.remainingSeconds -= 0.05; // Subtract 50ms

            if (this.remainingSeconds <= 0) {
                this.remainingSeconds = 0;
                this.stop();
            }
            
            this.updateLocalDisplay();
        }, 50);
        
        this.updateControlState();
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
        this.updateControlState();
    }

    // --- Event Handlers ---

    handleStartFromSettings() {
        const success = this.updateTimeFromInputs(true);
        if (!success) {
            console.error("Please set a time greater than zero before starting.");
        }
    }

    handleControlClick() {
        if (this.remainingSeconds <= 0) {
            this.handleStartFromSettings(); 
        } else if (this.interval === null) {
            this.start();
        } else {
            this.stop();
        }
    }

    handleResetClick() {
        this.stop();
        this.remainingSeconds = 0;
        this.el.inputMinutes.value = 0;
        this.el.inputSeconds.value = 0;
        this.el.eventTitle.value = "";
        this.updateLocalDisplay();
    }

    // NEW: On-the-fly adjustment handlers
    handleAddTime() {
        if (this.remainingSeconds <= 0) return; // Don't add time to a finished timer
        this.remainingSeconds += 60; // Add 1 minute
        this.updateLocalDisplay();
    }

    handleSubtractTime() {
        if (this.remainingSeconds <= 0) return;
        this.remainingSeconds = Math.max(0, this.remainingSeconds - 30); // Subtract 30 sec, don't go below 0
        this.updateLocalDisplay();
    }

    // --- HTML Template ---

    static getDisplayHTML() {
        return `
            <span class="timer__part timer__part--minutes">00</span>
            <span class="timer__part">:</span>
            <span class="timer__part timer__part--seconds">00</span>
        `;
    }
}

new TimerController();
