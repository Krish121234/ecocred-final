import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import gsap from "gsap";
import {
  useCard3DFlip,
  useTextReveal,
  useAmbientLighting,
  useParticleSystem,
} from "@/hooks/useAdvancedAnimations";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = (path: string) => {
    window.location.href = path;
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);

  // Apply animations
  useCard3DFlip(cardRef as React.RefObject<HTMLElement>);
  useTextReveal(titleRef as React.RefObject<HTMLElement>);
  useAmbientLighting(cardRef as React.RefObject<HTMLElement>);
  useParticleSystem(particleRef as React.RefObject<HTMLElement>);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/trpc/auth.register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const result = await response.json();

      if (result.result?.data?.success) {
        setSuccess(true);
        gsap.to(cardRef.current, {
          opacity: 0,
          y: 50,
          rotationY: 90,
          duration: 0.6,
          ease: "back.in",
          onComplete: () => {
            navigate("/login");
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-g100 to-cream flex items-center justify-center px-4 overflow-hidden">
      {/* Particle background */}
      <div
        ref={particleRef}
        className="fixed inset-0 opacity-20 pointer-events-none"
      />

      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl"
          style={{
            background: "linear-gradient(135deg, #52b788 0%, #2d6a4f 100%)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            ref={titleRef}
            className="text-5xl font-serif font-bold mb-3"
            style={{
              background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Join EcoCred
          </h1>
          <p className="text-text-mid text-lg">Create your worker account</p>
        </div>

        {/* Glassmorphism Card */}
        <div
          ref={cardRef}
          className="bg-white rounded-3xl p-8"
          style={{
            border: "1px solid rgba(82, 183, 136, 0.1)",
            boxShadow: "0 8px 32px rgba(45, 106, 79, 0.10)",
            transformStyle: "preserve-3d",
            backdropFilter: "blur(10px)",
          }}
        >
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-g500 mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold text-text-dark mb-2">
                Account Created!
              </h2>
              <p className="text-text-mid mb-6">
                Your account has been successfully created. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Input */}
              <div className="group">
                <label htmlFor="name" className="block text-sm font-semibold text-text-dark mb-3">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name")}
                  className="w-full px-4 py-3 border-2 border-g300 rounded-lg focus:border-g500 focus:outline-none transition-all"
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                  }}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 animate-pulse">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Phone Input */}
              <div className="group">
                <label htmlFor="phone" className="block text-sm font-semibold text-text-dark mb-3">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  {...register("phone")}
                  className="w-full px-4 py-3 border-2 border-g300 rounded-lg focus:border-g500 focus:outline-none transition-all"
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                  }}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-2 animate-pulse">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-text-dark mb-3">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    {...register("password")}
                    className="w-full px-4 py-3 border-2 border-g300 rounded-lg focus:border-g500 focus:outline-none transition-all pr-12"
                    style={{
                      background: "rgba(255, 255, 255, 0.8)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-mid hover:text-g700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2 animate-pulse">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-dark mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                    className="w-full px-4 py-3 border-2 border-g300 rounded-lg focus:border-g500 focus:outline-none transition-all pr-12"
                    style={{
                      background: "rgba(255, 255, 255, 0.8)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-mid hover:text-g700 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2 animate-pulse">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="p-4 rounded-lg text-sm animate-pulse"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#dc2626",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 text-white rounded-lg font-semibold transition-all py-3 hover:shadow-xl hover:scale-105"
                style={{
                  background: isLoading
                    ? "#d0d0d0"
                    : "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                  boxShadow: "0 8px 32px rgba(45, 106, 79, 0.15)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-g300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-text-mid">Or</span>
                </div>
              </div>

              {/* Login Link */}
              <p className="text-center text-text-mid">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold transition-all hover:scale-105"
                  style={{ color: "#2d6a4f", background: "none", border: "none", cursor: "pointer" }}
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-text-light text-sm mt-8">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
