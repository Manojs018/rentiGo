import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, MapPin, Key, CheckCircle2, ShieldCheck, 
  Clock, Navigation, MessageSquare, AlertCircle, Compass 
} from 'lucide-react';
import { messageAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export default function HandoverChatCoordinator({ booking, currentUser, onClose, onBookingUpdated }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [bookingState, setBookingState] = useState(booking);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  
  const messagesEndRef = useRef(null);

  const isOwner = currentUser?.role === 'owner';
  const otherUser = isOwner ? bookingState.customer : bookingState.owner;
  const otherUserName = otherUser?.name || (isOwner ? 'Customer' : 'Owner');

  // Load message history & setup socket room
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await messageAPI.getMessages(bookingState._id);
        setMessages(data.data || []);
      } catch (err) {
        console.error('Failed to load message history:', err);
        toast.error('Could not load chat history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    if (socket) {
      socket.emit('join:booking', { bookingId: bookingState._id });

      const handleNewMessage = (msg) => {
        if (msg.booking === bookingState._id) {
          setMessages((prev) => {
            // Avoid duplicate messages
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();
        }
      };

      const handleHandoverUpdated = (updatedBooking) => {
        if (updatedBooking._id === bookingState._id) {
          setBookingState(updatedBooking);
          if (onBookingUpdated) {
            onBookingUpdated(updatedBooking);
          }
        }
      };

      socket.on('message:received', handleNewMessage);
      socket.on('handover:updated', handleHandoverUpdated);

      return () => {
        socket.emit('leave:booking', { bookingId: bookingState._id });
        socket.off('message:received', handleNewMessage);
        socket.off('handover:updated', handleHandoverUpdated);
      };
    }
  }, [bookingState._id, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    try {
      const { data } = await messageAPI.sendMessage(bookingState._id, {
        content: inputText,
        type: 'text'
      });
      setInputText('');
      setMessages((prev) => [...prev, data.data]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleShareLocation = async () => {
    if (!locationAddress.trim()) {
      toast.error('Please specify a pickup location address');
      return;
    }

    try {
      // Mock coordinates
      const lat = 12.9716 + (Math.random() - 0.5) * 0.02;
      const lng = 77.5946 + (Math.random() - 0.5) * 0.02;

      // Update handover state on server
      const handoverDetails = {
        locationShared: true,
        location: {
          lat,
          lng,
          address: locationAddress
        }
      };

      const { data: updatedData } = await messageAPI.updateHandover(bookingState._id, handoverDetails);
      setBookingState(updatedData.data);
      if (onBookingUpdated) onBookingUpdated(updatedData.data);

      // Post location message in chat
      const { data: msgData } = await messageAPI.sendMessage(bookingState._id, {
        content: `📍 Pickup Location: ${locationAddress}`,
        type: 'location',
        meta: handoverDetails.location
      });

      setMessages((prev) => [...prev, msgData.data]);
      setShowLocationModal(false);
      setLocationAddress('');
      toast.success('Pickup location shared!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to share location');
    }
  };

  const handleActionClick = async (actionType) => {
    try {
      let detailsUpdate = {};
      let messageContent = '';
      let messageType = 'text';

      if (actionType === 'keys_delivered') {
        detailsUpdate = { keysDelivered: true };
        messageContent = '🔑 Keys have been handed over to the customer.';
        messageType = 'key_delivery';
      } else if (actionType === 'vehicle_inspected') {
        detailsUpdate = { vehicleInspected: true };
        messageContent = '🔍 Vehicle inspected: Condition checks pass. Keys received.';
        messageType = 'inspection';
      } else if (actionType === 'handover_completed') {
        detailsUpdate = { handoverCompleted: true };
        messageContent = '🏁 Vehicle handover complete! Have a safe and happy trip!';
        messageType = 'handover_complete';
      }

      // Update backend handover status
      const { data: updatedData } = await messageAPI.updateHandover(bookingState._id, detailsUpdate);
      setBookingState(updatedData.data);
      if (onBookingUpdated) onBookingUpdated(updatedData.data);

      // Create notification text message in chat
      const { data: msgData } = await messageAPI.sendMessage(bookingState._id, {
        content: messageContent,
        type: messageType
      });

      setMessages((prev) => [...prev, msgData.data]);
      toast.success('Handover status updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update handover action');
    }
  };

  // Timeline Step calculation
  const timelineSteps = [
    { label: 'Location', done: bookingState.handoverDetails?.locationShared },
    { label: 'Keys Handed Over', done: bookingState.handoverDetails?.keysDelivered },
    { label: 'Inspected', done: bookingState.handoverDetails?.vehicleInspected },
    { label: 'Completed', done: bookingState.handoverDetails?.handoverCompleted }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Slideout Panel */}
      <motion.div 
        initial={{ x: '100%' }} 
        animate={{ x: 0 }} 
        exit={{ x: '100%' }} 
        transition={{ type: 'tween', duration: 0.35 }}
        className="relative z-10 w-full max-w-lg h-full bg-[#0a0a0f] border-l border-white/[0.08] flex flex-col shadow-2xl"
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0e0e16]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{bookingState.vehicle?.emoji || '🚗'}</span>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">
                {bookingState.vehicle?.brand} {bookingState.vehicle?.model}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                {isOwner ? 'Customer: ' : 'Owner: '} <span className="text-orange-400 font-semibold">{otherUserName}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Timeline Tracker */}
        <div className="p-4 border-b border-white/[0.08] bg-[#0c0c14]/40">
          <h4 className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-3">Live Handover Progress</h4>
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
            
            {/* Timeline progress line */}
            <div 
              className="absolute top-1/2 left-3 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ 
                width: `${
                  bookingState.handoverDetails?.handoverCompleted ? '100%' :
                  bookingState.handoverDetails?.vehicleInspected ? '70%' :
                  bookingState.handoverDetails?.keysDelivered ? '40%' :
                  bookingState.handoverDetails?.locationShared ? '15%' : '0%'
                }` 
              }}
            />

            {timelineSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  step.done 
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-orange-500 text-white shadow-glow' 
                    : 'bg-[#12121e] border-slate-700 text-slate-500'
                }`}>
                  {step.done ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 ${step.done ? 'text-white' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Platform Card */}
        <div className="m-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl flex gap-2.5 items-start">
          <ShieldCheck size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-xs font-semibold">🔒 Safe & Secure Communication</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Keep coordination in this chat. Avoid sharing your personal mobile number until you are fully comfortable.
            </p>
          </div>
        </div>

        {/* Chat History Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500">Connecting to secure chat...</span>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                  <MessageSquare size={32} className="opacity-20 mb-2" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs opacity-60 max-w-[200px] mt-1">Start chatting to coordinate your pickup location and vehicle handover!</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender?._id === currentUser?.id || msg.sender === currentUser?.id;
                
                // System Action Events
                if (['location', 'key_delivery', 'inspection', 'handover_complete'].includes(msg.type)) {
                  let bubbleBg = 'border-slate-800 bg-slate-900/50';
                  let iconColor = 'text-slate-400';
                  let title = 'System Log';
                  
                  if (msg.type === 'location') {
                    bubbleBg = 'border-orange-500/20 bg-orange-950/10';
                    iconColor = 'text-orange-400';
                    title = '📍 Pickup Location Shared';
                  } else if (msg.type === 'key_delivery') {
                    bubbleBg = 'border-amber-500/20 bg-amber-950/10';
                    iconColor = 'text-amber-400';
                    title = '🔑 Keys Delivered';
                  } else if (msg.type === 'inspection') {
                    bubbleBg = 'border-green-500/20 bg-green-950/10';
                    iconColor = 'text-green-400';
                    title = '🔍 Vehicle Inspected';
                  } else if (msg.type === 'handover_complete') {
                    bubbleBg = 'border-blue-500/20 bg-blue-950/10';
                    iconColor = 'text-blue-400';
                    title = '🏁 Handover Completed';
                  }

                  return (
                    <div key={msg._id} className="flex justify-center my-2">
                      <div className={`border rounded-2xl p-4 max-w-[85%] w-full ${bubbleBg}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <CheckCircle2 size={14} className={iconColor} />
                          <span className={`text-xs font-bold ${iconColor}`}>{title}</span>
                          <span className="text-[10px] text-slate-500 ml-auto">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-white leading-relaxed">{msg.content}</p>
                        
                        {msg.type === 'location' && msg.meta && (
                          <div className="mt-3 p-3 bg-black/40 rounded-xl border border-white/[0.04] flex items-center justify-between gap-2">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Coordinates</p>
                              <p className="text-white text-xs font-mono mt-0.5">
                                {msg.meta.lat?.toFixed(5)}° N, {msg.meta.lng?.toFixed(5)}° E
                              </p>
                            </div>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${msg.meta.lat},${msg.meta.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary py-1 px-3 text-[10px] rounded-lg inline-flex items-center gap-1 shrink-0 font-bold"
                            >
                              <Navigation size={10} /> View Map
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Standard Text Message
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMe 
                        ? 'bg-orange-500 text-white rounded-br-none shadow-md' 
                        : 'bg-[#181824] border border-white/[0.05] text-slate-200 rounded-bl-none'
                    }`}>
                      <div className="flex items-center justify-between gap-4 mb-0.5">
                        <span className="text-[10px] font-black opacity-60 uppercase">
                          {isMe ? 'You' : msg.sender?.name || otherUserName}
                        </span>
                        <span className="text-[9px] opacity-40">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Floating Contextual Action Cards */}
        <AnimatePresence>
          {!loading && (
            <div className="px-4 py-2 bg-[#0c0c14]/60 border-t border-white/[0.05]">
              {/* Owner's Action Scenarios */}
              {isOwner && (
                <>
                  {/* Step 1: Location Shared? */}
                  {!bookingState.handoverDetails?.locationShared && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                      className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white text-xs font-bold">📍 Handover Checklist</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Share the coordinate location for vehicle pick-up.</p>
                      </div>
                      <button 
                        onClick={() => setShowLocationModal(true)} 
                        className="btn-primary py-1.5 px-3 text-xs shrink-0 font-bold inline-flex items-center gap-1"
                      >
                        <MapPin size={12} /> Share Location
                      </button>
                    </motion.div>
                  )}

                  {/* Step 2: Keys Handed Over? */}
                  {bookingState.handoverDetails?.locationShared && !bookingState.handoverDetails?.keysDelivered && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                      className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white text-xs font-bold">🔑 Handover Checklist</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Confirm you've delivered the keys to the customer.</p>
                      </div>
                      <button 
                        onClick={() => handleActionClick('keys_delivered')} 
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-3 text-xs shrink-0 rounded-lg transition-all inline-flex items-center gap-1"
                      >
                        <Key size={12} /> Keys Delivered
                      </button>
                    </motion.div>
                  )}

                  {/* Step 3: Waiting for Inspection */}
                  {bookingState.handoverDetails?.keysDelivered && !bookingState.handoverDetails?.vehicleInspected && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                      className="p-3 bg-slate-900 border border-white/[0.05] rounded-xl flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin shrink-0" />
                      <div>
                        <p className="text-white text-xs font-bold">Waiting for Customer Inspection</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">The customer is inspecting the vehicle condition prior to departure.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Finalize Handover */}
                  {bookingState.handoverDetails?.vehicleInspected && !bookingState.handoverDetails?.handoverCompleted && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                      className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white text-xs font-bold">🏁 Handover Checklist</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Inspection is approved. Mark vehicle handover completed.</p>
                      </div>
                      <button 
                        onClick={() => handleActionClick('handover_completed')} 
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-3 text-xs shrink-0 rounded-lg transition-all inline-flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Complete Handover
                      </button>
                    </motion.div>
                  )}
                </>
              )}

              {/* Customer's Action Scenarios */}
              {!isOwner && (
                <>
                  {/* Step 1: Waiting for Location */}
                  {!bookingState.handoverDetails?.locationShared && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                      className="p-3 bg-slate-900 border border-white/[0.05] rounded-xl flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin shrink-0" />
                      <div>
                        <p className="text-white text-xs font-bold">Waiting for Owner Action</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">The owner is setting up details. Waiting for them to share the pick-up location.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Location Shared, keys pending */}
                  {bookingState.handoverDetails?.locationShared && !bookingState.handoverDetails?.keysDelivered && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                      className="p-3 bg-[#181824] border border-white/[0.05] rounded-xl flex items-center gap-3">
                      <div className="w-5 h-5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full flex items-center justify-center shrink-0">
                        <MapPin size={10} />
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold">Pick-up Location Set</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Check map above. Meet the owner at the pickup location to collect keys.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Keys delivered, waiting for inspection */}
                  {bookingState.handoverDetails?.keysDelivered && !bookingState.handoverDetails?.vehicleInspected && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                      className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white text-xs font-bold">🔍 Vehicle Inspection Checklist</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Confirm you have received the keys and inspected the vehicle condition.</p>
                      </div>
                      <button 
                        onClick={() => handleActionClick('vehicle_inspected')} 
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-3 text-xs shrink-0 rounded-lg transition-all inline-flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Confirm Inspected
                      </button>
                    </motion.div>
                  )}

                  {/* Step 4: Final Handover Confirmation */}
                  {bookingState.handoverDetails?.vehicleInspected && !bookingState.handoverDetails?.handoverCompleted && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                      className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white text-xs font-bold">🏁 Complete Handover</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Vehicle inspection confirmed. Click to finalise the handover and start trip.</p>
                      </div>
                      <button 
                        onClick={() => handleActionClick('handover_completed')} 
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-3 text-xs shrink-0 rounded-lg transition-all inline-flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Complete Handover
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Text Messaging Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/[0.08] flex gap-2 bg-[#08080c]">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to coordinate handover..."
            disabled={loading}
            className="flex-1 input-field bg-[#12121a]/60 border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/40 transition-all"
          />
          <button 
            type="submit" 
            disabled={loading || sending || !inputText.trim()}
            className="btn-primary p-3 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Send size={16} />
          </button>
        </form>

        {/* Modal: Share Location Address */}
        <AnimatePresence>
          {showLocationModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              {/* Modal Backdrop */}
              <div 
                className="absolute inset-0 bg-black/75" 
                onClick={() => setShowLocationModal(false)} 
              />
              
              {/* Modal Box */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 w-full max-w-sm glass card-glow p-6 rounded-2xl border border-white/[0.08]"
              >
                <h4 className="text-white font-bold text-base mb-3 flex items-center gap-1.5">
                  <MapPin size={18} className="text-orange-400" /> Share Pickup Address
                </h4>
                
                <p className="text-slate-400 text-xs mb-4">
                  Provide exact details of where the vehicle is parked or where you plan to coordinate the key handover.
                </p>

                <textarea
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="e.g. Indiranagar Metro Station Exit A, opposite Starbucks"
                  className="w-full h-24 input-field bg-[#12121a] border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all resize-none mb-4"
                />

                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => setShowLocationModal(false)}
                    className="text-xs text-slate-400 hover:text-white px-3 py-2 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleShareLocation}
                    className="btn-primary text-xs py-2 px-4 rounded-lg font-bold"
                  >
                    Share location
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
