// DOM Elements
const betButtons = document.querySelectorAll('.bet-btn');
const joinGameButton = document.querySelector('.join-game-btn');
const addFundsButton = document.querySelector('.add-funds');
const cashOutButton = document.querySelector('.cash-out');
const refreshButtons = document.querySelectorAll('.refresh-btn, .wallet-action');
const balanceAmount = document.querySelector('.balance-amount');
const playersInGame = document.querySelector('.stat-number');

// Sound Elements
const soundToggle = document.getElementById('soundToggle');
const hoverSound = document.getElementById('hoverSound');

// Game State
let currentBet = 1;
let balance = 0;
let playersCount = 9;

// Sound State
let isSoundEnabled = true;
let audioInitialized = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeBetButtons();
    initializeWalletButtons();
    initializeGameButtons();
    initializeSoundSystem();
    updatePlayerCount();
    startAnimations();
    
    // Initialize responsive animations
    initializeResponsiveAnimations();
    
    // Handle orientation changes on mobile
    window.addEventListener('orientationchange', function() {
        setTimeout(initializeResponsiveAnimations, 100);
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(initializeResponsiveAnimations, 150);
    });
});

// Responsive animation initialization
function initializeResponsiveAnimations() {
    // Stop existing animations
    const canvas = document.getElementById('snakes-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Start appropriate animations based on screen size
    if (window.innerWidth > 768) {
        startSnakes();
        startCustomizeSnake();
    } else {
        // Reduced snake count for mobile performance
        startSnakesMobile();
        startCustomizeSnake();
    }
}

// Bet Button Functionality
function initializeBetButtons() {
    betButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            betButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current bet amount
            currentBet = parseFloat(this.textContent.replace('$', ''));
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Wallet Button Functionality
function initializeWalletButtons() {
    addFundsButton.addEventListener('click', function() {
        showNotification('Add Funds feature would open payment modal', 'info');
        // Simulate adding funds
        setTimeout(() => {
            balance += 100;
            updateBalance();
            showNotification('$100 added to your wallet!', 'success');
        }, 1000);
    });

    cashOutButton.addEventListener('click', function() {
        if (balance > 0) {
            showNotification(`Cashing out $${balance.toFixed(2)}...`, 'info');
            setTimeout(() => {
                balance = 0;
                updateBalance();
                showNotification('Cash out successful!', 'success');
            }, 1500);
        } else {
            showNotification('No funds to cash out', 'warning');
        }
    });
}

// Game Button Functionality
function initializeGameButtons() {
    joinGameButton.addEventListener('click', function() {
        if (balance >= currentBet) {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> JOINING...';
            this.disabled = true;
            
            setTimeout(() => {
                balance -= currentBet;
                updateBalance();
                playersCount++;
                updatePlayerCount();
                
                this.innerHTML = '<i class="fas fa-play"></i> JOIN GAME';
                this.disabled = false;
                
                showNotification(`Joined game with $${currentBet} bet!`, 'success');
            }, 2000);
        } else {
            showNotification('Insufficient funds! Add money to your wallet.', 'error');
        }
    });

    // Refresh functionality
    refreshButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.animation = 'spin 1s linear';
                setTimeout(() => {
                    icon.style.animation = '';
                }, 1000);
            }
            showNotification('Refreshed successfully', 'info');
        });
    });
}

// Update Balance Display
function updateBalance() {
    balanceAmount.textContent = `$${balance.toFixed(2)}`;
    const solAmount = document.querySelector('.balance-currency');
    solAmount.textContent = `${(balance / 150).toFixed(4)} SOL`; // Rough SOL conversion
}

// Update Player Count
function updatePlayerCount() {
    if (playersInGame) {
        playersInGame.textContent = playersCount;
    }
}

// Sound System
function initializeSoundSystem() {
    // Initialize sound toggle button
    if (soundToggle) {
        soundToggle.addEventListener('click', toggleSound);
        updateSoundIcon();
    }
    
    // Initialize audio on first user interaction
    document.addEventListener('click', initializeAudio, { once: true });
    document.addEventListener('keydown', initializeAudio, { once: true });
    
    // Add hover sound effects to all interactive buttons
    addHoverSoundEffects();
}

