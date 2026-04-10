import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 10 * 60 * 1000;

export default function AdminLoginPage() {
  const { user, role, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  if (user && role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user && role === "user") {
    return <Navigate to="/dashboard" replace />;
  }

  const isBlocked = blockedUntil && Date.now() < blockedUntil;
  const remainingBlockTime = blockedUntil ? Math.ceil((blockedUntil - Date.now()) / 60000) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) { setError(`Too many attempts. Try again in ${remainingBlockTime} minutes.`); return; }
    if (!email.trim() || !password.trim()) { setError("Please fill all fields"); return; }

    setSubmitting(true);
    setError("");

    const { error: loginError } = await signIn(email, password);
    if (loginError) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setBlockedUntil(Date.now() + BLOCK_DURATION);
        setError("Too many failed attempts. Locked for 10 minutes.");
      } else {
        setError(`Invalid credentials (${MAX_ATTEMPTS - newAttempts} attempts remaining)`);
      }
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    // Role check and redirect happens via AuthContext + route protection
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-destructive/5 blur-[80px] -top-20 -left-20" />
        <div className="absolute w-80 h-80 rounded-full bg-primary/5 blur-[80px] bottom-10 right-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-[400px] bg-secondary border border-border rounded-2xl p-9 relative z-10 ${shake ? 'animate-[shake_0.5s_ease]' : ''}`}
      >
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-gradient-to-br from-destructive/80 to-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-foreground mb-1">Admin Access</h1>
          <p className="text-[13px] text-muted-foreground">Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@company.com"
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
                placeholder="Enter admin password"
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
            {submitting ? 'Authenticating...' : <><Shield className="w-4 h-4" /> Admin Sign In</>}
          </button>

          {error && (
            <div className="mt-3.5 bg-red-dim border border-destructive/20 rounded-md py-2.5 px-3 text-[13px] text-destructive">
              {error}
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
