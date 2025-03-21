import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef } from "react";

const images = [
  "assets/img/slider-1.png",
  "assets/img/slider-2.png",
  "assets/img/slider-3.png",
  "assets/img/slider-4.png",
];

const ImageSlider = () => {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const startAutoSlide = () => {
    stopAutoSlide();
    intervalRef.current = setInterval(nextSlide, 3000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextSlide();
        startAutoSlide();
      }
      if (e.key === "ArrowLeft") {
        prevSlide();
        startAutoSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) nextSlide();
    if (diff < -50) prevSlide();
    touchStartX.current = null;
    startAutoSlide();
  };

  return (
    <div
      className="relative w-full h-auto mx-auto overflow-hidden rounded-3xl shadow-lg"
      onMouseEnter={stopAutoSlide}
      onMouseLeave={startAutoSlide}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            className="w-full h-[80vh] md:h-[60vh] object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-75 hover:opacity-100"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-75 hover:opacity-100"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i);
              startAutoSlide();
            }}
            className={`w-3 h-3 rounded-full ${
              index === i ? "bg-emerald-500 scale-125" : "bg-gray-100"
            } transition-all`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
