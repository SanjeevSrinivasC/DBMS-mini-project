// Keep track of which slide is currently shown
let slideIndex = 1;

// THIS IS THE FIX:
// When the HTML content is loaded, run the function to show the first slide.
document.addEventListener("DOMContentLoaded", function() {
    showSlide(slideIndex);
});

// Function for Next/Prev buttons
function changeSlide(n) {
    showSlide(slideIndex += n);
}

// Function for the dots
function setSlide(n) {
    showSlide(slideIndex = n);
}

// This is the main function that controls the carousel
function showSlide(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");

    // --- Safety Checks (Looping) ---
    // If 'n' is more than the number of slides, go back to slide 1
    if (n > slides.length) {
        slideIndex = 1;
    }
    // If 'n' is less than 1, go to the last slide
    if (n < 1) {
        slideIndex = slides.length;
    }

    // --- Logic ---
    // 1. Hide ALL slides
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    // 2. Remove the "active" class from ALL dots
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    // 3. Show the CURRENT slide
    // (slideIndex - 1 because arrays start at 0, but your slides start at 1)
    slides[slideIndex - 1].style.display = "block";

    // 4. Add the "active" class to the CURRENT dot
    dots[slideIndex - 1].className += " active";
}

