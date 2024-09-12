document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer');
    const resetBtn = document.getElementById('resetBtn');
    const testBtn = document.getElementById('testBtn');
    console.log('Reset button:', resetBtn);
    console.log('Test button:', testBtn);
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let timerInterval;
    let isTimerRunning = false;
    let notificationSent = false; // Add flag variable

    // Request notification permission
    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
                return permission === 'granted';
            });
        } else {
            console.log('Notifications not supported in this browser');
            return false;
        }
    }

    function initialize() {
        requestNotificationPermission();

        // Add event listeners
        if (resetBtn) {
            console.log('Reset button found:', resetBtn);
            resetBtn.addEventListener('click', resetTimer);
        } else {
            console.error('Reset button not found in the DOM');
        }

        if (testBtn) {
            console.log('Test button found:', testBtn);
            testBtn.addEventListener('click', setTestTimer);
        } else {
            console.error('Test button not found in the DOM');
        }

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            console.log('Visibility changed. Hidden:', document.hidden, 'Timer running:', isTimerRunning);
            if (document.hidden && !isTimerRunning) {
                startTimer();
            }
        });

        // Handle window blur (user switches to another app)
        window.addEventListener('blur', () => {
            console.log('Window blurred. Timer running:', isTimerRunning);
            if (!isTimerRunning) {
                startTimer();
            }
        });
    }

    // Update timer display
    function updateTimerDisplay() {
        if (timerDisplay) {
            // Ensure timeLeft is not negative
            const displayTime = Math.max(0, timeLeft);
            const minutes = Math.floor(displayTime / 60);
            const seconds = displayTime % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            console.log(`Timer updated: ${minutes}:${seconds} (${timeLeft} seconds left)`);
        }
    }

    // Start the timer
    function startTimer() {
        if (!isTimerRunning) {
            console.log('Starting timer');
            isTimerRunning = true;
            clearMessage(); // Add this line to clear the message
            timerInterval = setInterval(() => {
                console.log(`Timer tick: ${timeLeft} seconds left`);
                if (timeLeft <= 0) {
                    console.log('Timer finished');
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    sendNotification();
                    showResetButton();
                } else {
                    timeLeft--;
                    updateTimerDisplay();
                }
            }, 1000);
        }
    }

    // Reset the timer
    function resetTimer() {
        console.log('Resetting timer');
        clearInterval(timerInterval);
        isTimerRunning = false;
        timeLeft = 25 * 60;
        updateTimerDisplay();
        if (resetBtn) resetBtn.style.display = 'none';
        notificationSent = false; // Reset notification flag
        clearMessage(); // Clear any displayed message
    }

    // Set test timer (10 seconds)
    function setTestTimer() {
        console.log('Setting test timer (10 seconds)');
        clearInterval(timerInterval);
        isTimerRunning = false;
        timeLeft = 10;
        updateTimerDisplay();
        startTimer();
    }

    // Send notification
    function sendNotification() {
        if (notificationSent) {
            console.log('Notification already sent, skipping');
            return;
        }

        console.log('Attempting to send notification. Permission:', Notification.permission);
        if (Notification.permission === 'granted') {
            fetch('./tomato.svg')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`SVG icon not found: ${response.status}`);
                    }
                    return true;
                })
                .then(() => {
                    const notification = new Notification('Pomodoro Timer', {
                        body: 'Time is up. CLICK ME!',
                        icon: './tomato.svg',
                        requireInteraction: true
                    });

                    notification.addEventListener('click', function() {
                        window.focus();
                        this.close();
                        resetTimer();
                        displayMessage("Go take a break. I will be here waiting for you.");
                    });

                    // Set a timeout to close the notification after 5 minutes (300000 milliseconds)
                    setTimeout(() => {
                        notification.close();
                    }, 300000);

                    console.log('Notification sent');
                    notificationSent = true; // Set notification flag
                })
                .catch(error => {
                    console.error('Error with SVG icon:', error);
                    // Send notification without icon
                    const notification = new Notification('Pomodoro Timer', {
                        body: 'Time is up. CLICK ME!',
                        requireInteraction: true
                    });

                    notification.addEventListener('click', function() {
                        window.focus();
                        this.close();
                        resetTimer();
                        displayMessage("Go take a break. I will be here waiting for you.");
                    });

                    // Set a timeout to close the notification after 5 minutes (300000 milliseconds)
                    setTimeout(() => {
                        notification.close();
                    }, 300000);

                    console.log('Notification sent without icon');
                    notificationSent = true; // Set notification flag
                });
        } else {
            console.log('Notification permission not granted. Requesting permission...');
            requestNotificationPermission().then(granted => {
                if (granted) {
                    sendNotification();
                } else {
                    console.log('Notification permission denied');
                }
            });
        }
    }

    // Show reset button
    function showResetButton() {
        if (resetBtn) {
            resetBtn.style.display = 'inline-block';
            console.log('Reset button shown');
        } else {
            console.error('Reset button not found when trying to show it');
        }
    }

    // Display message
    function displayMessage(message) {
        let messageElement = document.getElementById('message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'message';
            document.querySelector('.container').appendChild(messageElement);
        }
        messageElement.textContent = message;
    }

    // Clear message
    function clearMessage() {
        let messageElement = document.getElementById('message');
        if (messageElement) {
            messageElement.textContent = '';
        }
    }

    // Toggle test button visibility
    function toggleTestButton() {
        if (testBtn) {
            testBtn.style.display = testBtn.style.display === 'none' ? 'inline-block' : 'none';
            console.log(`Test button ${testBtn.style.display === 'none' ? 'hidden' : 'shown'}`);
        } else {
            console.error('Test button not found when trying to toggle visibility');
        }
    }

    // Make toggleTestButton function accessible through the console
    window.toggleTestButton = toggleTestButton;

    // Initialize the app
    initialize();
    updateTimerDisplay();
});
