// Time update function
function updateTime() {
    const now = new Date();
    
    // Get time components
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 12 AM/PM
    
    // Format with leading zeros
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    // Update time display
    document.getElementById('time').textContent = 
        `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    document.getElementById('ampm').textContent = ampm;
    
    // Format date
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', options);
}

// Screen wake lock API
let wakeLock = null;

// Function to request screen wake lock
async function requestWakeLock() {
    try {
        // Check if wake lock is supported
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen wake lock acquired');
            
            // Handle wake lock release
            wakeLock.addEventListener('release', () => {
                console.log('Screen wake lock released');
                document.getElementById('preventSleepBtn').classList.remove('active');
                document.getElementById('preventSleepBtn').textContent = '🔒 Screen OFF';
            });
            
            document.getElementById('preventSleepBtn').classList.add('active');
            document.getElementById('preventSleepBtn').textContent = '🔒 Screen ON';
            return true;
        } else {
            console.warn('Wake Lock API not supported');
            showFallbackMessage();
            return false;
        }
    } catch (err) {
        console.error('Failed to acquire wake lock:', err);
        showFallbackMessage();
        return false;
    }
}

// Function to release wake lock
function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release()
            .then(() => {
                wakeLock = null;
                console.log('Wake lock released manually');
                document.getElementById('preventSleepBtn').classList.remove('active');
                document.getElementById('preventSleepBtn').textContent = '🔒 Screen ON';
            })
            .catch(err => {
                console.error('Error releasing wake lock:', err);
            });
    }
}

// Fallback for browsers that don't support Wake Lock API
function showFallbackMessage() {
    const infoDiv = document.querySelector('.info');
    const fallbackMsg = document.createElement('p');
    fallbackMsg.style.color = '#ff6b6b';
    fallbackMsg.style.marginTop = '10px';
    fallbackMsg.innerHTML = '⚠️ Your browser doesn\'t support screen wake lock. Try Chrome, Edge, or Safari on iOS.';
    infoDiv.appendChild(fallbackMsg);
}

// Handle page visibility - reacquire lock when page becomes visible again
function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && wakeLock === null) {
        // Optional: Auto-reacquire lock when page becomes visible
        console.log('Page visible, you can manually re-enable screen lock');
    }
}

// Alternative: Keep screen awake using video element (fallback)
function alternativeKeepAwake() {
    // Create a hidden video element that loops
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.style.display = 'none';
    
    // Create a silent blob
    const blob = new Blob([], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    video.src = url;
    
    document.body.appendChild(video);
    video.play().catch(e => console.log('Video fallback failed:', e));
    
    return video;
}

// Event listeners
document.getElementById('preventSleepBtn').addEventListener('click', async () => {
    await requestWakeLock();
});

document.getElementById('allowSleepBtn').addEventListener('click', () => {
    releaseWakeLock();
});

// Handle page visibility
document.addEventListener('visibilitychange', handleVisibilityChange);

// Handle page unload to release wake lock
window.addEventListener('beforeunload', () => {
    if (wakeLock !== null) {
        wakeLock.release();
    }
});

// Initialize
updateTime();
setInterval(updateTime, 1000); // Update every second

// Try to request wake lock automatically on page load (optional)
// Uncomment the line below if you want auto-activation
// requestWakeLock();

// Prevent touch events from causing screen dimming
document.body.addEventListener('touchstart', (e) => {
    // Just to keep screen active on touch
    console.log('Touch detected');
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});