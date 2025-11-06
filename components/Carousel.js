import React, { useState } from "react";
import "../components/Carousel.css";

const images = [
  { src: "/flick-tickets-images/the-jungle-book.jpg", alt: "Image 1" },
  { src: "/flick-tickets-images/the-wild-robot-movie.jpeg", alt: "Image 2" },
  { src: "/flick-tickets-images/venom-movie.png", alt: "Image 3" }
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="carousel">
      <button className="prev" onClick={prevSlide}>&#10094;</button>
      <div className="carousel-images" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {images.map((image, index) => (
          <img key={index} src={image.src} alt={image.alt} />
        ))}
      </div>
      <button className="next" onClick={nextSlide}>&#10095;</button>
    </div>
  );
};

export default Carousel;
