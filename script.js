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

// Create stars when the page loads
window.addEventListener('load', createStars); 