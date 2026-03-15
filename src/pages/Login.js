import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, TrendingUp, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to dashboard
  if (user) {
      return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-text-primary bg-background overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary-hover/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 relative z-10">
         <div className="mb-12 flex items-center gap-4">
             <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-3xl font-bold text-white tracking-widest">HL</span>
             </div>
             <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">HomeLedger</h1>
         </div>
         
         <div className="space-y-8">
             <h2 className="text-5xl font-bold leading-tight">Take Control of<br/><span className="text-primary">Your Finances</span></h2>
             <p className="text-text-secondary text-lg max-w-md">Track expenses, manage budgets, and gain insights into your spending habits with a premium experience.</p>
             
             <div className="space-y-6 pt-8">
                 <div className="flex items-center gap-4 text-text-secondary">
                     <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center">
                         <TrendingUp className="w-6 h-6 text-primary" />
                     </div>
                     <span>Real-time spending analytics</span>
                 </div>
                 <div className="flex items-center gap-4 text-text-secondary">
                     <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center">
                         <ShieldCheck className="w-6 h-6 text-success" />
                     </div>
                     <span>Secure cloud data sync</span>
                 </div>
             </div>
         </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8 card backdrop-blur-3xl bg-surface/80">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                <p className="text-text-secondary text-sm">
                    {isLogin ? 'Enter your details to access your account' : 'Sign up to start tracking your expenses'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-danger/10 border border-danger/20 text-danger text-sm p-4 rounded-lg">
                        {error}
                    </div>
                )}
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                <Mail className="w-5 h-5" />
                            </span>
                            <input 
                                type="email" 
                                required
                                className="input pl-12" 
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-text-secondary">Password</label>
                            {isLogin && <button type="button" className="text-sm text-primary hover:text-primary-hover transition-colors">Forgot password?</button>}
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                <Lock className="w-5 h-5" />
                            </span>
                            <input 
                                type="password" 
                                required
                                className="input pl-12" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full py-3 relative overflow-hidden group"
                >
                    <span className={`transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </span>
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    )}
                </button>
            </form>

            <div className="text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-text-secondary hover:text-white transition-colors text-sm"
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
