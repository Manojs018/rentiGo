import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, MapPin, Key, CheckCircle2, ShieldCheck, 
  Clock, Navigation, MessageSquare, AlertCircle, Compass,
  Camera, Trash2, Plus, Edit3, Image as ImageIcon
} from 'lucide-react';
import { messageAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import VehicleDamageVector from './VehicleDamageVector';

export default function HandoverChatCoordinator({ booking, currentUser, onClose, onBookingUpdated }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [bookingState, setBookingState] = useState(booking);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'inspect'
  const [selectedPin, setSelectedPin] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [pinForm, setPinForm] = useState({
    id: '',
    x: 0,
    y: 0,
    part: '',
    type: 'scratch',
    notes: '',
    photo: ''
  });

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
      };
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedBase64 = await compressImage(file);
      setPinForm(prev => ({ ...prev, photo: compressedBase64 }));
      toast.success('Validation photo loaded & compressed!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to process image');
    }
  };

  const handleInitiatePin = (x, y, inferredPart) => {
    setPinForm({
      id: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      part: inferredPart,
      type: 'scratch',
      notes: '',
      photo: ''
    });
    setIsEditingPin(false);
    setShowPinModal(true);
  };

  const handleSelectPin = (pin) => {
    setSelectedPin(pin);
    setPinForm({ ...pin });
    setIsEditingPin(true);
    setShowPinModal(true);
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!pinForm.part.trim()) {
      toast.error('Please specify the affected vehicle part');
      return;
    }

    const currentRole = isOwner ? 'owner' : 'customer';
    const finalPin = {
      ...pinForm,
      reportedBy: isEditingPin ? pinForm.reportedBy : currentRole,
      createdAt: isEditingPin ? pinForm.createdAt : new Date()
    };

    let updatedPins = [];
    if (isEditingPin) {
      updatedPins = (bookingState.damagePins || []).map(p => p.id === finalPin.id ? finalPin : p);
    } else {
      updatedPins = [...(bookingState.damagePins || []), finalPin];
    }

    try {
      const { data } = await messageAPI.updateDamagePins(bookingState._id, updatedPins);
      setBookingState(data.data);
      if (onBookingUpdated) onBookingUpdated(data.data);
      setShowPinModal(false);
      setSelectedPin(null);
      toast.success(isEditingPin ? 'Damage report updated!' : 'Damage pin added successfully!');
      
      const actionText = isEditingPin ? 'updated a' : 'reported a new';
      await messageAPI.sendMessage(bookingState._id, {
        content: `🛠️ ${currentUser?.name} (${currentRole}) ${actionText} cosmetic damage: ${finalPin.type.toUpperCase()} on ${finalPin.part}. Note: "${finalPin.notes || 'None'}"`,
        type: 'text'
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save damage pin');
    }
  };

  const handleDeletePin = async (pinId) => {
    const pinToDelete = (bookingState.damagePins || []).find(p => p.id === pinId);
    if (!pinToDelete) return;
    
    const currentRole = isOwner ? 'owner' : 'customer';
    if (pinToDelete.reportedBy !== currentRole) {
      toast.error("You cannot delete a pin reported by the other user.");
      return;
    }

    const updatedPins = (bookingState.damagePins || []).filter(p => p.id !== pinId);
    try {
      const { data } = await messageAPI.updateDamagePins(bookingState._id, updatedPins);
      setBookingState(data.data);
      if (onBookingUpdated) onBookingUpdated(data.data);
      setShowPinModal(false);
      setSelectedPin(null);
      toast.success('Damage pin removed');
      
      await messageAPI.sendMessage(bookingState._id, {
        content: `🗑️ ${currentUser?.name} (${currentRole}) removed a cosmetic damage pin for the ${pinToDelete.part}.`,
        type: 'text'
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete damage pin');
    }
  };

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
        className={`relative z-10 w-full ${activeTab === 'inspect' ? 'max-w-2xl' : 'max-w-lg'} h-full bg-[#0a0a0f] border-l border-white/[0.08] flex flex-col shadow-2xl transition-all duration-300`}
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/[0.08] bg-[#0c0c14]/80">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'text-orange-500 border-orange-500 bg-orange-500/5'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <MessageSquare size={14} /> Secure Chat
          </button>
          <button
            onClick={() => setActiveTab('inspect')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'inspect'
                ? 'text-orange-500 border-orange-500 bg-orange-500/5'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <ShieldCheck size={14} /> Damage Inspection
          </button>
        </div>

        {/* Tab content: Secure Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
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
      </div>
    )}

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

        {/* Tab content: Damage Inspection */}
        {activeTab === 'inspect' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable container for vector and list of damage pins */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <VehicleDamageVector 
                type={bookingState.vehicle?.type} 
                pins={bookingState.damagePins || []} 
                onAddPin={handleInitiatePin}
                onSelectPin={handleSelectPin}
                selectedPinId={selectedPin?.id}
              />

              {/* Reported Damage Items List */}
              <div className="space-y-3">
                <h4 className="text-white font-bold text-sm flex items-center gap-2 border-b border-white/[0.05] pb-2">
                  <ShieldCheck className="text-orange-500" size={16} /> Cosmetic Damage Logs ({bookingState.damagePins?.length || 0})
                </h4>

                {(!bookingState.damagePins || bookingState.damagePins.length === 0) ? (
                  <div className="text-center py-8 text-xs text-slate-500 bg-[#0d0d15]/30 rounded-xl border border-white/[0.04] p-4">
                    No cosmetic damage reported. Tap the schematic above to add color-coded pins.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {bookingState.damagePins.map((pin) => {
                      const isMe = pin.reportedBy === (isOwner ? 'owner' : 'customer');
                      return (
                        <div 
                          key={pin.id}
                          onClick={() => handleSelectPin(pin)}
                          className="bg-[#0e0e16]/60 border border-white/[0.05] hover:border-orange-500/20 rounded-xl p-3 flex gap-3 items-start cursor-pointer hover:bg-white/[0.01] transition-all"
                        >
                          {pin.photo ? (
                            <img 
                              src={pin.photo} 
                              alt={pin.part} 
                              className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/[0.08]" 
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-black/40 border border-white/[0.05] flex flex-col items-center justify-center text-slate-500 shrink-0">
                              <ImageIcon size={18} className="text-slate-600" />
                              <span className="text-[8px] mt-1 font-semibold text-slate-600">No Image</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white font-bold text-xs truncate">{pin.part}</span>
                              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-extrabold ${
                                pin.type === 'scratch' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                pin.type === 'dent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                pin.type === 'crack' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              }`}>
                                {pin.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 select-text">{pin.notes || 'No description provided.'}</p>
                            <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500">
                              <span>By: <strong className="text-slate-300 font-semibold">{pin.reportedBy === 'owner' ? 'Owner' : 'Customer'}</strong> {isMe && '(You)'}</span>
                              <span>{new Date(pin.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add/Edit Damage Pin */}
        <AnimatePresence>
          {showPinModal && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
              {/* Modal Backdrop */}
              <div 
                className="absolute inset-0 bg-black/75" 
                onClick={() => {
                  setShowPinModal(false);
                  setSelectedPin(null);
                }} 
              />
              
              {/* Modal Box */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 w-full max-w-sm glass card-glow p-5 rounded-2xl border border-white/[0.08] max-h-[90vh] overflow-y-auto flex flex-col"
              >
                <h4 className="text-white font-bold text-base mb-3 flex items-center gap-1.5">
                  <ShieldCheck size={18} className="text-orange-400" /> 
                  {isEditingPin ? 'Edit Damage Report' : 'Report Vehicle Damage'}
                </h4>
                
                <form onSubmit={handleSavePin} className="space-y-4 flex-1">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5">Vehicle Part</label>
                    <input
                      type="text"
                      value={pinForm.part}
                      onChange={(e) => setPinForm(prev => ({ ...prev, part: e.target.value }))}
                      placeholder="e.g. Front Bumper, Left Door"
                      className="w-full input-field bg-[#12121a] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5">Damage Type</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['scratch', 'dent', 'crack', 'other'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPinForm(prev => ({ ...prev, type: t }))}
                          className={`py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all ${
                            pinForm.type === t
                              ? t === 'scratch' ? 'bg-amber-500/10 text-amber-400 border-amber-500' :
                                t === 'dent' ? 'bg-red-500/10 text-red-400 border-red-500' :
                                t === 'crack' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500' :
                                'bg-cyan-500/10 text-cyan-400 border-cyan-500'
                              : 'bg-black/20 text-slate-500 border-white/[0.04] hover:text-slate-300'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5">Description & Notes</label>
                    <textarea
                      value={pinForm.notes}
                      onChange={(e) => setPinForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Describe the damage (e.g. 3-inch scratch, minor paint scrape)"
                      className="w-full h-20 input-field bg-[#12121a] border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5">Validation Photo</label>
                    <div className="space-y-2">
                      {pinForm.photo ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08] bg-black/40">
                          <img src={pinForm.photo} alt="Validation" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPinForm(prev => ({ ...prev, photo: '' }))}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-24 border border-dashed border-white/[0.08] hover:border-orange-500/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.01] transition-all">
                          <Camera size={20} className="text-slate-500" />
                          <span className="text-[10px] font-bold text-slate-400 mt-1">Upload Photo</span>
                          <span className="text-[8px] text-slate-600 mt-0.5">JPEG, PNG up to 10MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-between pt-2 border-t border-white/[0.05]">
                    {isEditingPin && pinForm.reportedBy === (isOwner ? 'owner' : 'customer') ? (
                      <button
                        type="button"
                        onClick={() => handleDeletePin(pinForm.id)}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 text-xs py-2 px-3 rounded-lg font-bold inline-flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    ) : <div />}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPinModal(false);
                          setSelectedPin(null);
                        }}
                        className="text-xs text-slate-400 hover:text-white px-3 py-2 transition-all font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary text-xs py-2 px-4 rounded-lg font-bold"
                      >
                        Save Pin
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
