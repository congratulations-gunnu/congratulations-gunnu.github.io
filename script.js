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
        this.waveHeight = 20;
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
        this.canvas.height = 200;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += this.waveSpeed;

        // Draw water
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height); // Start at bottom left
        for (let i = 0; i <= this.numberOfPoints; i++) {
            const x = (i / this.numberOfPoints) * this.canvas.width;
            const y = this.canvas.height - 40 - Math.sin(x * this.waveFrequency + this.time) * this.waveHeight;
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
            const y = this.canvas.height - 40 - Math.sin(x * this.waveFrequency + this.time) * this.waveHeight;
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
    const minDistance = 100; // Minimum distance between stars in pixels
    const moonElement = document.querySelector('.moon');
    const moonRect = moonElement.getBoundingClientRect();
    const moonPadding = 50; // Extra padding around moon
    
    // Get container dimensions
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    // Keep track of placed stars
    const placedStars = [];
    
    moodStars.forEach(star => {
        let attempts = 0;
        const maxAttempts = 100;
        let validPosition = false;
        
        while (!validPosition && attempts < maxAttempts) {
            // Random position
            const x = Math.random() * (containerWidth - 50); // 50px padding from edges
            const y = Math.random() * (containerHeight * 0.6); // Only in top 60% of screen
            
            // Check if position is valid (not too close to other stars and not overlapping moon)
            const tooCloseToOtherStar = placedStars.some(pos => {
                const dx = x - pos.x;
                const dy = y - pos.y;
                return Math.sqrt(dx * dx + dy * dy) < minDistance;
            });
            
            const tooCloseToMoon = (
                x + moonPadding > moonRect.left &&
                x - moonPadding < moonRect.right &&
                y + moonPadding > moonRect.top &&
                y - moonPadding < moonRect.bottom
            );
            
            if (!tooCloseToOtherStar && !tooCloseToMoon) {
                star.style.position = 'absolute';
                star.style.left = `${x}px`;
                star.style.top = `${y}px`;
                star.style.width = '60px'; // Doubled size from 30px to 60px
                star.style.height = '60px'; // Doubled size from 30px to 60px
                star.style.zIndex = '3'; // Above waves but below moon
                star.style.filter = 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))';
                
                placedStars.push({ x, y });
                validPosition = true;
            }
            
            attempts++;
        }
    });
}

// Initialize everything when the page loads
window.addEventListener('load', () => {
    createStars();
    new WaterAnimation();
    positionMoodStars();
    
    // Reposition mood stars on window resize
    window.addEventListener('resize', () => {
        positionMoodStars();
    });
}); 