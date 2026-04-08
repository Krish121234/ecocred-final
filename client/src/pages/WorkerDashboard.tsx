import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useCard3DFlip,
  useAmbientLighting,
  useParticleSystem,
} from "@/hooks/useAdvancedAnimations";
import { MapPin, Award, Zap, TrendingUp, Navigation } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface DashboardData {
  credits: number;
  housesCovered: number;
  assignedRoute?: any;
  leaderboardPosition?: number;
}

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    credits: 0,
    housesCovered: 0,
  });
  const [isTracking, setIsTracking] = useState(false);
  const creditsRef = useRef<HTMLDivElement>(null);
  const housesRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);

  // Apply advanced animations
  useCard3DFlip(creditsRef as React.RefObject<HTMLElement>);
  useCard3DFlip(housesRef as React.RefObject<HTMLElement>);
  useAmbientLighting(creditsRef as React.RefObject<HTMLElement>);
  useAmbientLighting(housesRef as React.RefObject<HTMLElement>);
  useParticleSystem(particleRef as React.RefObject<HTMLElement>);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/trpc/worker.getDashboard");
        if (response.ok) {
          const result = await response.json();
          setDashboardData(result.result?.data || dashboardData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      }
    };

    fetchDashboard();
  }, []);

  // Animate credit counter
  useEffect(() => {
    if (creditsRef.current) {
      gsap.fromTo(
        creditsRef.current,
        { textContent: "0" },
        {
          textContent: dashboardData.credits,
          duration: 1.5,
          snap: { textContent: 1 },
          ease: "power2.out",
        }
      );
    }
  }, [dashboardData.credits]);

  // Animate houses counter
  useEffect(() => {
    if (housesRef.current) {
      gsap.fromTo(
        housesRef.current,
        { textContent: "0" },
        {
          textContent: dashboardData.housesCovered,
          duration: 1.5,
          snap: { textContent: 1 },
          ease: "power2.out",
        }
      );
    }
  }, [dashboardData.housesCovered]);

  // Animate cards on mount
  useEffect(() => {
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.querySelectorAll(".stat-card"),
        { opacity: 0, y: 50, rotationX: 90, z: -200 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          z: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          transformPerspective: 1000,
        }
      );
    }
  }, []);

  // Start GPS tracking
  const startGpsTracking = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          await fetch("/api/trpc/worker.updateGpsLocation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
              accuracy,
              routeId: dashboardData.assignedRoute?.id,
            }),
          });
        } catch (error) {
          console.error("Failed to update GPS:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-g100 to-cream overflow-hidden">
      {/* Particle background */}
      <div
        ref={particleRef}
        className="fixed inset-0 opacity-20 pointer-events-none"
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-g300/20">
        <div className="container py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gradient-eco">EcoCred</h1>
            <p className="text-text-mid">Welcome, {user?.name}</p>
          </div>
          <Button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 rounded-lg font-semibold text-white transition-all hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-24 relative z-10">
        {/* Stats Section */}
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Credits Card */}
          <div
            ref={creditsRef}
            className="stat-card bg-white rounded-3xl p-8"
            style={{
              border: "1px solid rgba(82, 183, 136, 0.1)",
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-mid font-semibold">Total Credits</h3>
              <Zap className="w-5 h-5 text-g500" />
            </div>
            <div className="text-5xl font-serif font-bold text-gradient-eco">
              0
            </div>
            <p className="text-text-light text-sm mt-2">Earned this month</p>
          </div>

          {/* Houses Card */}
          <div
            ref={housesRef}
            className="stat-card bg-white rounded-3xl p-8"
            style={{
              border: "1px solid rgba(82, 183, 136, 0.1)",
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-mid font-semibold">Houses Covered</h3>
              <MapPin className="w-5 h-5 text-g500" />
            </div>
            <div className="text-5xl font-serif font-bold text-gradient-eco">
              0
            </div>
            <p className="text-text-light text-sm mt-2">Total completed</p>
          </div>

          {/* Leaderboard Position Card */}
          <div
            className="stat-card bg-white rounded-3xl p-8"
            style={{
              border: "1px solid rgba(82, 183, 136, 0.1)",
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-mid font-semibold">Rank</h3>
              <TrendingUp className="w-5 h-5 text-g500" />
            </div>
            <div className="text-5xl font-serif font-bold text-gradient-eco">
              #{dashboardData.leaderboardPosition || "--"}
            </div>
            <p className="text-text-light text-sm mt-2">On leaderboard</p>
          </div>

          {/* GPS Status Card */}
          <div
            className="stat-card bg-white rounded-3xl p-8"
            style={{
              border: "1px solid rgba(82, 183, 136, 0.1)",
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-mid font-semibold">GPS Status</h3>
              <div
                className={`w-3 h-3 rounded-full ${isTracking ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
              />
            </div>
            <div className="text-2xl font-serif font-bold text-text-dark">
              {isTracking ? "Active" : "Inactive"}
            </div>
            <p className="text-text-light text-sm mt-2">Real-time tracking</p>
          </div>
        </div>

        {/* Assigned Route Section */}
        {dashboardData.assignedRoute && (
          <div
            className="bg-white rounded-3xl p-8 mb-12"
            style={{
              border: "1px solid rgba(82, 183, 136, 0.1)",
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
            }}
          >
            <h2 className="text-2xl font-serif font-bold text-text-dark mb-6">
              Assigned Route
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-text-dark mb-2">
                  {dashboardData.assignedRoute.name}
                </h3>
                <p className="text-text-mid mb-4">
                  Zone: <span className="font-semibold">{dashboardData.assignedRoute.zone}</span>
                </p>
                <p className="text-text-mid mb-6">
                  Status:{" "}
                  <span
                    className="font-semibold px-3 py-1 rounded-full text-sm"
                    style={{
                      background: "rgba(82, 183, 136, 0.1)",
                      color: "#2d6a4f",
                    }}
                  >
                    {dashboardData.assignedRoute.status}
                  </span>
                </p>
                <Button
                  onClick={startGpsTracking}
                  disabled={isTracking}
                  className="px-6 py-2 rounded-lg font-semibold text-white transition-all hover:shadow-xl"
                  style={{
                    background: isTracking
                      ? "#95d5b2"
                      : "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                    boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
                  }}
                >
                  {isTracking ? "Tracking Active" : "Start Tracking"}
                </Button>
              </div>
              <div>
                <h4 className="font-semibold text-text-dark mb-4">Houses in Route</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dashboardData.assignedRoute.houses?.map((house: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-g100 rounded-lg border border-g300/30 hover:shadow-md transition-all"
                    >
                      <p className="font-semibold text-text-dark text-sm">{house.address}</p>
                      <p className="text-text-light text-xs">
                        {house.completed ? "✓ Completed" : "Pending"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => (window.location.href = "/worker/rewards")}
            className="bg-white rounded-3xl p-8 hover:shadow-lg transition-all text-left transform hover:scale-105 hover:-translate-y-1"
            style={{
              border: "1px solid rgba(82, 183, 136, 0.1)",
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
            }}
          >
            <Award className="w-8 h-8 text-g500 mb-4" />
            <h3 className="text-lg font-semibold text-text-dark">View Rewards</h3>
            <p className="text-text-mid text-sm mt-2">Redeem your earned credits</p>
          </button>

          <button
            onClick={() => (window.location.href = "/worker/routes")}
            className="bg-white rounded-3xl p-8 hover:shadow-lg transition-all text-left transform hover:scale-105 hover:-translate-y-1"
            style={{
              border: "1px solid rgba(82, 183, 136, 0.1)",
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
            }}
          >
            <Navigation className="w-8 h-8 text-g500 mb-4" />
            <h3 className="text-lg font-semibold text-text-dark">My Routes</h3>
            <p className="text-text-mid text-sm mt-2">View all assigned routes</p>
          </button>

          <button
            onClick={() => (window.location.href = "/leaderboard")}
            className="bg-white rounded-3xl p-8 hover:shadow-lg transition-all text-left transform hover:scale-105 hover:-translate-y-1"
            style={{
              border: "1px solid rgba(82, 183, 136, 0.1)",
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
            }}
          >
            <TrendingUp className="w-8 h-8 text-g500 mb-4" />
            <h3 className="text-lg font-semibold text-text-dark">Leaderboard</h3>
            <p className="text-text-mid text-sm mt-2">See how you rank</p>
          </button>
        </div>
      </main>
    </div>
  );
}
