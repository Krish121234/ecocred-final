import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { Gift, Check, Lock } from "lucide-react";
import { useCard3DFlip, useAmbientLighting, useParticleSystem, useNumberCounter } from "@/hooks/useAdvancedAnimations";

interface Reward {
  id: number;
  name: string;
  description: string;
  creditsRequired: number;
  icon: string;
}

interface UserReward {
  rewardId: number;
  redeemedAt: string;
}

export default function RewardsCatalog() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const [redeemedRewards, setRedeemedRewards] = useState<UserReward[]>([]);
  const [isRedeeming, setIsRedeeming] = useState<number | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);
  const creditsRef = useRef<HTMLParagraphElement>(null);

  // Apply animations
  useAmbientLighting(cardsRef as React.RefObject<HTMLElement>);
  useCard3DFlip(infoRef as React.RefObject<HTMLElement>);
  useParticleSystem(particleRef as React.RefObject<HTMLElement>);
  useNumberCounter(creditsRef as React.RefObject<HTMLElement>, userCredits);

  // Fetch rewards and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rewardsRes, dashboardRes] = await Promise.all([
          fetch("/api/trpc/worker.getRewardsCatalog"),
          fetch("/api/trpc/worker.getDashboard"),
        ]);

        if (rewardsRes.ok) {
          const result = await rewardsRes.json();
          setRewards(result.result?.data || []);
        }

        if (dashboardRes.ok) {
          const result = await dashboardRes.json();
          setUserCredits(result.result?.data?.credits || 0);
          setRedeemedRewards(result.result?.data?.redeemedRewards || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // Animate reward cards with 3D effects
  useEffect(() => {
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.querySelectorAll(".reward-card"),
        { opacity: 0, y: 30, rotationY: -90, z: -100 },
        {
          opacity: 1,
          y: 0,
          rotationY: 0,
          z: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "back.out",
        }
      );
    }
  }, [rewards]);

  const handleRedeem = async (rewardId: number, creditsRequired: number) => {
    if (userCredits < creditsRequired) {
      alert("Insufficient credits");
      return;
    }

    setIsRedeeming(rewardId);

    try {
      const response = await fetch("/api/trpc/worker.redeemReward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });

      if (response.ok) {
        setUserCredits(userCredits - creditsRequired);
        setRedeemedRewards([
          ...redeemedRewards,
          { rewardId, redeemedAt: new Date().toISOString() },
        ]);
      }
    } catch (error) {
      console.error("Failed to redeem reward:", error);
    } finally {
      setIsRedeeming(null);
    }
  };

  const isRedeemed = (rewardId: number) => {
    return redeemedRewards.some((r) => r.rewardId === rewardId);
  };

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
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-g700" />
            <div>
              <h1 className="text-3xl font-serif font-bold" style={{
                background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Rewards Catalog</h1>
              <p className="text-text-mid">Redeem your earned credits</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-light">Your Credits</p>
            <p
              ref={creditsRef}
              className="text-3xl font-serif font-bold"
              style={{
                background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {userCredits}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12 relative z-10">
        {/* Rewards Grid */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {rewards.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-text-mid text-lg">No rewards available yet</p>
            </div>
          ) : (
            rewards.map((reward) => {
              const canRedeem = userCredits >= reward.creditsRequired;
              const redeemed = isRedeemed(reward.id);

              return (
                <div
                  key={reward.id}
                  className="reward-card bg-white rounded-3xl p-8 border border-g300/10 transition-all transform hover:scale-105 hover:shadow-2xl"
                  style={{
                    border: "1px solid rgba(82, 183, 136, 0.1)",
                    boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
                    opacity: redeemed ? 0.7 : 1,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Reward Icon */}
                  <div className="text-6xl mb-6 transform transition-transform hover:scale-125 hover:rotate-12">
                    {reward.icon}
                  </div>

                  {/* Reward Info */}
                  <h3 className="text-xl font-semibold text-text-dark mb-2">{reward.name}</h3>
                  <p className="text-text-mid text-sm mb-6">{reward.description}</p>

                  {/* Credits Required */}
                  <div
                    className="mb-6 p-4 rounded-lg transition-all transform hover:scale-105"
                    style={{
                      background: "rgba(82, 183, 136, 0.08)",
                      border: "1px solid rgba(82, 183, 136, 0.2)",
                    }}
                  >
                    <p className="text-text-light text-sm mb-1">Credits Required</p>
                    <p className="text-2xl font-serif font-bold" style={{
                      background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      {reward.creditsRequired}
                    </p>
                  </div>

                  {/* Redeem Button */}
                  {redeemed ? (
                    <Button
                      disabled
                      className="w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 hover:shadow-lg"
                      style={{
                        background: "#95d5b2",
                      }}
                    >
                      <Check className="w-4 h-4" />
                      Redeemed
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRedeem(reward.id, reward.creditsRequired)}
                      disabled={!canRedeem || isRedeeming === reward.id}
                      className="w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-xl"
                      style={{
                        background: canRedeem
                          ? "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)"
                          : "#d0d0d0",
                        boxShadow: canRedeem ? "0 8px 32px rgba(45, 106, 79, 0.15)" : "none",
                      }}
                    >
                      {isRedeeming === reward.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Redeeming...
                        </>
                      ) : !canRedeem ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Insufficient Credits
                        </>
                      ) : (
                        "Redeem Now"
                      )}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Info Section */}
        <div
          ref={infoRef}
          className="mt-16 bg-white rounded-3xl p-8 transition-all transform hover:scale-102 hover:shadow-2xl"
          style={{
            border: "1px solid rgba(82, 183, 136, 0.1)",
            boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
            transformStyle: "preserve-3d",
          }}
        >
          <h2 className="text-2xl font-serif font-bold text-text-dark mb-8">How to Earn Credits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-2xl transition-all transform hover:scale-110 hover:shadow-lg" style={{
              background: "rgba(82, 183, 136, 0.05)",
              border: "1px solid rgba(82, 183, 136, 0.1)",
            }}>
              <p className="text-4xl font-serif font-bold mb-3" style={{
                background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>10</p>
              <p className="text-text-mid">Credits per house completed</p>
            </div>
            <div className="text-center p-6 rounded-2xl transition-all transform hover:scale-110 hover:shadow-lg" style={{
              background: "rgba(82, 183, 136, 0.05)",
              border: "1px solid rgba(82, 183, 136, 0.1)",
            }}>
              <p className="text-4xl font-serif font-bold mb-3" style={{
                background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>5x</p>
              <p className="text-text-mid">Bonus multiplier on weekends</p>
            </div>
            <div className="text-center p-6 rounded-2xl transition-all transform hover:scale-110 hover:shadow-lg" style={{
              background: "rgba(82, 183, 136, 0.05)",
              border: "1px solid rgba(82, 183, 136, 0.1)",
            }}>
              <p className="text-4xl font-serif font-bold mb-3" style={{
                background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>∞</p>
              <p className="text-text-mid">Unlimited earning potential</p>
            </div>
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
