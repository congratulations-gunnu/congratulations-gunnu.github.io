// Function to create stars
function createStars() {
    const starsContainer = document.querySelector('.stars');
    const numberOfStars = 200; // Number of stars to create

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        // Only allow stars in the top 70% of the scene
        star.style.top = `${Math.random() * 70}%`;
        
        // Random size between 1px and 3px
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random animation delay
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        starsContainer.appendChild(star);
    }
}

// Water animation
class WaterAnimation {
    constructor() {
        this.canvas = document.getElementById('waterCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.waveHeight = 20; // Gentle waves
        this.waveSpeed = 0.02;
        this.waveFrequency = 0.02;
        this.waterColor = '#1a4b8c';
        this.waterOpacity = 0.8;
        this.time = 0;
        this.numberOfPoints = 100;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = Math.max(window.innerHeight * 0.45, 350); // Keep water canvas tall
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += this.waveSpeed;

        // Draw water
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height); // Start at bottom left
        for (let i = 0; i <= this.numberOfPoints; i++) {
            const x = (i / this.numberOfPoints) * this.canvas.width;
            const baseLevel = this.canvas.height - 180; // Higher water level (closer to middle)
            const y = baseLevel - Math.sin(x * this.waveFrequency + this.time) * this.waveHeight;
            if (i === 0) {
                this.ctx.lineTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.lineTo(this.canvas.width, this.canvas.height); // Bottom right
        this.ctx.closePath();

        // Fill with gradient
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height - 100, 0, this.canvas.height);
        gradient.addColorStop(0, this.waterColor);
        gradient.addColorStop(1, this.waterColor + '80');
        this.ctx.fillStyle = gradient;
        this.ctx.globalAlpha = this.waterOpacity;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;

        // Optional: Draw wave outline
        this.ctx.beginPath();
        for (let i = 0; i <= this.numberOfPoints; i++) {
            const x = (i / this.numberOfPoints) * this.canvas.width;
            const baseLevel = this.canvas.height - 180;
            const y = baseLevel - Math.sin(x * this.waveFrequency + this.time) * this.waveHeight;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        requestAnimationFrame(() => this.animate());
    }
}

// Function to position mood stars
function positionMoodStars() {
    const moodContainer = document.querySelector('.mood');
    const moodStars = moodContainer.querySelectorAll('img');
    // Fixed positions for each mood star (percentages of viewport)
    const fixedPositions = [
        { left: '18%', top: '22%' }, // sick
        { left: '38%', top: '55%' }, // angry
        { left: '50%', top: '35%' }, // anxious
        { left: '62%', top: '50%' }, // happy
        { left: '80%', top: '50%' }, // sad
        { left: '25%', top: '45%' }, // beautiful
        { left: '75%', top: '15%' }, // moon
    ];
    moodStars.forEach((star, i) => {
        const pos = fixedPositions[i];
        star.style.position = 'absolute';
        star.style.left = pos.left;
        star.style.top = pos.top;
        if (i === 6) { // moon
            star.style.width = '180px';
            star.style.height = '180px';
        } else {
            star.style.width = '60px';
            star.style.height = '60px';
        }
        star.style.zIndex = '3';
        star.style.filter = 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))';
    });
}

// Scroll content data
const scrollContent = {
    'sick': {
        image: 'assets/blue.jpeg',
        text: 'I hope you never get to open this but as I am w'  },
    'angry': {
        image: 'assets/gulabi.jpeg',
        text: 'Hiiiiii, did you have some water today?'
    },
    'anxious': {
        image: 'assets/pretty.jpeg',
        text: 'Anxiety can be overwhelming. Remember to breathe and know that this feeling will pass.'
    },
    'happy': {
        image: 'assets/cutee.jpg',
        text: 'Joy fills my heart! Let\'s share this happiness with others and create beautiful memories.'
    },
    'sad': {
        image: 'assets/retro.jpeg',
        text: 'Sadness is a part of life. It\'s okay to feel this way, and I\'m here to support you.'
    },
    'beautiful': {
        image: 'assets/collage.jpeg',
        text: 'You are beautiful inside and out. Let\'s celebrate your unique beauty and shine!'
    },
    'moon': {
        image: 'assets/cutee.jpg',
        text: 'The moon whispers secrets of the night, bringing peace and tranquility to your soul.'
    }
};

// Function to handle scroll animations
function initScrollAnimations() {
    const moodStars = document.querySelectorAll('.mood img');
    const scrollContainer = document.querySelector('.scroll-container');
    const scrollOverlay = document.querySelector('.scroll-overlay');
    const closeButton = document.querySelector('.close-scroll');
    const scrollImage = document.querySelector('.scroll-image');
    const scrollText = document.querySelector('.scroll-text');
    const moonAudio = new Audio('assets/moon.mp3');
    moonAudio.loop = true;
    let isMoonOpen = false;

    // Typewriter effect function
    async function typeWriter(text, element, speed = 50) {
        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }

    // Function to open scroll
    async function openScroll(emotion) {
        const content = scrollContent[emotion];
        if (!content) return;

        // Play moon audio if it's the moon (start immediately)
        if (emotion === 'moon') {
            isMoonOpen = true;
            moonAudio.currentTime = 0;
            moonAudio.play().catch((err) => {
                console.log('moonAudio play error:', err);
            });
        }

        // Update scroll content
        scrollImage.src = content.image;
        scrollText.textContent = ''; // Clear text before animation

        // Show scroll with animation
        scrollOverlay.style.visibility = 'visible';
        scrollOverlay.style.opacity = '1';
        scrollContainer.style.visibility = 'visible';
        scrollContainer.style.opacity = '1';
        scrollContainer.style.transform = 'translate(-50%, -50%) scale(1)';

        // Start typewriter effect after a small delay
        await new Promise(resolve => setTimeout(resolve, 300));
        await typeWriter(content.text, scrollText);
    }

    // Function to close scroll
    function closeScroll() {
        scrollContainer.style.visibility = 'hidden';
        scrollContainer.style.opacity = '0';
        scrollContainer.style.transform = 'translate(-50%, -50%) scale(0.9)';
        scrollOverlay.style.visibility = 'hidden';
        scrollOverlay.style.opacity = '0';
        scrollText.textContent = ''; // Clear text when closing
        
        // Stop moon audio if it was playing
        if (isMoonOpen) {
            moonAudio.pause();
            moonAudio.currentTime = 0;
            isMoonOpen = false;
        }
    }

    // Add click handlers to mood stars
    moodStars.forEach(star => {
        star.addEventListener('click', (e) => {
            const emotion = star.src.split('/').pop().split('.')[0];
            openScroll(emotion);
        });
    });

    // Close scroll when clicking close button or overlay
    closeButton.addEventListener('click', closeScroll);
    scrollOverlay.addEventListener('click', closeScroll);

    // Also stop audio when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeScroll();
        }
    });
}

// Initialize everything when the page loads
window.addEventListener('load', () => {
    createStars();
    new WaterAnimation();
    positionMoodStars();
    initScrollAnimations();
    
    // Reposition mood stars on window resize
    window.addEventListener('resize', () => {
        positionMoodStars();
    });
}); 