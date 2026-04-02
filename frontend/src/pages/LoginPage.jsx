import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Brain, Shield, BarChart3 } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        await login(email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered. Please sign in.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Failed to authenticate. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: Brain, title: 'AI-Powered Scoring', desc: 'Advanced Gemini models analyze grammar, coherence, and originality' },
    { icon: Shield, title: 'Plagiarism Detection', desc: 'Cross-reference submissions with MinHash LSH fingerprinting' },
    { icon: BarChart3, title: 'Detailed Analytics', desc: 'Rubric-based breakdown with actionable feedback for students' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand + Features */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-950 via-primary-950 to-violet-950">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-float" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-500 to-violet-600 p-2 rounded-xl shadow-glow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 tracking-tight">
              EduScore AI
            </span>
          </div>

          {/* Hero Text */}
          <div className="max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Intelligent Essay
              <br />
              <span className="text-gradient">Scoring System</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-10">
              Automated evaluation powered by AI. Get instant, rubric-based feedback with grammar analysis, plagiarism detection, and coherence scoring.
            </p>

            {/* Feature Cards */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm animate-slide-up"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500/20 to-violet-500/20 text-primary-400 shrink-0">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-0.5">{f.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-600">
            © 2026 EduScore AI · Built with Gemini, FastAPI & React
          </p>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 bg-surface-50 relative">
        {/* Subtle background decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />

        <div className="w-full max-w-[400px] mx-auto relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-gradient-to-br from-primary-500 to-violet-600 p-1.5 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">EduScore AI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isRegistering ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {isRegistering ? 'Start evaluating essays with AI-powered insights' : 'Sign in to access your dashboard'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 text-sm transition-all duration-200 bg-white"
                placeholder="student@university.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 text-sm transition-all duration-200 bg-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 p-3 animate-fade-in">
                <div className="w-1 h-full rounded-full bg-red-400 shrink-0 self-stretch" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-glow-sm"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  {isRegistering ? 'Create Account' : 'Sign in'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-surface-50 text-gray-400 font-medium">or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Create one'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;