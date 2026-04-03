import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLogin = async () => {
    setValidationError('');
    setAuthError('');

    if (!email.trim()) {
      setValidationError('Email is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      setValidationError('Password is required.');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const result = await login(email, password, role);
    setIsLoading(false);

    if (!result.success) {
      setAuthError(result.error ?? 'Unable to sign in.');
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← Back to home
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-[-3px] text-white">
            STOCK<span className="text-indigo-400">SPHERE</span>
          </h1>
          <p className="text-zinc-500 mt-2 text-sm tracking-widest uppercase">Enterprise Platform</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl"
        >
          <h2 className="text-2xl font-semibold mb-1">Welcome back</h2>
          <p className="text-zinc-500 text-sm mb-8">Authenticate to access the StockSphere platform</p>

          <div className="space-y-5 mb-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@stocksphere.com"
                className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 block">Access Level</label>
            <div className="flex gap-2 bg-zinc-800/80 rounded-2xl p-1.5">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  role === 'admin'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Platform Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('manager')}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  role === 'manager'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Branch Manager
              </button>
            </div>
          </div>

          {validationError && (
            <div className="mb-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              {validationError}
            </div>
          )}

          {authError && (
            <div className="mb-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              {authError}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-4 bg-white hover:bg-zinc-100 text-black font-bold rounded-2xl flex items-center justify-center gap-2 text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                Sign In
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Demo credentials: use an existing StockSphere email and password <span className="text-zinc-300">Nexus@123</span>
          </p>
        </motion.div>

        <p className="text-center mt-6 text-sm text-zinc-500">
          Need an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Create one here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

