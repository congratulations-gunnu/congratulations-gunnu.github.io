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

// Initialize water animation when the page loads
window.addEventListener('load', () => {
    createStars();
    new WaterAnimation();
}); 