import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useCard3DFlip,
  useTextReveal,
  useParallaxDepth,
  useScroll3DSequence,
  useAmbientLighting,
  useParticleSystem,
} from "@/hooks/useAdvancedAnimations";
import { Zap, Award, MapPin, TrendingUp } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);

  // Apply advanced animations
  useTextReveal(titleRef as React.RefObject<HTMLElement>);
  useTextReveal(subtitleRef as React.RefObject<HTMLElement>);
  useParallaxDepth(containerRef as React.RefObject<HTMLElement>);
  useCard3DFlip(card1Ref as React.RefObject<HTMLElement>);
  useCard3DFlip(card2Ref as React.RefObject<HTMLElement>);
  useCard3DFlip(card3Ref as React.RefObject<HTMLElement>);
  useCard3DFlip(card4Ref as React.RefObject<HTMLElement>);
  useScroll3DSequence(heroRef as React.RefObject<HTMLElement>);
  useAmbientLighting(card1Ref as React.RefObject<HTMLElement>);
  useAmbientLighting(card2Ref as React.RefObject<HTMLElement>);
  useAmbientLighting(card3Ref as React.RefObject<HTMLElement>);
  useAmbientLighting(card4Ref as React.RefObject<HTMLElement>);
  useParticleSystem(particleRef as React.RefObject<HTMLElement>);

  // Hero section animations
  useEffect(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      heroRef.current,
      { opacity: 0, y: 100, rotationX: 45 },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 1.2,
        ease: "back.out(1.5)",
        transformPerspective: 1200,
      }
    );

    // Floating animation
    gsap.to(heroRef.current, {
      y: -20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  // Feature cards stagger animation
  useEffect(() => {
    const cards = document.querySelectorAll(".feature-card-3d");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 50, rotationY: 90 },
      {
        opacity: 1,
        y: 0,
        rotationY: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.7)",
        transformPerspective: 1000,
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 70%",
          markers: false,
        },
      }
    );
  }, []);

  // Stats counter animation
  useEffect(() => {
    const statElements = document.querySelectorAll(".stat-number");
    statElements.forEach((el) => {
      const target = parseInt(el.textContent || "0");
      gsap.fromTo(
        { value: 0 },
        { value: target },
        {
          duration: 2,
          ease: "power2.out",
          onUpdate: function () {
            el.textContent = Math.floor(this.targets()[0].value).toLocaleString();
          },
          scrollTrigger: {
            trigger: ".stats-section",
            start: "top 70%",
            markers: false,
          },
        }
      );
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-g100 to-cream overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-g300/20">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-gradient-eco">EcoCred</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => (window.location.href = "/login")}
              className="px-6 py-2 rounded-lg font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
              }}
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden">
        {/* Particle background */}
        <div
          ref={particleRef}
          className="absolute inset-0 opacity-30"
          style={{ pointerEvents: "none" }}
        />

        {/* 3D Hero Container */}
        <div
          ref={containerRef}
          className="relative z-10 text-center max-w-4xl"
          style={{ perspective: "1200px" }}
        >
          <div
            ref={heroRef}
            className="relative"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Glowing background */}
            <div
              className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
              style={{
                background: "linear-gradient(135deg, #52b788 0%, #2d6a4f 100%)",
                transform: "scale(1.2)",
              }}
            />

            {/* Main content */}
            <div className="relative z-10">
              <h1
                ref={titleRef}
                className="text-6xl md:text-8xl font-serif font-bold mb-6 leading-tight"
                style={{
                  background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Earn Credits While Cleaning
              </h1>

              <p
                ref={subtitleRef}
                className="text-xl md:text-2xl text-text-mid mb-8 leading-relaxed"
              >
                Join the EcoCred platform and get rewarded for completing garbage collection routes. Track your progress in real-time with GPS verification and redeem rewards instantly.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  onClick={() => (window.location.href = "/register")}
                  className="px-8 py-4 rounded-lg font-semibold text-white transition-all hover:shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                    boxShadow: "0 8px 32px rgba(45, 106, 79, 0.20)",
                  }}
                >
                  Get Started
                </Button>
                <Button
                  onClick={() => (window.location.href = "/leaderboard")}
                  className="px-8 py-4 rounded-lg font-semibold border-2 transition-all"
                  style={{
                    borderColor: "#2d6a4f",
                    color: "#2d6a4f",
                    background: "rgba(45, 106, 79, 0.05)",
                  }}
                >
                  View Leaderboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Animated wave divider */}
        <svg
          className="absolute bottom-0 left-0 w-full h-24 opacity-20"
          viewBox="0 0 1200 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z"
            fill="currentColor"
            style={{ color: "#2d6a4f" }}
          />
        </svg>
      </section>

      {/* Features Section */}
      <section className="features-section relative py-20 px-4">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-serif font-bold text-text-dark mb-4">
              Why Choose EcoCred?
            </h2>
            <p className="text-xl text-text-mid">
              Premium features designed for modern workers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Instant Credits",
                description: "Earn 10 credits per house completed",
              },
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "GPS Tracking",
                description: "Real-time location verification",
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Rewards",
                description: "Redeem credits for amazing prizes",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Leaderboard",
                description: "Compete with other workers",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                ref={idx === 0 ? card1Ref : idx === 1 ? card2Ref : idx === 2 ? card3Ref : card4Ref}
                className="feature-card-3d bg-white rounded-3xl p-8 text-center"
                style={{
                  border: "1px solid rgba(82, 183, 136, 0.1)",
                  boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
                  transformStyle: "preserve-3d",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  className="text-5xl mb-4 inline-block"
                  style={{ color: "#2d6a4f" }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-text-dark mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-mid">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section relative py-20 px-4 bg-gradient-to-r from-g700 to-g500 text-white">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { number: "1000", label: "Active Workers", suffix: "+" },
              { number: "50", label: "Houses Cleaned", suffix: "K+" },
              { number: "500", label: "Credits Earned", suffix: "K+" },
            ].map((stat, idx) => (
              <div key={idx} className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-6xl font-serif font-bold mb-2">
                  <span className="stat-number">{stat.number}</span>
                  {stat.suffix}
                </div>
                <p className="text-lg opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="container max-w-2xl">
          <div
            className="bg-white rounded-3xl p-12 text-center"
            style={{
              border: "1px solid rgba(82, 183, 136, 0.1)",
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
            }}
          >
            <h2 className="text-4xl font-serif font-bold text-text-dark mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-text-mid text-lg mb-8">
              Join thousands of workers already earning credits on EcoCred
            </p>
            <Button
              onClick={() => (window.location.href = "/register")}
              className="px-8 py-4 rounded-lg font-semibold text-white transition-all hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                boxShadow: "0 8px 32px rgba(45, 106, 79, 0.20)",
              }}
            >
              Create Account Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-dark text-white py-8 px-4">
        <div className="container text-center">
          <p>&copy; 2026 EcoCred. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
