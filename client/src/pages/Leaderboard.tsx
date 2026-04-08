import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { Trophy, TrendingUp, Award, Zap } from "lucide-react";
import { useCard3DFlip, useAmbientLighting, useParticleSystem } from "@/hooks/useAdvancedAnimations";

interface LeaderboardEntry {
  id: number;
  name: string;
  credits: number;
  housesCovered: number;
  rank?: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<"credits" | "houses">("credits");
  const containerRef = useRef<HTMLTableSectionElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);

  // Apply animations
  useCard3DFlip(tableRef as React.RefObject<HTMLElement>);
  useAmbientLighting(tableRef as React.RefObject<HTMLElement>);
  useParticleSystem(particleRef as React.RefObject<HTMLElement>);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const endpoint =
          sortBy === "credits" ? "/api/trpc/leaderboard.getByCredits" : "/api/trpc/leaderboard.getByHouses";
        const response = await fetch(endpoint);
        if (response.ok) {
          const result = await response.json();
          const data = (result.result?.data || []).map((entry: any, idx: number) => ({
            ...entry,
            rank: idx + 1,
          }));
          setLeaderboard(data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, [sortBy]);

  // Animate leaderboard entries with 3D effects
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".leaderboard-entry"),
        { opacity: 0, x: -20, rotationY: -90 },
        {
          opacity: 1,
          x: 0,
          rotationY: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "back.out",
        }
      );
    }
  }, [leaderboard]);

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
          className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "linear-gradient(135deg, #52b788 0%, #2d6a4f 100%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-white/80 border-b border-g300/20 sticky top-0 z-40 backdrop-blur-md">
        <div className="container py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-g700" />
            <div>
              <h1 className="text-3xl font-serif font-bold" style={{
                background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Leaderboard</h1>
              <p className="text-text-mid">Top performing workers</p>
            </div>
          </div>
          <Button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
            }}
          >
            Back Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12 relative z-10">
        {/* Sort Options */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setSortBy("credits")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
              sortBy === "credits"
                ? "text-white"
                : "bg-white text-g700 border-2 border-g300"
            }`}
            style={
              sortBy === "credits"
                ? {
                    background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                    boxShadow: "0 8px 32px rgba(45, 106, 79, 0.15)",
                  }
                : {}
            }
          >
            <Zap className="w-4 h-4 inline mr-2" />
            By Credits
          </button>
          <button
            onClick={() => setSortBy("houses")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
              sortBy === "houses"
                ? "text-white"
                : "bg-white text-g700 border-2 border-g300"
            }`}
            style={
              sortBy === "houses"
                ? {
                    background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                    boxShadow: "0 8px 32px rgba(45, 106, 79, 0.15)",
                  }
                : {}
            }
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            By Houses
          </button>
        </div>

        {/* Leaderboard Table */}
        <div
          ref={tableRef}
          className="bg-white rounded-3xl overflow-hidden border border-g300/10"
          style={{
            boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-g700 to-g500 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left font-semibold">Worker Name</th>
                  <th className="px-6 py-4 text-center font-semibold">
                    <Zap className="w-4 h-4 inline mr-2" />
                    Credits
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    <Award className="w-4 h-4 inline mr-2" />
                    Houses
                  </th>
                </tr>
              </thead>
              <tbody ref={containerRef as React.RefObject<HTMLTableSectionElement>}>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text-mid">
                      No workers on leaderboard yet
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => (
                    <tr
                      key={entry.id}
                      className="leaderboard-entry border-b border-g300/20 hover:bg-g100 transition-all transform hover:scale-102"
                      style={{
                        transformStyle: "preserve-3d",
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {entry.rank === 1 && (
                            <span className="text-3xl animate-bounce">🥇</span>
                          )}
                          {entry.rank === 2 && (
                            <span className="text-2xl">🥈</span>
                          )}
                          {entry.rank === 3 && (
                            <span className="text-2xl">🥉</span>
                          )}
                          {entry.rank! > 3 && (
                            <span className="font-bold text-g700 text-lg w-8">
                              #{entry.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text-dark">{entry.name}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-semibold transition-all transform hover:scale-110"
                          style={{
                            background: "rgba(82, 183, 136, 0.1)",
                            color: "#2d6a4f",
                          }}
                        >
                          {entry.credits}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-semibold transition-all transform hover:scale-110"
                          style={{
                            background: "rgba(201, 169, 110, 0.1)",
                            color: "#c9a96e",
                          }}
                        >
                          {entry.housesCovered}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div
            className="bg-white rounded-3xl p-8 border border-g300/10 text-center transition-all transform hover:scale-105 hover:shadow-xl"
            style={{ boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)" }}
          >
            <Trophy className="w-8 h-8 text-g700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-dark mb-2">Top Worker</h3>
            <p className="text-2xl font-serif font-bold" style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {leaderboard[0]?.name || "N/A"}
            </p>
          </div>

          <div
            className="bg-white rounded-3xl p-8 border border-g300/10 text-center transition-all transform hover:scale-105 hover:shadow-xl"
            style={{ boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)" }}
          >
            <Zap className="w-8 h-8 text-g700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-dark mb-2">Total Credits</h3>
            <p className="text-2xl font-serif font-bold" style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {leaderboard.reduce((sum, w) => sum + w.credits, 0)}
            </p>
          </div>

          <div
            className="bg-white rounded-3xl p-8 border border-g300/10 text-center transition-all transform hover:scale-105 hover:shadow-xl"
            style={{ boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)" }}
          >
            <Award className="w-8 h-8 text-g700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-dark mb-2">Total Houses</h3>
            <p className="text-2xl font-serif font-bold" style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {leaderboard.reduce((sum, w) => sum + w.housesCovered, 0)}
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
