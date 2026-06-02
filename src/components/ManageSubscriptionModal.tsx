import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, Save, Truck, CheckCircle2, Clock, ChefHat } from 'lucide-react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function ManageSubscriptionModal({ orderId, onClose }: { orderId: string, onClose: () => void }) {
  const [sub, setSub] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [skippedDays, setSkippedDays] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'subscriptions', orderId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSub({ id: docSnap.id, ...data });
        setNotes(data.notes || '');
        setSkippedDays(data.skippedDays || 0);
      }
    });
    return () => unsub();
  }, [orderId]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      await updateDoc(doc(db, 'subscriptions', orderId), { status: 'cancelled' });
    }
  };

  const handleUpdateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'subscriptions', orderId), { 
        notes,
        skippedDays
      });
      alert('Skip dates updated successfully');
    } catch (error) {
      console.error("Error updating skip dates:", error);
    }
  };

  if (!sub) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-900">My Subscription</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-stone-50 p-4 rounded-xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-stone-900">{sub.planName}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 
                  sub.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  sub.status === 'paused' ? 'bg-blue-100 text-blue-800' :
                  'bg-stone-200 text-stone-800'}`}
              >
                {sub.status}
              </span>
            </div>
            <div className="text-sm text-stone-600 mb-2"><strong>Name:</strong> {sub.fullName}</div>
            <div className="text-sm text-stone-600 mb-2"><strong>Phone:</strong> {sub.phoneNumber}</div>
            <div className="text-sm text-stone-600 mb-2"><strong>Address:</strong> {sub.address}</div>
            <div className="text-sm text-stone-600"><strong>Price:</strong> {sub.price} ({sub.period})</div>
          </div>

          {(sub.status === 'active' || sub.status === 'pending') && (
            <div className="bg-white border border-stone-200 p-5 rounded-2xl mb-6 shadow-sm">
              <h3 className="font-bold text-stone-900 mb-4 text-sm flex items-center justify-between">
                Today's Delivery
                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs animate-pulse">Live Tracking</span>
              </h3>
              
              <div className="relative">
                <div className="absolute top-5 left-6 bottom-5 w-0.5 bg-stone-100 z-0"></div>
                
                <div className="relative z-10 flex flex-col gap-6">
                  <div className={`flex items-start gap-4 ${sub.deliveryStatus === 'Pending' || !sub.deliveryStatus ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white ${sub.deliveryStatus === 'Pending' || !sub.deliveryStatus ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                      {sub.deliveryStatus === 'Pending' || !sub.deliveryStatus ? <ChefHat className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div className="pt-3">
                      <p className={`text-sm font-bold ${sub.deliveryStatus === 'Pending' || !sub.deliveryStatus ? 'text-amber-700' : 'text-stone-900'}`}>Preparing Meal</p>
                      <p className="text-xs text-stone-500 mt-1">Kitchen is packing your fresh tiffin</p>
                    </div>
                  </div>

                  <div className={`flex items-start gap-4 ${sub.deliveryStatus === 'Out for Delivery' ? 'opacity-100' : (sub.deliveryStatus === 'Delivered' ? 'opacity-50' : 'opacity-40 grayscale')}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white ${sub.deliveryStatus === 'Out for Delivery' ? 'bg-blue-100 text-blue-600' : (sub.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400')}`}>
                      {sub.deliveryStatus === 'Delivered' ? <CheckCircle2 className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                    </div>
                    <div className="pt-3">
                      <p className={`text-sm font-bold ${sub.deliveryStatus === 'Out for Delivery' ? 'text-blue-700' : 'text-stone-900'}`}>Out for Delivery</p>
                      <p className="text-xs text-stone-500 mt-1">Your meal is on the way</p>
                    </div>
                  </div>

                  <div className={`flex items-start gap-4 ${sub.deliveryStatus === 'Delivered' ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white ${sub.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-600 shadow-sm ring-4 ring-green-50' : 'bg-stone-100 text-stone-400'}`}>
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="pt-3">
                      <p className={`text-sm font-bold ${sub.deliveryStatus === 'Delivered' ? 'text-green-700' : 'text-stone-900'}`}>Delivered</p>
                      <p className="text-xs text-stone-500 mt-1">Enjoy your authentic home-cooked meal!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(sub.status === 'active' || sub.status === 'pending' || sub.status === 'paused') ? (
            <div className="space-y-6">
              <form onSubmit={handleUpdateNotes} className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <h3 className="font-bold text-stone-900 mb-3 text-sm">Manage Schedule</h3>
                
                <div className="mb-3">
                  <label className="block text-xs font-medium text-stone-600 mb-1">Total Skipped Days (for extension)</label>
                  <input 
                    type="number"
                    min="0"
                    value={skippedDays}
                    onChange={(e) => setSkippedDays(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-stone-600 mb-1">Skip Dates or Notes</label>
                  <textarea 
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Skipping next Wednesday..."
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  />
                </div>

                <button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Update Schedule
                </button>
              </form>

              <button onClick={handleCancel} className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Cancel Subscription
              </button>
            </div>
          ) : (
            <div className="text-center text-stone-500 font-medium">
              This subscription is {sub.status}.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
