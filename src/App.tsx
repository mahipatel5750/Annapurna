import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './contexts/AuthContext';
import { PaymentModal } from './components/PaymentModal';
import { ManageSubscriptionModal } from './components/ManageSubscriptionModal';

import { 
  Phone, 
  MapPin, 
  Clock, 
  Mail, 
  CheckCircle2, 
  Star, 
  Menu as MenuIcon, 
  X, 
  ChefHat, 
  Leaf, 
  Truck, 
  Utensils,
  Droplets,
  ShieldCheck,
  CreditCard,
  Info
} from 'lucide-react';

const plans = [
  {
    name: "Basic Plan",
    price: "₹70",
    period: "per meal",
    items: ["4 Rotis", "1 Sabzi", "Dal", "Rice", "Salad"],
  },
  {
    name: "Standard Plan",
    price: "₹90",
    period: "per meal",
    items: ["5 Rotis", "2 Sabzi", "Dal", "Rice", "Salad", "Pickle"],
    popular: true,
  },
  {
    name: "Premium Plan",
    price: "₹120",
    period: "per meal",
    items: ["5 Rotis", "2 Sabzi", "Dal", "Rice", "Salad", "Sweet (2x/week)", "Buttermilk"],
  },
  {
    name: "Monthly (Lunch)",
    price: "₹2200",
    period: "per month",
    items: ["Standard Plan items", "Lunch Delivery Only", "Monday - Saturday"],
  },
  {
    name: "Monthly (Lunch + Dinner)",
    price: "₹4200",
    period: "per month",
    items: ["Standard Plan items", "Lunch & Dinner Delivery", "Monday - Saturday"],
  }
];

const dietOptions = ['Standard', 'Jain', 'Low Spice', 'Oil-Controlled', 'Custom Diet'];

const menusByDiet = {
  'Standard': [
    { day: "Monday", items: ["Roti", "Mix Veg", "Dal Fry", "Rice", "Salad"] },
    { day: "Tuesday", items: ["Roti", "Aloo Gobi", "Gujarati Dal", "Rice", "Pickle"] },
    { day: "Wednesday", items: ["Roti", "Sev Tameta", "Dal", "Rice", "Salad"] },
    { day: "Thursday", items: ["Roti", "Bhindi Sabzi", "Dal Tadka", "Rice", "Buttermilk"] },
    { day: "Friday", items: ["Roti", "Chole", "Jeera Rice", "Salad"] },
    { day: "Saturday", items: ["Roti", "Paneer Sabzi", "Dal Fry", "Rice", "Sweet"] },
  ],
  'Jain': [
    { day: "Monday", items: ["Roti", "Jain Mix Veg", "Jain Dal Fry", "Rice", "Cucumber Salad"] },
    { day: "Tuesday", items: ["Roti", "Cabbage Peas", "Gujarati Dal", "Rice", "Pickle"] },
    { day: "Wednesday", items: ["Roti", "Sev Tameta", "Jain Dal", "Rice", "Salad"] },
    { day: "Thursday", items: ["Roti", "Bhindi Sabzi", "Jain Dal Tadka", "Rice", "Buttermilk"] },
    { day: "Friday", items: ["Roti", "Jain Chole", "Jeera Rice", "Salad"] },
    { day: "Saturday", items: ["Roti", "Paneer Sabzi", "Jain Dal Fry", "Rice", "Sweet"] },
  ],
  'Low Spice': [
    { day: "Monday", items: ["Roti", "Mild Mix Veg", "Dal Fry (Less Spicy)", "Rice", "Salad"] },
    { day: "Tuesday", items: ["Roti", "Mild Aloo Gobi", "Gujarati Dal", "Rice", "Pickle"] },
    { day: "Wednesday", items: ["Roti", "Mild Sev Tameta", "Dal", "Rice", "Salad"] },
    { day: "Thursday", items: ["Roti", "Mild Bhindi", "Dal Tadka", "Rice", "Buttermilk"] },
    { day: "Friday", items: ["Roti", "Mild Chole", "Jeera Rice", "Salad"] },
    { day: "Saturday", items: ["Roti", "Mild Paneer", "Dal Fry", "Rice", "Sweet"] },
  ],
  'Oil-Controlled': [
    { day: "Monday", items: ["Dry Roti", "Zero-Oil Mix Veg", "Boiled Dal", "Rice", "Salad"] },
    { day: "Tuesday", items: ["Dry Roti", "Roasted Aloo Gobi", "Boiled Dal", "Rice", "Pickle"] },
    { day: "Wednesday", items: ["Dry Roti", "Less-Oil Sev Tameta", "Boiled Dal", "Rice", "Salad"] },
    { day: "Thursday", items: ["Dry Roti", "Steamed Bhindi", "Boiled Dal", "Rice", "Buttermilk"] },
    { day: "Friday", items: ["Dry Roti", "Less-Oil Chole", "Jeera Rice", "Salad"] },
    { day: "Saturday", items: ["Dry Roti", "Less-Oil Paneer", "Boiled Dal", "Rice", "Sweet"] },
  ],
  'Custom Diet': [
    { day: "Monday", items: ["Multigrain Roti", "Protein Mix Veg", "Dal Fry", "Brown Rice", "Salad"] },
    { day: "Tuesday", items: ["Multigrain Roti", "Aloo Gobi", "Gujarati Dal", "Brown Rice", "Pickle"] },
    { day: "Wednesday", items: ["Multigrain Roti", "Sev Tameta", "Dal", "Brown Rice", "Salad"] },
    { day: "Thursday", items: ["Multigrain Roti", "Bhindi Sabzi", "Dal Tadka", "Brown Rice", "Buttermilk"] },
    { day: "Friday", items: ["Multigrain Roti", "Chole", "Brown Rice", "Salad"] },
    { day: "Saturday", items: ["Multigrain Roti", "Paneer Sabzi", "Dal Fry", "Brown Rice", "Sweet"] },
  ]
};

