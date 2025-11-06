const carouselImages = document.querySelector('.carousel-images');
const images = document.querySelectorAll('.carousel img');
let index = 0;
const intervalTime = 3000; // Time in milliseconds (3000ms = 3 seconds)

// Function to update the carousel position
function updateCarousel() {
    carouselImages.style.transform = `translateX(-${index * 100}%)`;
}

// Function to go to the next image
function nextImage() {
    index = (index + 1) % images.length;
    updateCarousel();
}

// Set up an automatic loop for the carousel
let autoSlide = setInterval(nextImage, intervalTime);

// Event listeners for manual controls
document.querySelector('.next').addEventListener('click', () => {
    clearInterval(autoSlide); // Stop auto-slide temporarily
    nextImage();
    autoSlide = setInterval(nextImage, intervalTime); // Restart auto-slide
});

document.querySelector('.prev').addEventListener('click', () => {
    clearInterval(autoSlide); // Stop auto-slide temporarily
    index = (index - 1 + images.length) % images.length;
    updateCarousel();
    autoSlide = setInterval(nextImage, intervalTime); // Restart auto-slide
});
