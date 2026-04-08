import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Advanced 3D card flip animation with depth and shadow
 */
export const useCard3DFlip = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * 15;
      const rotateY = ((centerX - x) / centerX) * 15;

      gsap.to(element, {
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 1000,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [elementRef]);
};

/**
 * Fluid text reveal animation with letter-by-letter effect
 */
export const useTextReveal = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const text = element.textContent || "";
    element.innerHTML = text
      .split("")
      .map((char) => `<span class="text-reveal-char">${char}</span>`)
      .join("");

    gsap.fromTo(
      element.querySelectorAll(".text-reveal-char"),
      { opacity: 0, y: 20, rotationX: -90 },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.6,
        stagger: 0.03,
        ease: "back.out(1.7)",
        transformPerspective: 1000,
      }
    );
  }, [elementRef]);
};

/**
 * Glassmorphism blur effect animation
 */
export const useGlassmorphism = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.set(element, {
      backdropFilter: "blur(0px)",
      background: "rgba(255, 255, 255, 0)",
    });

    ScrollTrigger.create({
      trigger: element,
      onEnter: () => {
        gsap.to(element, {
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.1)",
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
    });
  }, [elementRef]);
};

/**
 * Parallax depth layers with multiple planes
 */
export const useParallaxDepth = (containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const layers = container.querySelectorAll("[data-parallax-layer]");

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      layers.forEach((layer) => {
        const depth = parseFloat((layer as HTMLElement).dataset.parallaxLayer || "1");
        const moveX = x * depth * 50;
        const moveY = y * depth * 50;

        gsap.to(layer, {
          x: moveX,
          y: moveY,
          duration: 0.5,
          ease: "power2.out",
        });
      });
    };

    const handleMouseLeave = () => {
      layers.forEach((layer) => {
        gsap.to(layer, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)",
        });
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef]);
};

/**
 * Scroll-triggered 3D sequence animation
 */
export const useScroll3DSequence = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.fromTo(
      element,
      {
        opacity: 0,
        rotationX: 90,
        rotationY: -45,
        z: -500,
        transformPerspective: 1200,
      },
      {
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
          markers: false,
        },
        opacity: 1,
        rotationX: 0,
        rotationY: 0,
        z: 0,
        duration: 1,
        ease: "power2.inOut",
      }
    );
  }, [elementRef]);
};

/**
 * Gradient animation effect
 */
export const useGradientAnimation = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.to(element, {
      backgroundPosition: "200% center",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, [elementRef]);
};

/**
 * Morphing SVG animation
 */
export const useMorphingSVG = (elementRef: React.RefObject<SVGPathElement>) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const paths = [
      "M100,10 Q150,40 150,100 Q150,160 100,190 Q50,160 50,100 Q50,40 100,10",
      "M100,20 Q180,50 180,100 Q180,150 100,180 Q20,150 20,100 Q20,50 100,20",
      "M100,10 Q150,40 150,100 Q150,160 100,190 Q50,160 50,100 Q50,40 100,10",
    ];

    let currentPath = 0;
    const morphShape = () => {
      gsap.to(element, {
        attr: { d: paths[currentPath] },
        duration: 2,
        ease: "sine.inOut",
        onComplete: () => {
          currentPath = (currentPath + 1) % paths.length;
          morphShape();
        },
      });
    };

    morphShape();
  }, [elementRef]);
};

/**
 * Interactive 3D cursor tracking
 */
export const useInteractive3DCursor = (containerRef: React.RefObject<HTMLElement>) => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * 20;
      const rotateY = ((centerX - x) / centerX) * 20;

      gsap.to(container, {
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 1200,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(container, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef]);

  return cursorRef;
};

/**
 * Spring physics animation
 */
export const useSpringAnimation = (
  elementRef: React.RefObject<HTMLElement>,
  config = { tension: 100, friction: 20 }
) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale: 1.05,
        duration: 0.5,
        ease: `back.out(${config.tension / 100})`,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.6,
        ease: `elastic.out(1, ${config.friction / 100})`,
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [elementRef, config]);
};

/**
 * Particle system animation
 */
export const useParticleSystem = (containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particleCount = 20;
    const particles: HTMLElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, rgba(82, 183, 136, 0.8), rgba(82, 183, 136, 0));
        border-radius: 50%;
        pointer-events: none;
        box-shadow: 0 0 10px rgba(82, 183, 136, 0.5);
      `;
      container.appendChild(particle);
      particles.push(particle);

      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = 2 + Math.random() * 2;

      gsap.fromTo(
        particle,
        {
          left: `${x}%`,
          top: `${y}%`,
          opacity: 1,
          scale: 1,
        },
        {
          left: `${x + (Math.random() - 0.5) * 50}%`,
          top: `${y - 50}%`,
          opacity: 0,
          scale: 0,
          duration,
          repeat: -1,
          ease: "power1.inOut",
        }
      );
    }

    return () => {
      particles.forEach((p: HTMLElement) => p.remove());
    };
  }, [containerRef]);
};

/**
 * Number counter animation
 */
export const useNumberCounter = (
  elementRef: React.RefObject<HTMLElement>,
  targetNumber: number,
  duration = 2
) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const counter = { value: 0 };

    gsap.to(counter, {
      value: targetNumber,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = Math.floor(counter.value).toLocaleString();
      },
    });
  }, [elementRef, targetNumber, duration]);
};

/**
 * Ambient lighting animation
 */
export const useAmbientLighting = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(element, {
      boxShadow: "0 0 40px rgba(82, 183, 136, 0.5)",
      duration: 1.5,
      ease: "sine.inOut",
    }).to(
      element,
      {
        boxShadow: "0 0 20px rgba(82, 183, 136, 0.3)",
        duration: 1.5,
        ease: "sine.inOut",
      },
      0
    );
  }, [elementRef]);
};
