import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/layout/InitialsAvatar";
import { team } from "@/data/site";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  src: string;
  alt: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    src: "/images/hero-1.webp",
    alt: "Nexora embedded solutions workbench and hardware prototyping",
  },
  {
    src: "/images/hero-2.webp",
    alt: "Microcontrollers, circuit boards, and electronic test equipment",
  },
  {
    src: "/images/hero-3.webp",
    alt: "Advanced IoT systems, VLSI, and student innovation workshop",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const nextSlide = useCallback(() => {
    setChangeCount((c) => c + 1);
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setChangeCount((c) => c + 1);
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Autoplay every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section
      aria-label="Hero slider"
      aria-roledescription="carousel"
      className="relative w-full h-[calc(100svh-4rem)] md:h-[calc(100svh-5.5rem)] min-h-[580px] max-h-[1000px] overflow-hidden flex items-center justify-center bg-navy text-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides - crossfade over 700ms */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={slide.src}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                isActive ? "opacity-100 z-5" : "opacity-0 z-0 pointer-events-none",
                shouldReduceMotion && "transition-none duration-0",
              )}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                width={1672}
                height={940}
                loading="eager"
                fetchPriority={index === 0 ? "high" : "low"}
                className="size-full object-cover object-center"
              />
            </div>
          );
        })}
      </div>

      {/* Diagonal bg-brand-gradient wipe passing across during the change */}
      {!shouldReduceMotion && changeCount > 0 && (
        <motion.div
          key={`wipe-${changeCount}`}
          initial={{ x: "-125%", skewX: -20 }}
          animate={{ x: "125%", skewX: -20 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute -inset-y-32 left-0 w-full bg-brand-gradient opacity-80 pointer-events-none z-15 shadow-[0_0_60px_rgba(201,75,208,0.5)]"
          aria-hidden="true"
        />
      )}

      {/* Navy overlay for high contrast and brand depth */}
      <div
        className="absolute inset-0 bg-[#001B3D]/75 md:bg-[#001B3D]/70 z-10 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#001B3D] via-transparent to-[#001B3D]/50 z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Content overlay */}
      <div className="container relative z-20 px-12 sm:px-16 md:px-20 text-center flex flex-col items-center justify-center py-12">
        {/* Orbitron Caps Tagline */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md mb-5 md:mb-6 shadow-sm">
          <span className="size-2 rounded-full bg-brand-gradient animate-pulse" />
          <span className="font-display text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.18em] text-white">
            Experience the best embedded solutions
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1] max-w-4xl text-center mx-auto mb-6 md:mb-8 drop-shadow-sm">
          From Your Idea to a{" "}
          <span className="text-brand-gradient block sm:inline">
            Working Embedded Prototype
          </span>
        </h1>

        {/* Subtitle description */}
        <p className="max-w-2xl text-sm sm:text-base md:text-lg text-white/80 font-normal leading-relaxed mb-8 md:mb-10 text-center">
          You bring the curiosity and the concept. Nexora provides hands-on technical
          guidance, hardware prototyping, and front-end builds to turn ambitious ideas into reality.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-brand-gradient text-white hover:opacity-95 shadow-lg shadow-royal/30 border-0 h-12 px-7 text-sm font-semibold rounded-lg transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <Link to="/request">Start Your Project</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-white/30 text-white bg-white/5 hover:bg-white/15 hover:text-white h-12 px-7 text-sm font-semibold rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
          >
            <Link to="/projects">Explore Projects</Link>
          </Button>
        </div>

        {/* Student Proof Avatars */}
        <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3 text-white/80 text-xs sm:text-sm">
          <div className="flex items-center -space-x-2">
            {team.map((member) => (
              <InitialsAvatar
                key={member.name}
                name={member.name}
                photo={member.photo}
                size="sm"
                className="shadow-sm ring-2 ring-navy"
              />
            ))}
          </div>
          <span>
            Built by students, for students.{" "}
            <strong className="text-white font-medium">Available this semester.</strong>
          </span>
        </div>
      </div>

      {/* Prev / Next Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 flex size-10 md:size-12 items-center justify-center rounded-full bg-navy/60 hover:bg-navy/90 text-white/80 hover:text-white border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
      >
        <ChevronLeft className="size-5 md:size-6" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 flex size-10 md:size-12 items-center justify-center rounded-full bg-navy/60 hover:bg-navy/90 text-white/80 hover:text-white border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
      >
        <ChevronRight className="size-5 md:size-6" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-5 md:bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (current !== i) {
                setChangeCount((c) => c + 1);
                setCurrent(i);
              }
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all duration-300 cursor-pointer",
              current === i
                ? "w-8 bg-brand-gradient shadow-xs"
                : "w-2 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </section>
  );
}

