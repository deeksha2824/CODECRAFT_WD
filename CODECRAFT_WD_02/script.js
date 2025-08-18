const timer = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const lapsList = document.getElementById('laps');
const exportBtn = document.getElementById('exportBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const soundBtn = document.getElementById('soundBtn');
const shortcutBtn = document.getElementById('shortcutBtn');
const modeToggleBtn = document.getElementById('modeToggleBtn');

let startTime = 0;
let elapsedTime = 0;
let timerInterval;
let running = false;
let previousLap = 0;
let soundOn = false;
let lapTimes = [];
let isCountdownMode = false;
let countdownDuration = 0;  // in ms
let countdownTarget = 0;    // timestamp when countdown ends

// Beep sound for lap (short ding)
const beepAudio = new Audio(
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YRgAAAD/AAD//wAA//8AAP8AAAD+AAD+AAABAAEA/wAA/wAAgAEAAIAAAACAAQAAgAADgAMAA4ADAAeABAAHwD/AH8A/wB/AH8A/wD/"
);

function timeToString(time) {
  const milliseconds = time % 1000;
  const totalSeconds = Math.floor(time / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  const formattedMilliseconds = milliseconds.toString().padStart(3, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
}

function start() {
  if (running) return;
  running = true;
  if (!isCountdownMode) {
    startTime = Date.now() - elapsedTime;
  } else {
    countdownTarget = Date.now() + (countdownDuration - elapsedTime);
  }

  timerInterval = setInterval(() => {
    if (!isCountdownMode) {
      elapsedTime = Date.now() - startTime;
      timer.textContent = timeToString(elapsedTime);
    } else {
      elapsedTime = countdownTarget - Date.now();

      if (elapsedTime <= 0) {
        elapsedTime = 0;
        timer.textContent = timeToString(elapsedTime);
        pause();
        alert('Countdown finished!');
        return;
      }

      timer.textContent = timeToString(elapsedTime);
    }
  }, 10);

  toggleButtons(true);
}


function pause() {
  if (!running) return;
  running = false;
  clearInterval(timerInterval);
  toggleButtons(false, true);
}

function updateTimerDisplay() {
  if (!isCountdownMode) {
    timer.textContent = timeToString(elapsedTime);
  } else {
    timer.textContent = timeToString(countdownDuration);
  }
}

function reset() {
  running = false;
  clearInterval(timerInterval);
  elapsedTime = 0;
  lapTimes = [];
  timer.textContent = isCountdownMode ? timeToString(countdownDuration) : "00:00:00.000";
  lapsList.innerHTML = "";
  previousLap = 0;
  toggleButtons(false, false, true);
}


function lap() {
  if (!running) return;
  const lapTime = elapsedTime;
  const lapString = timeToString(lapTime);

  let diffString = '';
  let lapDuration = lapTime;
  if (lapTimes.length > 0) {
    lapDuration = lapTime - lapTimes[lapTimes.length - 1];
    diffString = ` (+${timeToString(lapDuration)})`;
  }
  lapTimes.push(lapTime);

  const lapItem = document.createElement('li');
  lapItem.textContent = lapString + diffString;
  lapsList.appendChild(lapItem);
  lapsList.scrollTop = lapsList.scrollHeight;

  highlightBestWorstaverage();

  if (soundOn) {
    beepAudio.currentTime = 0;
    beepAudio.play();
  }
}

function highlightBestWorstaverage() {
  if (lapTimes.length < 1) return;

  // Calculate lap durations (time differences between laps)
  const durations = lapTimes.map((time, idx) =>
    idx === 0 ? time : time - lapTimes[idx - 1]
  );

  let min = Math.min(...durations);
  let max = Math.max(...durations);
  let avg = durations.reduce((a,b) => a+b, 0) / durations.length;

  const lapItems = lapsList.children;

  // Remove previous highlights
  for (let item of lapItems) {
    item.style.backgroundColor = '';
    item.style.fontWeight = '';
  }
  
  // Mark best (fastest)
  for (let i=0; i<durations.length; i++) {
    if (durations[i] === min) {
      lapItems[i].style.backgroundColor = 'rgba(40, 180, 40, 0.3)'; // green
      lapItems[i].style.fontWeight = '700';
    }
  }
  // Mark worst (slowest)
  for (let i=0; i<durations.length; i++) {
    if (durations[i] === max) {
      lapItems[i].style.backgroundColor = 'rgba(220, 40, 40, 0.3)'; // red
      lapItems[i].style.fontWeight = '700';
    }
  }
}

function toggleButtons(isRunning, isPaused = false, isReset = false) {
  startBtn.disabled = isRunning;
  pauseBtn.disabled = !isRunning;
  lapBtn.disabled = !isRunning;
  resetBtn.disabled = !(isPaused || isReset);
  exportBtn.disabled = lapsList.children.length === 0;
  lapBtn.disabled = !isRunning || isCountdownMode;
}

function exportLapsCSV() {
  if (lapsList.children.length === 0) return;
  let rows = ['Lap Number,Time'];
  Array.from(lapsList.children).forEach((item, i) => {
    rows.push(`${i + 1},${item.textContent}`);
  });
  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lap_times.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
}

soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.textContent = `Sound: ${soundOn ? 'On' : 'Off'}`;
});

shortcutBtn.addEventListener('click', () => {
  document.getElementById('shortcutModal').style.display = 'block';
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
  document.getElementById('shortcutModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('shortcutModal')) {
    document.getElementById('shortcutModal').style.display = 'none';
  }
});

document.addEventListener('keydown', event => {
  if(event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
  switch(event.key.toLowerCase()) {
    case " ":
      event.preventDefault();
      if (running) pause(); else start();
      break;
    case "r":
      reset();
      break;
    case "l":
      if (!lapBtn.disabled) lap();
      break;
    case "t":
      toggleTheme();
      break;
  }
});

modeToggleBtn.addEventListener('click', () => {
  if (!isCountdownMode) {
    // Switch to countdown mode
    let inputMinutes = prompt('Enter countdown duration in minutes:', '1');
    if (inputMinutes === null) return;  // Cancelled
    const minutes = parseFloat(inputMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      alert('Invalid input. Please enter a positive number.');
      return;
    }
    countdownDuration = minutes * 60000;  // convert to ms
    countdownTarget = Date.now() + countdownDuration;
    isCountdownMode = true;
    modeToggleBtn.textContent = 'Switch to Stopwatch';
    reset();
  } else {
    // Switch back to stopwatch mode
    isCountdownMode = false;
    modeToggleBtn.textContent = 'Switch to Countdown';
    reset();
  }
  updateTimerDisplay();
});

startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);
lapBtn.addEventListener('click', lap);
exportBtn.addEventListener('click', exportLapsCSV);
themeToggleBtn.addEventListener('click', toggleTheme);

// Initialize buttons on page load
toggleButtons(false, false, true);
