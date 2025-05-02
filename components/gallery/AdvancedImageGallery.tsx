'use client'

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { galleryImages } from "@/lib/images";

const AdvancedImageGallery: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leftThumbRef = useRef<HTMLDivElement>(null);
  const rightThumbRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getIndex = (offset: number) =>
    (currentIndex + offset + galleryImages.length) % galleryImages.length;

  const mainImage = galleryImages[currentIndex];
  const leftThumb = galleryImages[getIndex(-1)];
  const rightThumb = galleryImages[getIndex(1)];

  const animateComplexSwap = (clickedThumb: "left" | "right") => {
    if (isAnimating) return;
    setIsAnimating(true);
  
    const clickedThumbRef = clickedThumb === "left" ? leftThumbRef : rightThumbRef;
    const oppositeThumbRef = clickedThumb === "left" ? rightThumbRef : leftThumbRef;
    const clickedImageRef = clickedThumb === "left" ? leftImageRef : rightImageRef;
    
    const targetIndex = clickedThumb === "left" 
      ? (currentIndex - 1 + galleryImages.length) % galleryImages.length 
      : (currentIndex + 1) % galleryImages.length;
  
    // Get positions
    const thumbRect = clickedThumbRef.current?.getBoundingClientRect();
    const oppositeRect = oppositeThumbRef.current?.getBoundingClientRect();
    const centerRect = mainImageRef.current?.getBoundingClientRect();
    
    if (!thumbRect || !oppositeRect || !centerRect || !containerRef.current) return;
  
    // Create clones
    const thumbClone = clickedImageRef.current?.cloneNode(true) as HTMLElement;
    const centerClone = mainImageRef.current?.cloneNode(true) as HTMLElement;
    const oppositeClone = clickedThumb === "left" 
      ? rightImageRef.current?.cloneNode(true) as HTMLElement
      : leftImageRef.current?.cloneNode(true) as HTMLElement;
    
    if (!thumbClone || !centerClone || !oppositeClone) return;
  
    containerRef.current.appendChild(thumbClone);
    containerRef.current.appendChild(centerClone);
    containerRef.current.appendChild(oppositeClone);
    
    // Position clones
    gsap.set([thumbClone, centerClone, oppositeClone], {
      position: "absolute",
      zIndex: 100,
      pointerEvents: "none",
      transformOrigin: "center center"
    });
  
    gsap.set(thumbClone, {
      left: thumbRect.left - containerRef.current.getBoundingClientRect().left,
      top: thumbRect.top - containerRef.current.getBoundingClientRect().top,
      width: thumbRect.width,
      height: thumbRect.height,
      scale: 1
    });
  
    gsap.set(centerClone, {
      left: centerRect.left - containerRef.current.getBoundingClientRect().left,
      top: centerRect.top - containerRef.current.getBoundingClientRect().top,
      width: centerRect.width,
      height: centerRect.height,
      scale: 1
    });
  
    gsap.set(oppositeClone, {
      left: oppositeRect.left - containerRef.current.getBoundingClientRect().left,
      top: oppositeRect.top - containerRef.current.getBoundingClientRect().top,
      width: oppositeRect.width,
      height: oppositeRect.height,
      scale: 1
    });

    // Hide originals during animation
    gsap.set([mainImageRef.current, leftImageRef.current, rightImageRef.current], {
      opacity: 0,
      duration: 0
    });
  
    // Create timeline
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set([mainImageRef.current, leftImageRef.current, rightImageRef.current], {
          opacity: 1,
          duration: 0
        });
        thumbClone.remove();
        centerClone.remove();
        oppositeClone.remove();
        
        setCurrentIndex(targetIndex);
        setIsAnimating(false);
      }
    });
  
    const xDirection = clickedThumb === "left" ? 1 : -1;
    const totalDuration = 1;
  
    // Animate title
    tl.to(titleRef.current, {
      opacity: 0,
      y: -20,
      duration: totalDuration * 0.3,
      ease: "power2.out"
    });
  
    // Main movement animations
    tl.add([
      // Clicked thumbnail moves to center
      gsap.to(thumbClone, {
        left: centerRect.left - containerRef.current.getBoundingClientRect().left,
        top: centerRect.top - containerRef.current.getBoundingClientRect().top,
        width: centerRect.width,
        height: centerRect.height,
        scale: 1,
        duration: totalDuration,
        ease: "power2.inOut"
      }),
      
      // Current center image moves to opposite position
      gsap.to(centerClone, {
        left: oppositeRect.left - containerRef.current.getBoundingClientRect().left,
        top: oppositeRect.top - containerRef.current.getBoundingClientRect().top,
        width: oppositeRect.width,
        height: oppositeRect.height,
        duration: totalDuration,
        ease: "power2.inOut"
      }),
      
      // Opposite thumbnail exits with motion path
      gsap.to(oppositeClone, {
        x: xDirection * window.innerWidth * 0.3,
        y: window.innerHeight * 0.2,
        rotation: xDirection * 20,
        opacity: 0,
        scale: 0.8,
        duration: totalDuration * 0.8,
        ease: "power2.in"
      }),
    ], "<");
  
    // Change text when center clone is halfway
    tl.call(() => {
      if (titleRef.current) {
        titleRef.current.textContent = galleryImages[targetIndex].title;
      }
    }, [], totalDuration * 0.5);
  
    // Fade in new text
    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: totalDuration * 0.5,
      ease: "power2.in"
    }, `-=${totalDuration * 0.2}`);
  };

  useEffect(() => {
    // Preload images for smoother experience
    galleryImages.forEach(img => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = img.src;
      document.head.appendChild(preloadLink);
    });
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Main Image Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        <h1 
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-slate-800 text-center relative mb-8 sm:mb-12"
        >
          {mainImage.title}
        </h1>
        
        <div 
          ref={mainImageRef}
          className="relative w-full max-w-4xl h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] mb-8 sm:mb-12"
        >
          <Image
            src={mainImage.src}
            alt={mainImage.alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
        </div>
        
       
      </div>

      {/* Navigation Thumbnails */}
      <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 flex justify-between items-center px-6 sm:px-12 md:px-24">
        {/* Left Thumbnail */}
        <div
          ref={leftThumbRef} 
          className="group cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => animateComplexSwap("left")}
        >
          <div 
            ref={leftImageRef}
            className="relative w-[100px] h-[60px] sm:w-[150px] sm:h-[90px] md:w-[200px] md:h-[120px] rounded-lg overflow-hidden shadow-md"
          >
            <Image
              src={leftThumb.src}
              alt={leftThumb.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100px, 200px"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
          </div>
          <p className="mt-2 text-center text-sm sm:text-base font-medium text-slate-600">{leftThumb.title}</p>
        </div>

        {/* Right Thumbnail */}
        <div
          ref={rightThumbRef}
          className="group cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => animateComplexSwap("right")}
        >
          <div 
            ref={rightImageRef}
            className="relative w-[100px] h-[60px] sm:w-[150px] sm:h-[90px] md:w-[200px] md:h-[120px] rounded-lg overflow-hidden shadow-md"
          >
            <Image
              src={rightThumb.src}
              alt={rightThumb.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100px, 200px"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
          </div>
          <p className="mt-2 text-center text-sm sm:text-base font-medium text-slate-600">{rightThumb.title}</p>
        </div>
      </div>
      
      {/* Navigation Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {galleryImages.map((_, index) => (
          <button 
            key={index} 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-blue-600 w-6' : 'bg-slate-300'
            }`}
            onClick={() => {
              if (!isAnimating && index !== currentIndex) {
                const direction = index > currentIndex ? "right" : "left";
                animateComplexSwap(direction);
              }
            }}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AdvancedImageGallery;