import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login, initDefaults, isLoggedIn } from "@/lib/store";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LoginPage() {
  initDefaults();
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isLoggedIn()) return <Navigate to="/dashboard" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !pass.trim()) { setError("Please fill all fields"); return; }
    setLoading(true);
    setTimeout(() => {
      if (login(user, pass, remember)) {
        navigate('/dashboard');
      } else {
        setError("Invalid username or password");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-primary/10 blur-[80px] -top-20 -left-20" />
        <div className="absolute w-80 h-80 rounded-full bg-accent/10 blur-[80px] bottom-10 right-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-[400px] bg-secondary border border-border rounded-2xl p-9 relative z-10 ${shake ? 'animate-[shake_0.5s_ease]' : ''}`}
      >
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center font-display font-extrabold text-xl text-primary-foreground mx-auto mb-3">
            RV
          </div>
          <h1 className="text-2xl font-display font-extrabold text-foreground mb-1">Welcome Back</h1>
          <p className="text-[13px] text-muted-foreground">Sign in to ResumeVault Admin</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Username</label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="Enter username"
              className="w-full py-2.5 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_hsl(var(--accent-dim))] transition-all placeholder:text-muted-foreground"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="Enter password"
                className="w-full py-2.5 px-3 pr-10 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_hsl(var(--accent-dim))] transition-all placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <label className="flex items-center gap-2 cursor-pointer text-[13px] text-muted-foreground">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-primary" />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-md text-[14.5px] font-medium cursor-pointer hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {error && (
            <div className="mt-3.5 bg-red-dim border border-destructive/20 rounded-md py-2.5 px-3 text-[13px] text-destructive">
              {error}
            </div>
          )}
        </form>

        <p className="text-center text-[11px] text-muted-foreground mt-5">
          Default: admin / Admin@123
        </p>
      </motion.div>
    </div>
  );
}
