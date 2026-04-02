import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { branches } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager',
    branchId: branches[0].id,
  });

  const update = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleNext = () => {
    setRegisterError('');
    if (!form.name || !form.email || !form.password) return;
    setStep(2);
  };

  const handleRegister = async () => {
    setRegisterError('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      branchId: form.role === 'manager' ? form.branchId : undefined,
    });
    if (!result.success) {
      setIsLoading(false);
      setRegisterError(result.error ?? 'Unable to create account.');
      return;
    }
    setRegistered(true);
    await new Promise(r => setTimeout(r, 1500));
    navigate('/login');
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Account Created!</h2>
          <p className="text-zinc-400">Redirecting you to the platform...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Back button */}
        <button
          onClick={() => step === 1 ? navigate('/') : setStep(1)}
          className="mb-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← {step === 1 ? 'Back to home' : 'Back'}
        </button>

        {/* Logo */}
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
          <p className="text-zinc-500 mt-2 text-sm tracking-widest uppercase">Create Account</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
          <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
        </div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl"
        >
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-semibold mb-1">Create your account</h2>
              <p className="text-zinc-500 text-sm mb-8">Step 1 of 2 — Your details</p>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={update('name')}
                    placeholder="Alex Rivera"
                    className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="alex@yourcompany.com"
                    className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={update('password')}
                      placeholder="Min. 8 characters"
                      className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!form.name || !form.email || !form.password}
                className="mt-8 w-full py-4 bg-white hover:bg-zinc-100 text-black font-bold rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </motion.button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-1">Configure access</h2>
              <p className="text-zinc-500 text-sm mb-8">Step 2 of 2 — Your role</p>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 block">Role</label>
                  <div className="flex gap-2 bg-zinc-800/80 rounded-2xl p-1.5">
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, role: 'admin' }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                        form.role === 'admin' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Platform Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, role: 'manager' }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                        form.role === 'manager' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Branch Manager
                    </button>
                  </div>
                </div>

                {form.role === 'manager' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Assigned Branch</label>
                    <select
                      value={form.branchId}
                      onChange={update('branchId')}
                      className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name} — {b.location}</option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </div>

              {registerError && (
                <div className="mt-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                  {registerError}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}
                disabled={isLoading}
                className="mt-8 w-full py-4 bg-white hover:bg-zinc-100 text-black font-bold rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account & Enter Platform'
                )}
              </motion.button>
            </>
          )}
        </motion.div>

        {/* Login link */}
        <p className="text-center mt-6 text-sm text-zinc-500">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
