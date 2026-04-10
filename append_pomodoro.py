POMODORO_JS = """
// Pomodoro Timer Logic
document.addEventListener('DOMContentLoaded', () => {
    let pmInterval;
    let pmTimeLeft = 25 * 60;
    let isRunning = false;
    let currentMode = 'focus'; // focus, short-break, long-break
    
    const timeDisplay = document.getElementById('pomodoroTime');
    const modeDisplay = document.getElementById('pomodoroMode');
    const toggleBtn = document.getElementById('pomodoroToggleBtn');
    const widget = document.getElementById('pomodoroWidget');
    
    function updateDisplay() {
        let mins = Math.floor(pmTimeLeft / 60);
        let secs = pmTimeLeft % 60;
        timeDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        pmInterval = setInterval(() => {
            if (pmTimeLeft > 0) {
                pmTimeLeft--;
                updateDisplay();
            } else {
                clearInterval(pmInterval);
                isRunning = false;
                alert('Time is up!');
            }
        }, 1000);
    }
    
    function pauseTimer() {
        clearInterval(pmInterval);
        isRunning = false;
    }
    
    function resetTimer() {
        pauseTimer();
        if(currentMode === 'focus') pmTimeLeft = 25 * 60;
        if(currentMode === 'short-break') pmTimeLeft = 5 * 60;
        if(currentMode === 'long-break') pmTimeLeft = 15 * 60;
        updateDisplay();
    }
    
    if(document.getElementById('pmStart')) document.getElementById('pmStart').addEventListener('click', startTimer);
    if(document.getElementById('pmPause')) document.getElementById('pmPause').addEventListener('click', pauseTimer);
    if(document.getElementById('pmReset')) document.getElementById('pmReset').addEventListener('click', resetTimer);
    
    if(document.getElementById('pm25')) document.getElementById('pm25').addEventListener('click', () => {
        currentMode = 'focus';
        modeDisplay.textContent = 'Study Session';
        resetTimer();
    });
    if(document.getElementById('pm5')) document.getElementById('pm5').addEventListener('click', () => {
        currentMode = 'short-break';
        modeDisplay.textContent = 'Short Break';
        pmTimeLeft = 5 * 60;
        resetTimer();
    });
    if(document.getElementById('pm15')) document.getElementById('pm15').addEventListener('click', () => {
        currentMode = 'long-break';
        modeDisplay.textContent = 'Long Break';
        pmTimeLeft = 15 * 60;
        resetTimer();
    });
    
    if(toggleBtn) toggleBtn.addEventListener('click', () => {
        widget.classList.toggle('minimized');
        toggleBtn.innerHTML = widget.classList.contains('minimized') 
            ? '<i class="fas fa-chevron-up"></i>' 
            : '<i class="fas fa-chevron-down"></i>';
    });
    
    if(timeDisplay) updateDisplay();
});
"""

with open("s:/zzz/script.js", "a", encoding="utf-8") as f:
    f.write("\n" + POMODORO_JS)