async function initializeAudio() {
    if (!audioInitialized && hoverSound) {
        try {
            // Unmute the audio element
            hoverSound.muted = false;
            hoverSound.volume = 0.3; // Set a comfortable volume
            
            // Try to load and play a silent sound to initialize
            await hoverSound.load();
            audioInitialized = true;
        } catch (error) {
            console.log('Audio initialization failed:', error);
        }
    }
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    soundToggle.setAttribute('data-muted', !isSoundEnabled);
    updateSoundIcon();
    
    // Initialize audio if not done yet
    if (!audioInitialized) {
        initializeAudio();
    }
    
    // Play a confirmation sound when enabling
    if (isSoundEnabled && audioInitialized) {
        setTimeout(() => playHoverSound(), 100);
    }
}

function updateSoundIcon() {
    const icon = soundToggle.querySelector('i');
    if (icon) {
        if (isSoundEnabled) {
            icon.className = 'fas fa-volume-up';
        } else {
            icon.className = 'fas fa-volume-mute';
        }
    }
}

function playHoverSound() {
    if (!isSoundEnabled) return;
    
    // Try HTML5 audio first
    if (hoverSound && audioInitialized) {
        try {
            // Clone and play the audio to avoid cutting off previous plays
            const audioClone = hoverSound.cloneNode();
            audioClone.volume = 0.3;
            audioClone.play().catch(e => {
                // Fallback: try with original audio element
                hoverSound.currentTime = 0;
                hoverSound.play().catch(err => {
                    // Last resort: use Web Audio API
                    createWebAudioClick();
                });
            });
        } catch (error) {
            // Fallback to Web Audio API
            createWebAudioClick();
        }
    } else {
        // Use Web Audio API if HTML5 audio not ready
        createWebAudioClick();
    }
}

function addHoverSoundEffects() {
    // Get all interactive buttons
    const interactiveButtons = document.querySelectorAll(`
        .bet-btn,
        .join-game-btn,
        .add-funds,
        .cash-out,
        .header-btn,
        .view-full-btn,
        .wallet-action-btn,
        .refresh-btn,
        .add-friends-btn,
        .change-appearance-btn,
        .affiliate-btn-center,
        .discord-floating
    `);
    
    // Add hover sound effect to each button
    interactiveButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            // Small delay to ensure audio is ready
            setTimeout(() => playHoverSound(), 5);
        });
    });
}

// Create professional "tik" sound using Web Audio API
function createWebAudioClick() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create sharp, professional "tik" sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();
        const compressor = audioContext.createDynamicsCompressor();
        
        // Connect the audio chain with compression for crisp sound
        oscillator.connect(filterNode);
        filterNode.connect(compressor);
        compressor.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // High-frequency crisp filter for "tik" sound
        filterNode.type = 'highpass';
        filterNode.frequency.setValueAtTime(2000, audioContext.currentTime);
        filterNode.Q.setValueAtTime(15, audioContext.currentTime); // Very sharp, focused
        
        // Professional "tik" frequency - high and crisp
        oscillator.frequency.setValueAtTime(3000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(2500, audioContext.currentTime + 0.01);
        
        // Ultra-sharp attack and very quick decay for "tik"
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.001); // Instant attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.04); // Very quick decay
        
        // Use sawtooth wave for sharp, mechanical "tik"
        oscillator.type = 'sawtooth';
        
        // Compression settings for punchy sound
        compressor.threshold.setValueAtTime(-20, audioContext.currentTime);
        compressor.knee.setValueAtTime(0, audioContext.currentTime);
        compressor.ratio.setValueAtTime(8, audioContext.currentTime);
        compressor.attack.setValueAtTime(0.001, audioContext.currentTime);
        compressor.release.setValueAtTime(0.01, audioContext.currentTime);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.04);
    } catch (error) {
        console.log('Web Audio API failed:', error);
    }
}

// Debug function for testing sound (call from console: testSound())
window.testSound = function() {
    console.log('Testing sound system...', {
        soundEnabled: isSoundEnabled,
        audioInitialized: audioInitialized,
        hoverSoundExists: !!hoverSound
    });
    
    if (!audioInitialized) {
        console.log('Initializing audio...');
        initializeAudio().then(() => {
            console.log('Audio initialized, trying to play...');
            playHoverSound();
        });
    } else {
        playHoverSound();
    }
};

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: '#ffffff',
        fontWeight: 'bold',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });

    // Set background color based on type
    const colors = {
        success: '#00ff00',
        error: '#ff4444',
        warning: '#ffaa00',
        info: '#0088ff'
    };
    notification.style.background = colors[type] || colors.info;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Start Background Animations
