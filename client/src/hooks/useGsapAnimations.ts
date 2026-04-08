import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook for 3D card tilt effect on mousemove
 */
export const useCardTilt = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      gsap.to(element, {
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 800,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.5,
        ease: "back.out",
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [ref]);
};

/**
 * Hook for parallax scroll effect
 */
export const useParallax = (ref: React.RefObject<HTMLElement>, speed = 0.5) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      gsap.to(element, {
        y: scrollY * speed,
        duration: 0.1,
        overwrite: "auto",
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [ref, speed]);
};

/**
 * Hook for custom cursor animation
 */
export const useCustomCursor = () => {
  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.style.position = "fixed";
    cursor.style.width = "20px";
    cursor.style.height = "20px";
    cursor.style.border = "2px solid #52b788";
    cursor.style.borderRadius = "50%";
    cursor.style.pointerEvents = "none";
    cursor.style.zIndex = "9999";
    cursor.style.opacity = "0.7";
    document.body.appendChild(cursor);

    const cursorDot = document.createElement("div");
    cursorDot.style.position = "fixed";
    cursorDot.style.width = "4px";
    cursorDot.style.height = "4px";
    cursorDot.style.background = "#52b788";
    cursorDot.style.borderRadius = "50%";
    cursorDot.style.pointerEvents = "none";
    cursorDot.style.zIndex = "10000";
    document.body.appendChild(cursorDot);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      gsap.to(cursorDot, {
        left: mouseX - 2,
        top: mouseY - 2,
        duration: 0,
      });

      gsap.to(cursor, {
        left: mouseX - 10,
        top: mouseY - 10,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeChild(cursor);
      document.body.removeChild(cursorDot);
    };
  }, []);
};

/**
 * Hook for scroll-triggered animations
 */
export const useScrollTriggerAnimation = (
  ref: React.RefObject<HTMLElement>,
  options?: {
    trigger?: string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
  }
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.to(element, {
      scrollTrigger: {
        trigger: options?.trigger || element,
        start: options?.start || "top 80%",
        end: options?.end || "top 20%",
        scrub: options?.scrub !== undefined ? options.scrub : 1,
        markers: options?.markers || false,
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [ref, options]);
};

/**
 * Hook for number counter animation
 */
export const useNumberCounter = (
  ref: React.RefObject<HTMLElement>,
  targetNumber: number,
  duration = 1.5
) => {
  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { textContent: "0" },
      {
        textContent: targetNumber,
        duration,
        snap: { textContent: 1 },
        ease: "power2.out",
      }
    );
  }, [ref, targetNumber, duration]);
};

/**
 * Hook for staggered element animations
 */
export const useStaggerAnimation = (
  ref: React.RefObject<HTMLElement>,
  selector: string,
  options?: {
    duration?: number;
    stagger?: number;
    ease?: string;
    fromVars?: Record<string, any>;
    toVars?: Record<string, any>;
  }
) => {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const elements = container.querySelectorAll(selector);
    if (elements.length === 0) return;

    const defaultFromVars = {
      opacity: 0,
      y: 20,
      ...options?.fromVars,
    };

    const defaultToVars = {
      opacity: 1,
      y: 0,
      duration: options?.duration || 0.6,
      stagger: options?.stagger || 0.1,
      ease: options?.ease || "back.out",
      ...options?.toVars,
    };

    gsap.fromTo(elements, defaultFromVars, defaultToVars);
  }, [ref, selector, options]);
};
