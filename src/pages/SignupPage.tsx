import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Utensils, ArrowRight, User, Mail, Phone, Lock, Home } from 'lucide-react';
import { motion } from 'motion/react';

export function SignupPage() {
  const { signupWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || !fullName || !phone) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      // Typically we would also save the additional fields (fullName, phone, address)
      // into a Firestore database as a user document here.
      await signupWithEmail(email, password);
    } catch (err: any) {
      console.error("Signup failed:", err);
      const msg = err.message || "An error occurred.";
      if (msg.includes('operation-not-allowed')) {
        setError('Sign-up method not enabled. Please configure Firebase Authentication.');
      } else if (msg.includes('email-already-in-use')) {
        setError('Email already in use.');
      } else if (msg.includes('weak-password')) {
        setError('Password should be at least 6 characters.');
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden font-sans py-12 flex flex-col justify-center sm:px-6 lg:px-8">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
         <Link to="/" className="flex justify-center items-center gap-3 text-stone-900 group transition-transform hover:scale-105">
            <div className="bg-red-600 p-3 rounded-2xl shadow-lg border border-red-500/30">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold font-serif tracking-tight">Annapurna</span>
          </Link>
          <h2 className="mt-10 text-center text-4xl font-extrabold text-stone-900 font-serif tracking-tight">
            Join our family
          </h2>
          <p className="mt-3 text-center text-stone-500 text-lg">
            Create an account to start your daily tiffin service.
          </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white py-10 px-6 sm:px-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] border border-white/50 ring-1 ring-black/5"
        >
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-3">
                <div className="flex-1 font-medium">{error}</div>
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 gap-y-7 sm:grid-cols-2 sm:gap-x-8">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2" htmlFor="fullName">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-stone-400" />
                  </div>
                  <input id="fullName" type="text" value={fullName} onChange={e=>setFullName(e.target.value)} required 
                     className="pl-12 block w-full px-4 py-3.5 border border-stone-200 rounded-2xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-stone-50/50 hover:bg-stone-50 focus:bg-white transition-all text-stone-900 font-medium" placeholder="E.g. John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2" htmlFor="phone">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-stone-400" />
                  </div>
                  <input id="phone" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} required 
                     className="pl-12 block w-full px-4 py-3.5 border border-stone-200 rounded-2xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-stone-50/50 hover:bg-stone-50 focus:bg-white transition-all text-stone-900 font-medium" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required 
                    className="pl-12 block w-full px-4 py-3.5 border border-stone-200 rounded-2xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-stone-50/50 hover:bg-stone-50 focus:bg-white transition-all text-stone-900 font-medium" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2" htmlFor="address">Delivery Address (Optional)</label>
               <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Home className="h-5 w-5 text-stone-400" />
                </div>
                <input id="address" type="text" value={address} onChange={e=>setAddress(e.target.value)} 
                    className="pl-12 block w-full px-4 py-3.5 border border-stone-200 rounded-2xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-stone-50/50 hover:bg-stone-50 focus:bg-white transition-all text-stone-900 font-medium" placeholder="123 Main St, Apt 4B" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2" htmlFor="password">Password</label>
               <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required 
                    className="pl-12 block w-full px-4 py-3.5 border border-stone-200 rounded-2xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-stone-50/50 hover:bg-stone-50 focus:bg-white transition-all text-stone-900 font-medium" placeholder="••••••••" />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-base font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:-translate-y-1"
              >
                Complete Registration
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-stone-100 text-center text-sm font-medium">
            <span className="text-stone-500">
              Already a member of our family?
            </span>
            <Link to="/login" className="ml-2 text-red-600 hover:text-red-700 hover:underline transition-all">
              Sign in here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