function startAnimations() {
    // Animate global winnings counter
    const globalWinnings = document.querySelector('.stat-number:last-of-type');
    if (globalWinnings) {
        let currentAmount = 254459;
        setInterval(() => {
            currentAmount += Math.floor(Math.random() * 50) + 1;
            globalWinnings.textContent = `$${currentAmount.toLocaleString()}`;
        }, 5000);
    }

    // Animate live indicator pulse
    const liveIndicator = document.querySelector('.live-indicator');
    if (liveIndicator) {
        setInterval(() => {
            liveIndicator.style.opacity = liveIndicator.style.opacity === '0.5' ? '1' : '0.5';
        }, 1000);
    }

    // Random leaderboard updates
    const leaderboardItems = document.querySelectorAll('.earnings');
    setInterval(() => {
        leaderboardItems.forEach(item => {
            const currentAmount = parseFloat(item.textContent.replace('$', '').replace(',', ''));
            const newAmount = currentAmount + (Math.random() * 10);
            item.textContent = `$${newAmount.toFixed(2)}`;
        });
    }, 10000);
}

// Canvas snakes renderer
function startSnakes() {
    const canvas = document.getElementById('snakes-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Fixed length for ALL snakes across the website
    const SNAKE_LENGTH = 20; // Consistent length for all snakes
    const SEGMENT_SIZE = 18; // Consistent segment size
    const SEGMENT_SPACING = 8; // Clean spacing between segments

    // Create exactly 3 clean snakes
    const snakes = [
        {
            x: canvas.width * 0.15,
            y: canvas.height * 0.25,
            angle: 0,
            speed: 0.8,
            color: '#4F96FF', // Clean bright blue
            segments: [],
            length: SNAKE_LENGTH
        },
        {
            x: canvas.width * 0.85,
            y: canvas.height * 0.65,
            angle: Math.PI,
            speed: 0.6,
            color: '#22D3EE', // Clean cyan
            segments: [],
            length: SNAKE_LENGTH
        },
        {
            x: canvas.width * 0.08,
            y: canvas.height * 0.85,
            angle: Math.PI * 0.3,
            speed: 0.7,
            color: '#A855F7', // Clean purple
            segments: [],
            length: SNAKE_LENGTH
        }
    ];

    // Initialize snake segments with fixed sizing
    snakes.forEach(snake => {
        for (let i = 0; i < snake.length; i++) {
            snake.segments.push({
                x: snake.x - i * SEGMENT_SPACING,
                y: snake.y,
                size: i === 0 ? SEGMENT_SIZE + 2 : SEGMENT_SIZE // Head slightly larger
            });
        }
    });

    function drawSnake(snake) {
        // Helper function to get darker shade of snake color
        function getDarkerShade(color) {
            // Convert hex to RGB, darken by 40%, convert back
            const hex = color.replace('#', '');
            const r = Math.floor(parseInt(hex.substr(0, 2), 16) * 0.6);
            const g = Math.floor(parseInt(hex.substr(2, 2), 16) * 0.6);
            const b = Math.floor(parseInt(hex.substr(4, 2), 16) * 0.6);
            return `rgb(${r}, ${g}, ${b})`;
        }
        
        // Draw body segments with clean disc design
        for (let i = snake.segments.length - 1; i >= 1; i--) {
            const segment = snake.segments[i];
            
            // Draw main disc body
            ctx.fillStyle = snake.color;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add subtle depth with gradient instead of harsh border
            const gradient = ctx.createRadialGradient(
                segment.x, segment.y, segment.size * 0.7,
                segment.x, segment.y, segment.size
            );
            gradient.addColorStop(0, snake.color);
            gradient.addColorStop(1, getDarkerShade(snake.color));
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add inner highlight for 3D disc effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(segment.x - segment.size * 0.3, segment.y - segment.size * 0.3, segment.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw head (first segment) with eyes
        const head = snake.segments[0];
        
        // Draw head with smooth gradient depth
        const headGradient = ctx.createRadialGradient(
            head.x, head.y, head.size * 0.7,
            head.x, head.y, head.size
        );
        headGradient.addColorStop(0, snake.color);
        headGradient.addColorStop(1, getDarkerShade(snake.color));
        
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.arc(head.x, head.y, head.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Head highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(head.x - head.size * 0.3, head.y - head.size * 0.3, head.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Draw clean white eyes
        const eyeOffset = head.size * 0.35;
        const eyeSize = head.size * 0.2;
        const pupilSize = eyeSize * 0.7;
        
        // Left eye
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(head.x - eyeOffset, head.y - eyeOffset * 0.3, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(head.x + eyeOffset, head.y - eyeOffset * 0.3, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Left pupil
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(head.x - eyeOffset, head.y - eyeOffset * 0.3, pupilSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Right pupil
        ctx.beginPath();
        ctx.arc(head.x + eyeOffset, head.y - eyeOffset * 0.3, pupilSize, 0, Math.PI * 2);
        ctx.fill();
    }

    function updateSnake(snake) {
        // Update angle for smooth movement
        snake.angle += (Math.random() - 0.5) * 0.1;
        
        // Move head
        snake.x += Math.cos(snake.angle) * snake.speed;
        snake.y += Math.sin(snake.angle) * snake.speed;
        
        // Keep snakes on screen
        if (snake.x < 0 || snake.x > canvas.width) snake.angle = Math.PI - snake.angle;
        if (snake.y < 0 || snake.y > canvas.height) snake.angle = -snake.angle;
        
        // Update head position
        snake.segments[0].x = snake.x;
        snake.segments[0].y = snake.y;
        
        // Update body segments to follow with fixed spacing
        for (let i = 1; i < snake.segments.length; i++) {
            const curr = snake.segments[i];
            const prev = snake.segments[i - 1];
            
            const dx = prev.x - curr.x;
            const dy = prev.y - curr.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > SEGMENT_SPACING) {
                const moveRatio = (distance - SEGMENT_SPACING) / distance;
                curr.x += dx * moveRatio * 0.4;
                curr.y += dy * moveRatio * 0.4;
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Remove blur filter for clean, crisp snakes
        snakes.forEach(snake => {
            updateSnake(snake);
            drawSnake(snake);
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Mobile-optimized snake animation with reduced performance impact
function startSnakesMobile() {
    const canvas = document.getElementById('snakes-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Reduced specs for mobile performance
    const SNAKE_LENGTH = 15; // Shorter snakes for mobile
    const SEGMENT_SIZE = 16; // Slightly smaller segments
    const SEGMENT_SPACING = 6; // Tighter spacing

    // Only 2 snakes for mobile performance
    const snakes = [
        {
            x: canvas.width * 0.2,
            y: canvas.height * 0.3,
            angle: 0,
            speed: 0.5, // Slower for mobile
            color: '#4F96FF',
            segments: [],
            length: SNAKE_LENGTH
        },
        {
            x: canvas.width * 0.8,
            y: canvas.height * 0.7,
            angle: Math.PI,
            speed: 0.4, // Slower for mobile
            color: '#22D3EE',
            segments: [],
            length: SNAKE_LENGTH
        }
    ];

    // Initialize snake segments
    snakes.forEach(snake => {
        for (let i = 0; i < snake.length; i++) {
            snake.segments.push({
                x: snake.x - i * (SEGMENT_SIZE + SEGMENT_SPACING),
                y: snake.y
            });
        }
    });

    // Helper function for darker shades
    function getDarkerShade(color) {
        return color.replace(/[0-9A-F]{2}/gi, match => {
            const value = parseInt(match, 16);
            const darker = Math.max(0, Math.floor(value * 0.7));
            return darker.toString(16).padStart(2, '0');
        });
    }

    // Optimized draw function for mobile
    function drawSnake(snake) {
        snake.segments.forEach((segment, index) => {
            const opacity = 1 - (index / snake.segments.length) * 0.3;
            const radius = SEGMENT_SIZE / 2;
            
            // Create simple gradient for mobile performance
            const gradient = ctx.createRadialGradient(
                segment.x, segment.y, 0,
                segment.x, segment.y, radius
            );
            gradient.addColorStop(0, snake.color);
            gradient.addColorStop(0.7, snake.color);
            gradient.addColorStop(1, getDarkerShade(snake.color));
            
            ctx.globalAlpha = opacity;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Simple eyes only on head (index 0)
            if (index === 0) {
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(segment.x - 5, segment.y - 3, 2, 0, Math.PI * 2);
                ctx.arc(segment.x + 5, segment.y - 3, 2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(segment.x - 5, segment.y - 3, 1, 0, Math.PI * 2);
                ctx.arc(segment.x + 5, segment.y - 3, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
    }

    // Reduced frame rate for mobile
    let lastTime = 0;
    const targetFPS = 30; // 30 FPS for mobile vs 60 for desktop
    const frameInterval = 1000 / targetFPS;

    function animate(currentTime) {
        if (currentTime - lastTime < frameInterval) {
            requestAnimationFrame(animate);
            return;
        }
        lastTime = currentTime;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        snakes.forEach(snake => {
            // Update position
            snake.x += Math.cos(snake.angle) * snake.speed;
            snake.y += Math.sin(snake.angle) * snake.speed;
            
            // Smooth direction changes
            snake.angle += (Math.random() - 0.5) * 0.02;
            
            // Boundary wrapping
            if (snake.x < -50) snake.x = canvas.width + 50;
            if (snake.x > canvas.width + 50) snake.x = -50;
            if (snake.y < -50) snake.y = canvas.height + 50;
            if (snake.y > canvas.height + 50) snake.y = -50;
            
            // Update segments
            for (let i = snake.segments.length - 1; i > 0; i--) {
                snake.segments[i].x = snake.segments[i - 1].x;
                snake.segments[i].y = snake.segments[i - 1].y;
            }
            snake.segments[0].x = snake.x;
            snake.segments[0].y = snake.y;
            
            drawSnake(snake);
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Customize section snake with mouse-following eyes
function startCustomizeSnake() {
    const canvas = document.getElementById('customize-snake');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let mouseX = rect.left + rect.width / 2;
    let mouseY = rect.top + rect.height / 2;
    
    // Use same constants as background snakes
    const SEGMENT_SIZE = 18;
    const SEGMENT_SPACING = 8;
    
    // Track mouse over the customize section
    const customizeSection = document.querySelector('.customize-section');
    if (customizeSection) {
        customizeSection.addEventListener('mousemove', (e) => {
            const canvasRect = canvas.getBoundingClientRect();
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
    }
    
    // Use same constants as background snakes for consistency
    const CUSTOMIZE_SNAKE_LENGTH = 15; // Slightly shorter for customize area
    
    // Snake properties  
    const snake = {
        segments: [],
        color: '#4F96FF'
    };
    
    // Initialize snake segments with same fixed sizing
    for (let i = 0; i < CUSTOMIZE_SNAKE_LENGTH; i++) {
        snake.segments.push({
            x: 40 + i * 8, // Spacing for customize area
            y: 50,
            size: i === 0 ? SEGMENT_SIZE + 2 : SEGMENT_SIZE // Same sizing as bg snakes
        });
    }
    
    function drawCustomizeSnake() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Helper function to get darker shade (same as background snakes)
        function getDarkerShade(color) {
            const hex = color.replace('#', '');
            const r = Math.floor(parseInt(hex.substr(0, 2), 16) * 0.6);
            const g = Math.floor(parseInt(hex.substr(2, 2), 16) * 0.6);
            const b = Math.floor(parseInt(hex.substr(4, 2), 16) * 0.6);
            return `rgb(${r}, ${g}, ${b})`;
        }
        
        // Draw body segments with same smooth design as background snakes
        for (let i = snake.segments.length - 1; i >= 1; i--) {
            const segment = snake.segments[i];
            
            // Add subtle depth with gradient instead of harsh border
            const gradient = ctx.createRadialGradient(
                segment.x, segment.y, segment.size * 0.7,
                segment.x, segment.y, segment.size
            );
            gradient.addColorStop(0, snake.color);
            gradient.addColorStop(1, getDarkerShade(snake.color));
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add inner highlight for 3D disc effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(segment.x - segment.size * 0.3, segment.y - segment.size * 0.3, segment.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw head with same smooth design
        const head = snake.segments[0];
        
        // Draw head with smooth gradient depth
        const headGradient = ctx.createRadialGradient(
            head.x, head.y, head.size * 0.7,
            head.x, head.y, head.size
        );
        headGradient.addColorStop(0, snake.color);
        headGradient.addColorStop(1, getDarkerShade(snake.color));
        
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.arc(head.x, head.y, head.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Head highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(head.x - head.size * 0.3, head.y - head.size * 0.3, head.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Calculate eye positions (same as background snakes)
        const canvasRect = canvas.getBoundingClientRect();
        const eyeOffset = head.size * 0.35;
        const eyeSize = head.size * 0.2;
        const pupilSize = eyeSize * 0.7;
        
        // Calculate mouse position relative to canvas
        const relativeMouseX = mouseX - canvasRect.left;
        const relativeMouseY = mouseY - canvasRect.top;
        
        // Draw eyes (same positioning as background snakes)
        ctx.fillStyle = '#FFFFFF';
        // Left eye
        ctx.beginPath();
        ctx.arc(head.x - eyeOffset, head.y - eyeOffset * 0.3, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Right eye
        ctx.beginPath();
        ctx.arc(head.x + eyeOffset, head.y - eyeOffset * 0.3, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Calculate pupil positions to follow mouse
        function calculatePupilPos(eyeX, eyeY) {
            const dx = relativeMouseX - eyeX;
            const dy = relativeMouseY - eyeY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = eyeSize * 0.4;
            
            if (distance <= maxDistance) {
                return { x: eyeX + dx, y: eyeY + dy };
            } else {
                return {
                    x: eyeX + (dx / distance) * maxDistance,
                    y: eyeY + (dy / distance) * maxDistance
                };
            }
        }
        
        // Draw pupils following mouse
        ctx.fillStyle = '#000000';
        const leftPupil = calculatePupilPos(head.x - eyeOffset, head.y - eyeOffset * 0.3);
        const rightPupil = calculatePupilPos(head.x + eyeOffset, head.y - eyeOffset * 0.3);
        
        ctx.beginPath();
        ctx.arc(leftPupil.x, leftPupil.y, pupilSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightPupil.x, rightPupil.y, pupilSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Animate the snake body
    let time = 0;
    function animateCustomizeSnake() {
        time += 0.03;
        
        // Update snake body to have a gentle wave motion
        for (let i = 1; i < snake.segments.length; i++) {
            snake.segments[i].y = 50 + Math.sin(time + i * 0.4) * 6;
        }
        
        drawCustomizeSnake();
        requestAnimationFrame(animateCustomizeSnake);
    }
    
    animateCustomizeSnake();
}

// Copy Address Functionality
document.addEventListener('click', function(e) {
    if (e.target.textContent.includes('Copy Address')) {
        const dummyAddress = 'DaBr7uH1nG2K3mP4vN5oQ6rS7tU8wX9yZ0A1B2C3D4E5F6';
        
        // Try to copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(dummyAddress).then(() => {
                showNotification('Wallet address copied!', 'success');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = dummyAddress;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Wallet address copied!', 'success');
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Press 1, 2, 3 to select bet amounts
    if (e.key === '1') {
        betButtons[0].click();
    } else if (e.key === '2') {
        betButtons[1].click();
    } else if (e.key === '3') {
        betButtons[2].click();
    }
    
    // Press Enter to join game
    if (e.key === 'Enter') {
        joinGameButton.click();
    }
    
    // Press 'A' to add funds
    if (e.key.toLowerCase() === 'a' && e.ctrlKey) {
        e.preventDefault();
        addFundsButton.click();
    }
});

// Add CSS animation for spin
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Console welcome message
console.log(`
🎯 DAMNBRUH - Skill-Based Betting Platform
==================================
Welcome to the clone! Here are some features:
• Click bet amounts ($1, $5, $20) or use keyboard (1, 2, 3)
• Press Enter to join game
• Use Ctrl+A to add funds
• All buttons are interactive with visual feedback
• Real-time animations and updates

Note: This is a visual clone for demonstration purposes.
`);

// Performance monitoring
let lastFrameTime = performance.now();
function checkPerformance() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;
    
    if (deltaTime > 100) { // If frame took longer than 100ms
        console.warn('Performance warning: Slow frame detected');
    }
    
    lastFrameTime = currentTime;
    requestAnimationFrame(checkPerformance);
}

// Start performance monitoring
requestAnimationFrame(checkPerformance);
