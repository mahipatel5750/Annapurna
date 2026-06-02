import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Utensils, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginPage() {
  const { loginWithGoogle, loginWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google login failed:", error);
      setError("Failed to sign in with Google.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please provide an email and password.');
      return;
    }

    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      console.error("Authentication failed:", err);
      // Simplify Firebase error messages
      const msg = err.message || "An error occurred.";
      if (msg.includes('operation-not-allowed')) {
        setError('Email/Password sign-in is not enabled. Please enable it in your Firebase Console > Authentication > Sign-in method.');
      } else if (msg.includes('invalid-credential') || msg.includes('user-not-found') || msg.includes('wrong-password')) {
        setError('Invalid email or password.');
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Left side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 border-r border-stone-200 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Delicious Indian food" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent" />
        </div>
        
        <div className="relative z-10 p-12 flex flex-col h-full justify-between w-full">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 text-white transition-opacity hover:opacity-80">
              <div className="bg-red-600 p-2.5 rounded-xl shadow-lg border border-red-500/50">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight font-serif">Annapurna</span>
            </Link>
          </div>

          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold font-serif text-white mb-6 leading-tight">
                Fresh, home-cooked <span className="text-red-400">meals</span> delivered daily.
              </h1>
              <p className="text-stone-300 text-lg leading-relaxed">
                Experience the authentic taste of home with our carefully curated tiffin service. Authentic recipes, premium ingredients, and love in every bite.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-32 relative">
        <Link to="/" className="absolute top-8 left-8 lg:hidden items-center gap-2 text-stone-900 inline-flex">
          <div className="bg-red-600 p-2 rounded-lg shadow-sm">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-serif">Annapurna</span>
        </Link>

        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-stone-900 font-serif tracking-tight">
              Welcome back
            </h2>
            <p className="mt-3 text-stone-500 text-sm">
              Enter your details to access your account.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-stone-200 rounded-xl shadow-sm bg-white text-stone-700 hover:bg-stone-50 font-medium transition-all transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-stone-400 font-medium tracking-wide text-xs uppercase">Or continue with email</span>
              </div>
            </div>

            <div className="mt-8">
              <form className="space-y-5" onSubmit={handleEmailAuth}>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-3">
                    <div className="flex-1">{error}</div>
                  </motion.div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5" htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-stone-200 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow sm:text-sm bg-stone-50 focus:bg-white"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5" htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-stone-200 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow sm:text-sm bg-stone-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:-translate-y-0.5 mt-2"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
            
            <div className="mt-10 text-center text-sm">
              <span className="text-stone-500">
                Don't have an account?
              </span>
              <Link to="/signup" className="ml-2 font-bold text-red-600 hover:text-red-700 hover:underline transition-all">
                Sign up for free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

