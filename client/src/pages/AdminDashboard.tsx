import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { Users, MapPin, Route, TrendingUp } from "lucide-react";
import { useCard3DFlip, useAmbientLighting, useParticleSystem } from "@/hooks/useAdvancedAnimations";

interface Worker {
  id: number;
  name: string;
  phone: string;
  credits: number;
  housesCovered: number;
  isActive: boolean;
}

interface GpsLocation {
  workerId: number;
  lat: number;
  lng: number;
  workerName: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [gpsLocations, setGpsLocations] = useState<GpsLocation[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const workersRef = useRef<HTMLDivElement>(null);
  const trackingRef = useRef<HTMLDivElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);

  // Apply animations
  useAmbientLighting(statsRef as React.RefObject<HTMLElement>);
  useCard3DFlip(workersRef as React.RefObject<HTMLElement>);
  useCard3DFlip(trackingRef as React.RefObject<HTMLElement>);
  useParticleSystem(particleRef as React.RefObject<HTMLElement>);

  // Fetch workers
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch("/api/trpc/admin.getWorkers");
        if (response.ok) {
          const result = await response.json();
          setWorkers(result.result?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch workers:", error);
      }
    };

    fetchWorkers();
  }, []);

  // Fetch GPS locations every 5 seconds
  useEffect(() => {
    const fetchGpsLocations = async () => {
      try {
        const response = await fetch("/api/trpc/admin.getLiveGpsLocations");
        if (response.ok) {
          const result = await response.json();
          setGpsLocations(result.result?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch GPS locations:", error);
      }
    };

    fetchGpsLocations();
    const interval = setInterval(fetchGpsLocations, 5000);

    return () => clearInterval(interval);
  }, []);

  // Animate stats on mount with 3D effects
  useEffect(() => {
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.querySelectorAll(".stat-box"),
        { opacity: 0, y: 30, rotationX: -90, z: -100 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          z: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "back.out",
        }
      );
    }
  }, []);

  const activeWorkers = workers.filter((w) => w.isActive).length;
  const totalCredits = workers.reduce((sum, w) => sum + w.credits, 0);
  const totalHouses = workers.reduce((sum, w) => sum + w.housesCovered, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-g100 to-cream overflow-hidden">
      {/* Particle background */}
      <div
        ref={particleRef}
        className="fixed inset-0 opacity-20 pointer-events-none"
      />

      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute top-32 right-32 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "linear-gradient(135deg, #52b788 0%, #2d6a4f 100%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-32 left-32 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-white/80 border-b border-g300/20 sticky top-0 z-40 backdrop-blur-md">
        <div className="container py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold" style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>EcoCred Admin</h1>
            <p className="text-text-mid">Dashboard & Management</p>
          </div>
          <Button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 rounded-lg font-semibold text-white transition-all transform hover:scale-105 hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12 relative z-10">
        {/* Stats Section */}
        <div ref={statsRef} className="grid md:grid-cols-4 gap-6 mb-12">
          <div
            className="stat-box bg-white rounded-3xl p-8 border border-g300/10 transition-all transform hover:scale-105 hover:shadow-2xl"
            style={{
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-mid font-semibold">Total Workers</h3>
              <Users className="w-5 h-5 text-g500" />
            </div>
            <div className="text-5xl font-serif font-bold" style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>{workers.length}</div>
            <p className="text-text-light text-sm mt-2">{activeWorkers} active</p>
          </div>

          <div
            className="stat-box bg-white rounded-3xl p-8 border border-g300/10 transition-all transform hover:scale-105 hover:shadow-2xl"
            style={{
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-mid font-semibold">Total Credits</h3>
              <TrendingUp className="w-5 h-5 text-g500" />
            </div>
            <div className="text-5xl font-serif font-bold" style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>{totalCredits}</div>
            <p className="text-text-light text-sm mt-2">Distributed</p>
          </div>

          <div
            className="stat-box bg-white rounded-3xl p-8 border border-g300/10 transition-all transform hover:scale-105 hover:shadow-2xl"
            style={{
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-mid font-semibold">Houses Covered</h3>
              <MapPin className="w-5 h-5 text-g500" />
            </div>
            <div className="text-5xl font-serif font-bold" style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>{totalHouses}</div>
            <p className="text-text-light text-sm mt-2">Total completed</p>
          </div>

          <div
            className="stat-box bg-white rounded-3xl p-8 border border-g300/10 transition-all transform hover:scale-105 hover:shadow-2xl"
            style={{
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-mid font-semibold">Live Tracking</h3>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="text-5xl font-serif font-bold" style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {gpsLocations.length}
            </div>
            <p className="text-text-light text-sm mt-2">Workers online</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Workers List */}
          <div
            ref={workersRef}
            className="lg:col-span-2 bg-white rounded-3xl p-8 border border-g300/10 transition-all transform hover:scale-102 hover:shadow-2xl"
            style={{
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
              transformStyle: "preserve-3d",
            }}
          >
            <h2 className="text-2xl font-serif font-bold text-text-dark mb-6">Workers</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {workers.length === 0 ? (
                <p className="text-text-mid text-center py-8">No workers found</p>
              ) : (
                workers.map((worker) => (
                  <div
                    key={worker.id}
                    onClick={() => setSelectedWorker(worker)}
                    className="p-4 bg-g100 rounded-lg border border-g300/30 hover:border-g400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-text-dark">{worker.name}</h4>
                        <p className="text-text-light text-sm">{worker.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-g700">{worker.credits} credits</p>
                        <p className="text-text-light text-sm">{worker.housesCovered} houses</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${worker.isActive ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
                      />
                      <span className="text-xs text-text-light">
                        {worker.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* GPS Tracking Map */}
          <div
            ref={trackingRef}
            className="bg-white rounded-3xl p-8 border border-g300/10 transition-all transform hover:scale-102 hover:shadow-2xl"
            style={{
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
              transformStyle: "preserve-3d",
            }}
          >
            <h2 className="text-2xl font-serif font-bold text-text-dark mb-6">Live Tracking</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {gpsLocations.length === 0 ? (
                <p className="text-text-mid text-center py-8">No active workers</p>
              ) : (
                gpsLocations.map((location, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-g100 to-g200 rounded-lg border border-g300/30 transition-all transform hover:scale-105 hover:shadow-lg"
                  >
                    <p className="font-semibold text-text-dark text-sm">{location.workerName}</p>
                    <p className="text-text-light text-xs mt-1">
                      📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                    <p className="text-text-light text-xs mt-1">
                      ⏱️ {new Date(location.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Worker Details */}
        {selectedWorker && (
          <div
            className="mt-8 bg-white rounded-3xl p-8 border border-g300/10 transition-all transform animate-in"
            style={{
              boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
              animation: "fadeInUp 0.5s ease-out",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-text-dark">
                {selectedWorker.name} - Details
              </h2>
              <button
                onClick={() => setSelectedWorker(null)}
                className="text-text-light hover:text-text-dark transition-colors transform hover:scale-125"
              >
                ✕
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-text-light text-sm mb-1">Phone</p>
                <p className="text-lg font-semibold text-text-dark">{selectedWorker.phone}</p>
              </div>
              <div>
                <p className="text-text-light text-sm mb-1">Total Credits</p>
                <p className="text-lg font-semibold text-g700">{selectedWorker.credits}</p>
              </div>
              <div>
                <p className="text-text-light text-sm mb-1">Houses Covered</p>
                <p className="text-lg font-semibold text-g700">{selectedWorker.housesCovered}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <Button
                onClick={() => (window.location.href = `/admin/worker/${selectedWorker.id}/history`)}
                className="px-6 py-2 rounded-lg font-semibold text-white transition-all transform hover:scale-105 hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                }}
              >
                View GPS History
              </Button>
              <Button
                onClick={() => (window.location.href = `/admin/worker/${selectedWorker.id}/assign`)}
                className="px-6 py-2 rounded-lg font-semibold border-2 transition-all transform hover:scale-105 hover:shadow-xl"
                style={{
                  background: "#f8f4e9",
                  color: "#2d6a4f",
                  borderColor: "#95d5b2",
                }}
              >
                Assign Route
              </Button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
