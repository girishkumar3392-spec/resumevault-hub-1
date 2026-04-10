import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Eye, EyeOff, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 10 * 60 * 1000; // 10 minutes

export default function UserLoginPage() {
  const { user, role, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user && role) {
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  const isBlocked = blockedUntil && Date.now() < blockedUntil;
  const remainingBlockTime = blockedUntil ? Math.ceil((blockedUntil - Date.now()) / 60000) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) { setError(`Too many attempts. Try again in ${remainingBlockTime} minutes.`); return; }
    if (!email.trim() || !password.trim()) { setError("Please fill all fields"); return; }
    if (mode === "signup" && !displayName.trim()) { setError("Please enter your name"); return; }

    setSubmitting(true);
    setError("");

    if (mode === "login") {
      const { error: loginError } = await signIn(email, password);
      if (loginError) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setBlockedUntil(Date.now() + BLOCK_DURATION);
          setError("Too many failed attempts. Account locked for 10 minutes.");
        } else {
          setError(`Invalid email or password (${MAX_ATTEMPTS - newAttempts} attempts remaining)`);
        }
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        setAttempts(0);
        // Navigation handled by auth state change
      }
    } else {
      if (password.length < 6) { setError("Password must be at least 6 characters"); setSubmitting(false); return; }
      const { error: signUpError } = await signUp(email, password, displayName);
      if (signUpError) {
        setError(signUpError);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-primary/10 blur-[80px] -top-20 -left-20" />
        <div className="absolute w-80 h-80 rounded-full bg-accent/10 blur-[80px] bottom-10 right-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-[400px] bg-secondary border border-border rounded-2xl p-9 relative z-10 ${shake ? 'animate-[shake_0.5s_ease]' : ''}`}
      >
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center font-display font-extrabold text-xl text-primary-foreground mx-auto mb-3">
            RV
          </div>
          <h1 className="text-2xl font-display font-extrabold text-foreground mb-1">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {mode === "login" ? "Sign in to ResumeVault" : "Sign up to start uploading resumes"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full py-2.5 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_hsl(var(--accent-dim))] transition-all placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full py-2.5 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_hsl(var(--accent-dim))] transition-all placeholder:text-muted-foreground"
            />
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full py-2.5 px-3 pr-10 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_hsl(var(--accent-dim))] transition-all placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !!isBlocked}
            className="w-full py-3 bg-primary text-primary-foreground rounded-md text-[14.5px] font-medium cursor-pointer hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
            {mode === "login" ? (
              <>{submitting ? 'Signing in...' : <><LogIn className="w-4 h-4" /> Sign In</>}</>
            ) : (
              <>{submitting ? 'Creating account...' : <><UserPlus className="w-4 h-4" /> Sign Up</>}</>
            )}
          </button>

          {error && (
            <div className="mt-3.5 bg-red-dim border border-destructive/20 rounded-md py-2.5 px-3 text-[13px] text-destructive">
              {error}
            </div>
          )}
        </form>

        <p className="text-center text-[13px] text-muted-foreground mt-5">
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }} className="text-primary cursor-pointer hover:underline bg-transparent border-none font-medium">
                Sign Up
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(""); }} className="text-primary cursor-pointer hover:underline bg-transparent border-none font-medium">
                Sign In
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
