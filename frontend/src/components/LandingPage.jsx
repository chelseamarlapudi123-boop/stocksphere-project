import React from 'react';
import { motion } from 'framer-motion';
import { Package, Shield, TrendingUp, Zap, BarChart3, Globe, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: 'Real-Time Monitoring',
      description: 'Track stock levels across every branch instantly with zero latency dashboards.',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      title: 'Predictive Forecasting',
      description: 'AI-driven demand prediction to optimize reorder cycles before stockouts occur.',
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-400" />,
      title: 'Role-Based Access',
      description: 'Admins see everything. Branch managers see their branch. Secure by design.',
    },
    {
      icon: <Globe className="w-6 h-6 text-cyan-400" />,
      title: 'Multi-Branch Network',
      description: 'Centralized control across unlimited branches with unified analytics.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-violet-400" />,
      title: 'Advanced Analytics',
      description: 'Deep dive into sales trends, inventory value, and performance metrics.',
    },
    {
      icon: <Package className="w-6 h-6 text-rose-400" />,
      title: 'Smart Inventory',
      description: 'Automated low-stock alerts and reorder point management across all locations.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Branches Managed' },
    { value: '₹2.4B', label: 'Inventory Value Tracked' },
    { value: '99.9%', label: 'System Uptime' },
    { value: '24/7', label: 'Real-Time Sync' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Navbar */}
      <nav className="h-20 border-b border-white/5 flex items-center px-8 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-xl tracking-tighter">STOCKSPHERE</div>
              <div className="text-[9px] text-cyan-400/70 tracking-[2px] -mt-1">ENTERPRISE PLATFORM</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-24 px-8 relative">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Enterprise Inventory Intelligence v2.4
            </span>

            <h1 className="text-7xl md:text-8xl font-bold tracking-[-4px] leading-[0.9] mb-8">
              <span className="bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent">
                Control Every Branch.
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                In Real Time.
              </span>
            </h1>

            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              The next-generation inventory management platform for multi-branch enterprises.
              Real-time sync, AI forecasting, and seamless control - in one beautiful interface.
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-10 py-5 bg-white text-black rounded-2xl text-lg font-bold hover:bg-zinc-100 transition-all shadow-2xl"
              >
                Start Free Trial
                <ChevronRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-10 py-5 bg-zinc-900 text-white border border-white/10 rounded-2xl text-lg font-semibold hover:bg-zinc-800 transition-all"
              >
                Sign In to Platform
              </motion.button>
            </div>

            <div className="mt-10 flex justify-center gap-6 text-sm text-zinc-500">
              {['No credit card required', 'Free 30-day trial', 'Cancel anytime'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dashboard Preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-20 mx-auto max-w-5xl"
          >
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/60">
              {/* Fake browser chrome */}
              <div className="h-12 bg-zinc-900 border-b border-white/5 flex items-center px-5 gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 mx-4 bg-zinc-800 rounded-lg h-7 flex items-center px-3">
                  <span className="text-xs text-zinc-500">app.stocksphere.io/dashboard</span>
                </div>
              </div>
              {/* Dashboard grid preview */}
              <div className="p-6 bg-[#0B0F14]">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {[
                    { label: 'TOTAL BRANCHES', value: '4', color: 'indigo' },
                    { label: 'STOCK VALUE', value: '₹18,42,400', color: 'emerald' },
                    { label: 'ACTIVE PRODUCTS', value: '8', color: 'amber' },
                    { label: 'LOW STOCK ALERTS', value: '3', color: 'rose' },
                  ].map((kpi, i) => (
                    <div key={i} className="bg-zinc-900/80 rounded-2xl p-4 border border-white/5">
                      <div className="text-[10px] text-zinc-500 tracking-widest mb-3">{kpi.label}</div>
                      <div className="text-3xl font-semibold tracking-tight">{kpi.value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-zinc-900/80 rounded-2xl p-4 border border-white/5 h-32">
                    <div className="text-[10px] text-zinc-500 mb-3">SALES TREND</div>
                    <div className="flex items-end gap-2 h-16">
                      {[40, 65, 55, 80, 70, 95, 85].map((h, i) => (
                        <div key={i} className="flex-1 bg-indigo-500/30 rounded-sm" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-zinc-900/80 rounded-2xl p-4 border border-white/5 h-32">
                    <div className="text-[10px] text-zinc-500 mb-3">BRANCH HEALTH</div>
                    <div className="space-y-2">
                      {['Downtown', 'Uptown', 'Harbor'].map((b, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">{b}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${i === 2 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {i === 2 ? 'LOW' : 'HEALTHY'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-y border-white/5 bg-gradient-to-r from-indigo-600/10 via-cyan-600/10 to-violet-600/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl font-bold tracking-tighter mb-2 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-zinc-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold tracking-tighter mb-4">Everything you need to run smarter</h2>
            <p className="text-xl text-zinc-400 max-w-xl mx-auto">Built for operations teams who need real-time visibility without the complexity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="bg-zinc-900/60 border border-white/8 rounded-3xl p-8 hover:border-white/20 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 border border-indigo-500/30 rounded-3xl p-16"
          >
            <h2 className="text-5xl font-bold tracking-tighter mb-5">Ready to take control?</h2>
            <p className="text-zinc-400 text-lg mb-10">Join inventory teams already using StockSphere to eliminate stockouts and cut waste.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-10 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-zinc-100 transition-all"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-10 py-4 bg-transparent border border-white/20 text-white rounded-2xl font-semibold text-lg hover:bg-white/5 transition-all"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tighter">STOCKSPHERE</span>
        </div>
        <p className="text-zinc-600 text-sm">© 2025 StockSphere Systems. Enterprise Inventory Intelligence.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

