'use client'

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { galleryImages } from "@/lib/images";

const ImageGallery: React.FC = () => {
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

  const animateSwap = (direction: "left" | "right") => {
    if (isAnimating) return;
    setIsAnimating(true);
  
    const clickedThumbRef = direction === "left" ? leftThumbRef : rightThumbRef;
    const oppositeThumbRef = direction === "left" ? rightThumbRef : leftThumbRef;
    const clickedImageRef = direction === "left" ? leftImageRef : rightImageRef;
    const oppositeImageRef = direction === "left" ? rightImageRef : leftImageRef;
    
    const nextIndex = direction === "right" 
      ? (currentIndex + 1) % galleryImages.length 
      : (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    
    // Get positions
    const clickedRect = clickedThumbRef.current?.getBoundingClientRect();
    const oppositeRect = oppositeThumbRef.current?.getBoundingClientRect();
    const centerRect = mainImageRef.current?.getBoundingClientRect();
    
    
    if (!clickedRect || !oppositeRect || !centerRect || !containerRef.current) {
      setIsAnimating(false);
      return;
    }
    
    // Create clones
    const clickedClone = clickedImageRef.current?.cloneNode(true) as HTMLElement;
    const centerClone = mainImageRef.current?.cloneNode(true) as HTMLElement;
    const oppositeClone = oppositeImageRef.current?.cloneNode(true) as HTMLElement;
    const newThumbClone = oppositeImageRef.current?.cloneNode(true) as HTMLElement;

    
    
    if (!clickedClone || !centerClone || !oppositeClone || !newThumbClone) {
      setIsAnimating(false);
      return;
    }
    
    containerRef.current.appendChild(clickedClone);
    containerRef.current.appendChild(centerClone);
    containerRef.current.appendChild(oppositeClone);
    containerRef.current.appendChild(newThumbClone);
    
    
    // Position clones
    gsap.set([clickedClone, centerClone, oppositeClone, newThumbClone], {
      position: "absolute",
      zIndex: 100,
      pointerEvents: "none"
    });
    
    const containerBounds = containerRef.current.getBoundingClientRect();
    
    // Set initial positions
    gsap.set(clickedClone, {
      left: clickedRect.left - containerBounds.left,
      top: clickedRect.top - containerBounds.top,
      width: clickedRect.width,
      height: clickedRect.height,
      scale: 1
    });
    
    gsap.set(centerClone, {
      left: centerRect.left - containerBounds.left,
      top: centerRect.top - containerBounds.top,
      width: centerRect.width,
      height: centerRect.height,
      scale: 1
    });
    
    // Position opposite clone at its current position
    gsap.set(oppositeClone, {
      left: oppositeRect.left - containerBounds.left,
      top: oppositeRect.top - containerBounds.top,
      width: oppositeRect.width,
      height: oppositeRect.height,
      scale: 1
    });
    
    // Position new thumbnail clone below screen (will come up later)
    gsap.set(newThumbClone, {
      left: clickedRect.left - containerBounds.left,
      top: containerBounds.height,
      x: direction === "left" ? -clickedRect.width : clickedRect.width, // Start off-screen horizontally
      opacity: 0
    });
  
    // Hide originals during animation
    gsap.set([mainImageRef.current, leftImageRef.current, rightImageRef.current], {
      opacity: 0
    });
    
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set([mainImageRef.current, leftImageRef.current, rightImageRef.current], {
          opacity: 1
        });
        clickedClone.remove();
        centerClone.remove();
        oppositeClone.remove();
        newThumbClone.remove();
        setCurrentIndex(nextIndex);
        setIsAnimating(false);
      }
    });
  
    // Animate title
    tl.to(titleRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.out"
    });
  
    // Phase 1: Move current elements
    tl.add([
      // Clicked thumbnail scales up and moves to center
      gsap.to(clickedClone, {
        left: centerRect.left,
        top: centerRect.top,
        width: centerRect.width,
        height: centerRect.height,
        scale: 0.8,
        duration: 1,
        ease: "power2.inOut"
      }),
      
      // Center image scales down and moves to opposite thumbnail position
      gsap.to(centerClone, {
        left: oppositeRect.left - containerBounds.left,
        top: oppositeRect.top - containerBounds.top,
        width: oppositeRect.width,
        height: oppositeRect.height,
        scale: 1,
        duration: 1,
        ease: "power2.inOut"
      }),


      gsap.to(oppositeClone, {
        x: direction === "left" ? containerBounds.width : -oppositeRect.width,
        y: containerBounds.height,
        opacity: 0,
        duration: 1,
        ease: "power2.in"
      })
    ], ">");
  
    // Phase 2: Bring in new thumbnail
    tl.to(newThumbClone, {
      x: 0, // Move to final x position
      top: clickedRect.top - containerBounds.top, // Move to final y position
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    }, ">-=0.3");
  
    // Update and animate title
    tl.call(() => {
      if (titleRef.current) {
        titleRef.current.textContent = galleryImages[nextIndex].title;
      }
    }, [], 0.5);
  
    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.in"
    }, ">-0.2");
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
    <section 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white to-slate-50 px-4 sm:px-6"
    >
      {/* Main Image Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1 
          ref={titleRef}
          className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-[#00213F] text-center relative top-[56px] sm:top-[100px] md:top-[120px] lg:top-[160px]"
        >
          {mainImage.title}
        </h1>
        
        <div 
          ref={mainImageRef}
          className="relative w-full max-w-4xl h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px]  flex items-center justify-center "
        >
          <Image
            src={mainImage.src}
            alt={mainImage.alt}
            fill
            className="object-contain "
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
        </div>
        <button className="relative text-[14px] md:text-[16px] sm:-top-24 bg-blue-500 text-white p-2.5 md:p-4 cursor-pointer rounded-3xl font-semibold">Request Quote</button>
      </div>

      {/* Navigation Thumbnails */}
      <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 flex justify-between items-center px-6 sm:px-12 md:px-24">
        {/* Left Thumbnail */}
        <div
          ref={leftThumbRef} 
          className="group cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => animateSwap("left")}
        >
          <div 
            ref={leftImageRef}
            className="relative w-[100px] h-[60px] sm:w-[150px] sm:h-[90px] md:w-[200px] md:h-[120px] rounded-lg overflow-hidden "
          >
            <Image
              src={leftThumb.src}
              alt={leftThumb.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100px, 200px"
            />
           
          </div>
         
        </div>

        {/* Right Thumbnail */}
        <div
          ref={rightThumbRef}
          className="group cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => animateSwap("right")}
        >
          <div 
            ref={rightImageRef}
            className="relative w-[100px] h-[60px] sm:w-[150px] sm:h-[90px] md:w-[200px] md:h-[120px] rounded-lg overflow-hidden"
          >
            <Image
              src={rightThumb.src}
              alt={rightThumb.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100px, 200px"
            />
            <div className="absolute inset-0  transition-colors duration-300"></div>
          </div>
         
        </div>
      </div>
      
     
    </section>
  );
};

export default ImageGallery;