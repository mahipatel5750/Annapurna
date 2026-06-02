import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Plan {
  name: string;
  price: string;
  period: string;
}

interface PaymentModalProps {
  plan: Plan;
  onClose: () => void;
}

export function PaymentModal({ plan, onClose }: PaymentModalProps) {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: ''
  });
  
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };
  
  const handlePay = async () => {
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'subscriptions'), {
        ...formData,
        planName: plan.name,
        price: plan.price,
        period: plan.period,
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('tiffin_last_order_id', docRef.id);
      setStep(3);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (e) {
      console.error("Error adding document: ", e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-900">
            {step === 3 ? "Payment Successful" : "Checkout"}
          </h2>
          {step !== 3 && (
            <button onClick={onClose} disabled={isSubmitting} className="text-stone-400 hover:text-stone-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6">
          {step === 1 && (
            <form onSubmit={handleNext}>
              <div className="bg-red-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-stone-600">{plan.name}</span>
                  <span className="font-bold text-red-600 text-lg">{plan.price}</span>
                </div>
                <div className="text-sm text-stone-500">Billed {plan.period}</div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                  <input required type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" placeholder="+91" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Delivery Address</label>
                  <textarea required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none" rows={3} placeholder="Full address in Godhra..."></textarea>
                </div>
              </div>

              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl mt-8 transition-colors">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-medium text-stone-900 mb-4">Select Payment Method</h3>
              
              <div className="space-y-3 mb-8">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-red-500 bg-red-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                  <input type="radio" className="hidden" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                  <Smartphone className={`w-6 h-6 mr-3 ${paymentMethod === 'upi' ? 'text-red-600' : 'text-stone-400'}`} />
                  <span className={`font-medium ${paymentMethod === 'upi' ? 'text-red-900' : 'text-stone-600'}`}>UPI (GPay, PhonePe, Paytm)</span>
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-red-500 bg-red-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                  <input type="radio" className="hidden" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                  <CreditCard className={`w-6 h-6 mr-3 ${paymentMethod === 'card' ? 'text-red-600' : 'text-stone-400'}`} />
                  <span className={`font-medium ${paymentMethod === 'card' ? 'text-red-900' : 'text-stone-600'}`}>Credit / Debit Card</span>
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'border-red-500 bg-red-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                  <input type="radio" className="hidden" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                  <Banknote className={`w-6 h-6 mr-3 ${paymentMethod === 'cash' ? 'text-red-600' : 'text-stone-400'}`} />
                  <span className={`font-medium ${paymentMethod === 'cash' ? 'text-red-900' : 'text-stone-600'}`}>Cash on Delivery</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button disabled={isSubmitting} onClick={() => setStep(1)} className="px-6 py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors">
                  Back
                </button>
                <button disabled={isSubmitting} onClick={handlePay} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Processing...' : `Pay ${plan.price}`}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-2">Order Confirmed!</h3>
              <p className="text-stone-500">Sit back and relax. Your delicious homemade tiffin is on its way.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