const features = [
  { icon: <Leaf className="w-6 h-6 text-red-600" />, title: "Pure Vegetarian", desc: "100% pure veg & Jain food available" },
  { icon: <ChefHat className="w-6 h-6 text-red-600" />, title: "Home-Style Cooking", desc: "Custom diet, low spice & oil control options" },
  { icon: <Droplets className="w-6 h-6 text-red-600" />, title: "Quality Ingredients", desc: "Cooked in Groundnut Oil with RO Water" },
  { icon: <Truck className="w-6 h-6 text-red-600" />, title: "Free Delivery", desc: "Free delivery within 3 km radius" },
  { icon: <ShieldCheck className="w-6 h-6 text-red-600" />, title: "Hygienic Kitchen", desc: "Hygiene certified homemade preparation" },
  { icon: <Utensils className="w-6 h-6 text-red-600" />, title: "Eco Packaging", desc: "Steel tiffins or disposable eco boxes" },
];

const reviews = [
  { name: "Rahul Sharma", rating: 5, comment: "Food tastes exactly like home. Very affordable and hygienic." },
  { name: "Priya Mehta", rating: 4, comment: "Best option for students living away from home." },
  { name: "Amit Verma", rating: 5, comment: "Timely delivery and fresh food every day." },
];

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDiet, setActiveDiet] = useState('Standard');
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string, period: string} | null>(null);
  
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const activeOrderId = localStorage.getItem('tiffin_last_order_id');
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const orderId = localStorage.getItem('tiffin_last_order_id');
    if (!orderId) return;

    const unsub = onSnapshot(doc(db, 'subscriptions', orderId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status !== 'pending' && !localStorage.getItem(`notified_${orderId}_${data.status}`)) {
          setOrderStatus(data);
          setShowNotification(true);
        }
      }
    });

    return () => unsub();
  }, [selectedPlan]); // Re-run if they place a new order (modal closes)

  const dismissNotification = () => {
    setShowNotification(false);
    const orderId = localStorage.getItem('tiffin_last_order_id');
    if (orderId && orderStatus) {
      localStorage.setItem(`notified_${orderId}_${orderStatus.status}`, 'true');
    }
  };

  const handleOrderFocus = (plan?: {name: string, price: string, period: string}) => {
    if (!user) {
      navigate('/login');
    } else {
      if (plan) {
        setSelectedPlan(plan);
      } else {
        scrollToSection('contact');
      }
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-500 flex flex-col items-center">
          <ChefHat className="w-12 h-12 text-red-600 mb-4 animate-bounce" />
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 font-sans text-stone-800 selection:bg-red-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-red-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-900 leading-tight">Annapurna</h1>
                <p className="text-xs font-medium text-red-600 tracking-wider uppercase">Tiffin Service</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('about')} className="text-stone-600 hover:text-red-600 font-medium transition-colors">About</button>
              <button onClick={() => scrollToSection('menu')} className="text-stone-600 hover:text-red-600 font-medium transition-colors">Menu</button>
              <button onClick={() => scrollToSection('plans')} className="text-stone-600 hover:text-red-600 font-medium transition-colors">Plans</button>
              <button onClick={() => scrollToSection('gallery')} className="text-stone-600 hover:text-red-600 font-medium transition-colors">Gallery</button>
              <button onClick={() => handleOrderFocus()} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 inline-block">
                Order Now
              </button>
              {activeOrderId && (
                <button onClick={() => setShowManageModal(true)} className="text-red-600 hover:bg-red-50 border border-red-200 px-6 py-2.5 rounded-full font-medium transition-all inline-block">
                  My Subscription
                </button>
              )}
              {user ? (
                <button onClick={logout} className="text-stone-600 hover:text-red-600 font-medium transition-colors">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="text-stone-600 hover:text-red-600 font-medium transition-colors">
                  Login
                </Link>
              )}
            </div>

            <button className="md:hidden p-2 text-stone-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-red-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 flex flex-col gap-4">
                <button onClick={() => scrollToSection('about')} className="text-left text-stone-600 font-medium py-2 border-b border-stone-100 block">About</button>
                <button onClick={() => scrollToSection('menu')} className="text-left text-stone-600 font-medium py-2 border-b border-stone-100 block">Menu</button>
                <button onClick={() => scrollToSection('plans')} className="text-left text-stone-600 font-medium py-2 border-b border-stone-100 block">Plans</button>
                <button onClick={() => scrollToSection('gallery')} className="text-left text-stone-600 font-medium py-2 border-b border-stone-100 block">Gallery</button>
                <button onClick={() => handleOrderFocus()} className="bg-red-600 text-white px-4 py-3 rounded-lg font-medium text-center mt-2 block">
                  Order Now
                </button>
                {activeOrderId && (
                  <button onClick={() => setShowManageModal(true)} className="text-red-600 hover:bg-red-50 border border-red-200 px-4 py-3 rounded-lg font-medium text-center mt-2 block">
                    My Subscription
                  </button>
                )}
                {user ? (
                  <button onClick={logout} className="text-left text-stone-600 font-medium py-2 border-t border-stone-100 block w-full mt-2">Logout</button>
                ) : (
                  <Link to="/login" className="text-left text-stone-600 font-medium py-2 border-t border-stone-100 block w-full mt-2">Login</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold mb-6">
              <Star className="w-4 h-4 fill-current" />
              <span>Established 2021 • Godhra</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-tight mb-6">
              Fresh, Homemade <br/>
              <span className="text-red-600">Tiffin Delivered</span> <br/>
              To Your Doorstep
            </h2>
            <p className="text-lg text-stone-600 mb-8 max-w-lg">
              Healthy, hygienic, and affordable vegetarian meals prepared daily. Perfect for students, professionals, and anyone craving a taste of home.
            </p>
            
            <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded-r-lg mb-8 max-w-lg">
              <p className="text-red-800 font-medium flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <span><strong>Special Offer:</strong> Order your first tiffin today and get <strong>10% off!</strong></span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => handleOrderFocus()} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Call to Order
              </button>
              <button onClick={() => scrollToSection('plans')} className="bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center">
                View Plans
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-full bg-red-200 absolute -inset-4 blur-3xl opacity-50"></div>
            <img 
              src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800" 
              alt="Delicious Indian Thali" 
              className="relative z-10 rounded-3xl shadow-2xl object-cover w-full aspect-[4/3] md:aspect-square"
              referrerPolicy="no-referrer"
            />
            
            {/* Floating Badge */}
            <div className="absolute -bottom-12 -right-6 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500 font-medium">100% Pure</p>
                <p className="font-bold text-stone-900">Vegetarian</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Why Choose Annapurna?</h2>
            <p className="text-stone-600 text-lg">We bring the warmth and taste of a mother's kitchen straight to your desk or dining table.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-red-50 p-6 rounded-2xl border border-red-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{feature.title}</h3>
                <p className="text-stone-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Menu */}
      <section id="menu" className="py-20 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Weekly Menu</h2>
            <p className="text-stone-400 text-lg">A diverse and balanced diet for every day of the week.</p>
          </div>

          {/* Diet Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {dietOptions.map(diet => (
              <button
                key={diet}
                onClick={() => setActiveDiet(diet)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeDiet === diet 
                    ? 'bg-red-600 text-white shadow-lg scale-105' 
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                }`}
              >
                {diet}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menusByDiet[activeDiet as keyof typeof menusByDiet].map((day, idx) => (
              <div key={idx} className="bg-stone-800 p-6 rounded-2xl border border-stone-700 hover:border-red-500 transition-colors">
                <h3 className="text-xl font-bold text-red-400 mb-4 pb-2 border-b border-stone-700">{day.day}</h3>
                <ul className="space-y-2">
                  {day.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-stone-300">
                      <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-stone-500 mt-8 text-sm italic">* Menu is subject to change based on seasonal availability.</p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Tiffin Plans & Pricing</h2>
            <p className="text-stone-600 text-lg">Affordable options tailored for your daily needs.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {plans.slice(0,3).map((plan, idx) => (
              <div key={idx} className={`bg-white rounded-3xl p-8 shadow-sm border-2 relative flex flex-col ${plan.popular ? 'border-red-500 shadow-xl scale-105 z-10' : 'border-transparent hover:border-red-200'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-stone-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-red-600">{plan.price}</span>
                  <span className="text-stone-500 font-medium">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleOrderFocus({name: plan.name, price: plan.price, period: plan.period})} className={`w-full py-3 rounded-xl font-bold transition-colors inline-block text-center ${plan.popular ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-800'}`}>
                  Choose Plan
                </button>
              </div>
            ))}
          </div>

          {/* Monthly Plans */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-red-100">
            <h3 className="text-2xl font-bold text-stone-900 mb-6 text-center">Monthly Subscriptions</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {plans.slice(3).map((plan, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-red-50 rounded-2xl gap-6">
                  <div>
                    <h4 className="text-xl font-bold text-stone-900 mb-1">{plan.name}</h4>
                    <p className="text-stone-600 text-sm mb-2">{plan.items.join(" • ")}</p>
                  </div>
                  <div className="text-center sm:text-right flex-shrink-0">
                    <div className="text-3xl font-extrabold text-red-600 mb-2">{plan.price}</div>
                    <button onClick={() => handleOrderFocus({name: plan.name, price: plan.price, period: plan.period})} className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto inline-block text-center">
                      Subscribe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Placeholders */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Inside Our Kitchen</h2>
            <p className="text-stone-600 text-lg">A glimpse of where the magic happens.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600" alt="Kitchen" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-bold">Our Kitchen</span>
              </div>
            </div>
            <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600" alt="Meal Prep" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-bold">Meal Prep</span>
              </div>
            </div>
            <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&q=80&w=600" alt="Packed Tiffin" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-bold">Packed Tiffin</span>
              </div>
            </div>
            <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1552895638-f7fe08d2f7d5?auto=format&fit=crop&q=80&w=600" alt="Delivery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-bold">Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-red-100 text-lg">Don't just take our word for it.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg font-medium mb-6">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-400 rounded-full flex items-center justify-center font-bold text-xl">
                    {review.name.charAt(0)}
                  </div>
                  <span className="font-bold">{review.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="bg-stone-900 text-stone-300 py-16 border-t-8 border-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">Annapurna</h2>
                  <p className="text-xs font-medium text-red-500 tracking-wider uppercase">Tiffin Service</p>
                </div>
              </div>
              <p className="text-stone-400 mb-6">
                Owned by Neha Patel.<br/>
                Providing fresh, hygienic, and affordable homemade meals since 2021.
              </p>
              <div className="flex items-center gap-2 text-red-500 font-bold">
                <Phone className="w-5 h-5" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 9876543210</a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <span>Near Railway Station Road, Station Road, Godhra, Panchmahal, Gujarat 389001</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <a href="mailto:annapurnatiffin@gmail.com" className="hover:text-white transition-colors">annapurnatiffin@gmail.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>Cash, UPI, GPay, PhonePe, Paytm</span>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Working Hours</h3>
              <ul className="space-y-4">
                <li className="flex justify-between border-b border-stone-800 pb-2">
                  <span>Order Timing</span>
                  <span className="text-white">7 AM – 10 PM</span>
                </li>
                <li className="flex justify-between border-b border-stone-800 pb-2">
                  <span>Lunch Delivery</span>
                  <span className="text-white">11:30 AM – 1:30 PM</span>
                </li>
                <li className="flex justify-between border-b border-stone-800 pb-2">
                  <span>Dinner Delivery</span>
                  <span className="text-white">6:30 PM – 8:30 PM</span>
                </li>
                <li className="flex justify-between border-b border-stone-800 pb-2">
                  <span>Working Days</span>
                  <span className="text-white">Mon – Sat</span>
                </li>
                <li className="flex justify-between text-red-400">
                  <span>Holiday</span>
                  <span>Sunday</span>
                </li>
              </ul>
            </div>

            {/* Delivery Areas */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Delivery Areas</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-red-500" /> Station Road</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-red-500" /> Bhuravav</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-red-500" /> Bamroli Road</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-red-500" /> Civil Lines</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-red-500" /> Polytechnic Area</li>
              </ul>
              <p className="mt-4 text-sm text-stone-500 italic">Free delivery within 3 km. ₹10 extra beyond 3 km.</p>
            </div>

          </div>

          <div className="pt-8 border-t border-stone-800 text-center text-stone-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} Annapurna Home Tiffin Service. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/admin" className="hover:text-white transition-colors">Admin Panel</Link>
              <p>Website: <a href="http://www.annapurnatiffin.in" className="hover:text-white transition-colors">www.annapurnatiffin.in</a></p>
            </div>
          </div>
        </div>
      </footer>

      {/* Payment Checkout Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showManageModal && activeOrderId && (
          <ManageSubscriptionModal orderId={activeOrderId} onClose={() => setShowManageModal(false)} />
        )}
      </AnimatePresence>

      {/* Order Status Notification Toast */}
      <AnimatePresence>
        {showNotification && orderStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden"
          >
            <div className={`h-2 ${orderStatus.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 mb-1">
                  {orderStatus.status === 'active' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Info className="w-5 h-5 text-red-500" />
                  )}
                  <h3 className="font-bold text-stone-900">
                    Order {orderStatus.status === 'active' ? 'Accepted!' : 'Rejected'}
                  </h3>
                </div>
                <button onClick={dismissNotification} className="text-stone-400 hover:text-stone-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-stone-600 text-sm mb-4">
                {orderStatus.status === 'active' 
                  ? `Great news, ${orderStatus.fullName}! Your ${orderStatus.planName} has been accepted by the kitchen. We will start your delivery as scheduled.`
                  : `Sorry, ${orderStatus.fullName}. Your order for the ${orderStatus.planName} was rejected. Please contact us for more details.`}
              </p>
              <button 
                onClick={dismissNotification}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors text-sm"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
