// header.js

document.addEventListener("DOMContentLoaded", () => {
    const dropdownBtn = document.querySelector('.dropdown-btn');
    dropdownBtn.addEventListener('click', (event) => {
        const dropdownContent = event.target.nextElementSibling;
        dropdownContent.style.display =
            dropdownContent.style.display === 'block' ? 'none' : 'block';
    });
});
