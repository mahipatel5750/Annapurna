import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Package, Users, Banknote, Calendar, CheckCircle2, XCircle, Info, PauseCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

interface Subscription {
  id: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  planName: string;
  price: string;
  period: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  notes?: string;
  skippedDays?: number;
  deliveryStatus?: string;
}

export function AdminPanel() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: { pathname: '/admin' } } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchSubscriptions = async () => {
      try {
        const q = query(collection(db, 'subscriptions'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const subs: Subscription[] = [];
        querySnapshot.forEach((doc) => {
          subs.push({ id: doc.id, ...doc.data() } as Subscription);
        });
        setSubscriptions(subs);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const subRef = doc(db, 'subscriptions', id);
      await updateDoc(subRef, { status: newStatus });
      setSubscriptions(subs => subs.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub));
      if (selectedSub && selectedSub.id === id) {
        setSelectedSub(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleUpdateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    try {
      const subRef = doc(db, 'subscriptions', selectedSub.id);
      await updateDoc(subRef, { 
        notes: selectedSub.notes,
        skippedDays: selectedSub.skippedDays
      });
      setSubscriptions(subs => subs.map(sub => sub.id === selectedSub.id ? selectedSub : sub));
      alert('Updated successfully');
    } catch (error) {
       console.error("Error updating notes:", error);
    }
  };

  const totalUsers = subscriptions.length;
  const activeSubs = subscriptions.filter(s => s.status === 'active').length;
  const pausedSubs = subscriptions.filter(s => s.status === 'paused').length;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-500">Checking authentication...</div>
      </div>
    );
  }

  const phoneCounts = subscriptions.reduce((acc, sub) => {
    acc[sub.phoneNumber] = (acc[sub.phoneNumber] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-serif text-stone-900">Admin Dashboard</h1>
            <p className="text-stone-500 mt-1">Manage your tiffin subscriptions</p>
          </div>
          <Link to="/" className="text-red-600 hover:text-red-700 font-medium">
            ← Back to Website
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Subscribers</p>
              <p className="text-2xl font-bold text-stone-900">{totalUsers}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Active Plans</p>
              <p className="text-2xl font-bold text-stone-900">{activeSubs}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <PauseCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Paused Plans</p>
              <p className="text-2xl font-bold text-stone-900">{pausedSubs}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-900">Recent Subscriptions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 text-sm border-b border-stone-100">
                    <th className="p-4 font-medium">Subscriber Name</th>
                    <th className="p-4 font-medium">Contact</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone-500">Loading subscriptions...</td>
                    </tr>
                  ) : subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone-500">No subscriptions found.</td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr 
                        key={sub.id} 
                        className={`border-b border-stone-50 hover:bg-stone-50/50 transition-colors cursor-pointer ${selectedSub?.id === sub.id ? 'bg-stone-50' : ''}`}
                        onClick={() => setSelectedSub(sub)}
                      >
                        <td className="p-4">
                          <div className="font-medium text-stone-900">{sub.fullName}</div>
                          {phoneCounts[sub.phoneNumber] > 1 && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">Repeat Customer</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-stone-900">{sub.phoneNumber}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${
                            sub.status === 'active' ? 'bg-green-100 text-green-800' :
                            sub.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            sub.status === 'paused' ? 'bg-blue-100 text-blue-800' :
                            'bg-stone-100 text-stone-800'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          {sub.status === 'pending' && (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(sub.id, 'active'); }}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors inline-block"
                                title="Accept Order"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(sub.id, 'cancelled'); }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors inline-block"
                                title="Reject Order"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button 
                            className="p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 rounded-full transition-colors inline-block"
                            title="View Details"
                          >
                            <Info className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            {selectedSub ? (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 sticky top-6">
                <div className="flex justify-between items-start mb-6 border-b border-stone-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900">{selectedSub.fullName}</h3>
                    <p className="text-stone-500 mt-1">{selectedSub.phoneNumber}</p>
                    {phoneCounts[selectedSub.phoneNumber] > 1 && (
                      <div className="mt-1 text-xs text-stone-500 text-red-600 font-medium">{phoneCounts[selectedSub.phoneNumber]} Total Orders</div>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    selectedSub.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedSub.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    selectedSub.status === 'paused' ? 'bg-blue-100 text-blue-800' :
                    'bg-stone-100 text-stone-800'
                  }`}>
                    {selectedSub.status}
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <div className="text-sm text-stone-500">Plan Details</div>
                    <div className="font-medium text-stone-900">{selectedSub.planName}</div>
                    <div className="text-stone-600 text-sm">{selectedSub.price} / {selectedSub.period}</div>
                  </div>
                  <div>
                    <div className="text-sm text-stone-500">Address</div>
                    <div className="font-medium text-stone-900 text-sm whitespace-pre-wrap">{selectedSub.address}</div>
                  </div>
                  <div>
                     <div className="text-sm text-stone-500">Payment Method</div>
                     <div className="font-medium text-stone-900 uppercase">{selectedSub.paymentMethod}</div>
                  </div>

                  <div className="flex gap-2">
                    {selectedSub.status === 'active' && (
                       <button onClick={() => handleUpdateStatus(selectedSub.id, 'paused')} className="flex-1 py-2 bg-blue-50 text-blue-700 font-medium text-sm rounded-lg hover:bg-blue-100 transition-colors">
                         Pause Plan
                       </button>
                    )}
                    {selectedSub.status === 'paused' && (
                       <button onClick={() => handleUpdateStatus(selectedSub.id, 'active')} className="flex-1 py-2 bg-green-50 text-green-700 font-medium text-sm rounded-lg hover:bg-green-100 transition-colors">
                         Resume Plan
                       </button>
                    )}
                    {(selectedSub.status === 'active' || selectedSub.status === 'paused') && (
                       <button onClick={() => {if(window.confirm('Cancel this plan?')) handleUpdateStatus(selectedSub.id, 'cancelled');}} className="flex-1 py-2 bg-red-50 text-red-700 font-medium text-sm rounded-lg hover:bg-red-100 transition-colors">
                         Cancel Plan
                       </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleUpdateNotes} className="border-t border-stone-100 pt-6">
                  <h4 className="font-bold text-stone-900 mb-4">Admin Controls</h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Today's Delivery Status</label>
                    <div className="flex gap-2">
                       <select 
                         value={selectedSub.deliveryStatus || 'Pending'} 
                         onChange={async (e) => {
                           const newStatus = e.target.value;
                           setSelectedSub({...selectedSub, deliveryStatus: newStatus});
                           try {
                             await updateDoc(doc(db, 'subscriptions', selectedSub.id), { deliveryStatus: newStatus });
                             setSubscriptions(subs => subs.map(sub => sub.id === selectedSub.id ? { ...sub, deliveryStatus: newStatus } : sub));
                           } catch (error) {
                             console.error("Error updating delivery status", error);
                           }
                         }}
                         className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                       >
                         <option value="Pending">Pending / Preparing</option>
                         <option value="Out for Delivery">Out for Delivery</option>
                         <option value="Delivered">Delivered</option>
                       </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Skipped Days (Remaining extension)</label>
                    <input 
                      type="number"
                      min="0"
                      value={selectedSub.skippedDays || 0}
                      onChange={(e) => setSelectedSub({...selectedSub, skippedDays: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Notes / Reminders</label>
                    <textarea 
                      rows={3}
                      value={selectedSub.notes || ''}
                      onChange={(e) => setSelectedSub({...selectedSub, notes: e.target.value})}
                      placeholder="e.g. Skipped next Monday..."
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                    />
                  </div>

                  <button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-2 rounded-lg transition-colors">
                    Save Internal Notes
                  </button>
                </form>

              </div>
            ) : (
              <div className="bg-stone-100 rounded-2xl border border-stone-200 border-dashed p-8 text-center h-full flex flex-col items-center justify-center text-stone-400">
                <Info className="w-12 h-12 mb-4 text-stone-300" />
                <p>Select a subscription from the list to view details, track skipped days, and manage plans.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
