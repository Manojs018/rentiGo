import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ArrowLeft, Wand2, Compass, Check, 
  Car as CarIcon, Bike, Landmark, ShieldAlert, Zap,
  AlertCircle, Fuel, Settings, MapPin, Star, Volume2, Briefcase
} from 'lucide-react';
import { vehicleAPI } from '../../services/api';
import toast from 'react-hot-toast';

const vehicleIcons = {
  car: '🚗',
  suv: '🚙',
  bike: '🏍️',
  activa: '🛵',
  taxi: '🚖'
};

const purposeOptions = [
  { id: 'daily', label: 'Daily Commute', desc: 'City drives, office runs, and daily errands', icon: '🚗' },
  { id: 'family', label: 'Family Outing', desc: 'Comfortable, spacious rides for everyone', icon: '👨‍👩‍👧‍👦' },
  { id: 'adventure', label: 'Adventure / Offroad', desc: 'Gravel roads, mountain trails, and touring', icon: '⛰️' },
  { id: 'business', label: 'Business Executive', desc: 'Premium, clean rides for client meetings', icon: '💼' }
];

const terrainOptions = [
  { id: 'city', label: 'City & Highways', desc: 'Paved streets, expressways, and urban areas', icon: '🏙️' },
  { id: 'gravel', label: 'Gravel & Mountain Paths', desc: 'Rough trails, unpaved terrain, and steep inclines', icon: '⛰️' }
];

const luggageOptions = [
  { id: 'light', label: 'Light Luggage', desc: '🎒 Backpacks or carry-ons only' },
  { id: 'medium', label: 'Medium Luggage', desc: '🧳 A few medium-sized suitcases' },
  { id: 'heavy', label: 'Heavy Luggage', desc: '📦 Large boxes or multiple heavy suitcases' }
];

const fuelOptions = [
  { id: 'any', label: 'Any Fuel' },
  { id: 'petrol', label: 'Petrol Only' },
  { id: 'diesel', label: 'Diesel Only' },
  { id: 'electric', label: '100% Electric (Eco)' },
  { id: 'cng', label: 'CNG (Economical)' },
  { id: 'hybrid', label: 'Hybrid' }
];

const transmissionOptions = [
  { id: 'any', label: 'Any Gearbox' },
  { id: 'manual', label: 'Manual Shift' },
  { id: 'automatic', label: 'Automatic Transmission' }
];

export default function SmartRideWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    purpose: 'daily',
    terrain: 'city',
    passengers: 2,
    luggage: 'light',
    fuel: 'any',
    transmission: 'any'
  });
  
  const [fleet, setFleet] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingFleet, setLoadingFleet] = useState(true);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [analysisMessageIndex, setAnalysisMessageIndex] = useState(0);

  const analysisMessages = [
    "Initializing recommendation engine...",
    "Querying active fleet registry...",
    "Analyzing terrain durability parameters...",
    "Correlating cabin space vs. passenger count...",
    "Evaluating fuel economy & gearbox ratings...",
    "Calculating final match percentages..."
  ];

  // Fetch approved fleet
  useEffect(() => {
    const loadFleet = async () => {
      try {
        const { data } = await vehicleAPI.getAll({ limit: 100 });
        if (data && data.success && data.data && data.data.length > 0) {
          setFleet(data.data);
        } else {
          // Trigger fallback mock data if no vehicles in db
          useFallbackFleet();
        }
      } catch (error) {
        console.warn('API error fetching fleet, using local mock fleet:', error);
        useFallbackFleet();
      } finally {
        setLoadingFleet(false);
      }
    };
    loadFleet();
  }, []);

  const useFallbackFleet = () => {
    const mockVehicles = [
      { _id: '1', brand: 'Honda', model: 'City', type: 'car', dailyPrice: 2500, fuelType: 'petrol', transmission: 'manual', city: 'ahmedabad', rating: 4.8, isAvailable: true, seats: 5, features: ['AC', 'Music System', 'Boot Space'] },
      { _id: '2', brand: 'Hyundai', model: 'Creta', type: 'suv', dailyPrice: 3500, fuelType: 'diesel', transmission: 'automatic', city: 'surat', rating: 4.9, isAvailable: true, seats: 5, features: ['AWD', 'Panoramic Sunroof', 'AC'] },
      { _id: '3', brand: 'Royal Enfield', model: 'Classic 350', type: 'bike', dailyPrice: 800, fuelType: 'petrol', transmission: 'manual', city: 'ahmedabad', rating: 4.7, isAvailable: true, seats: 2, features: ['Cruiser', 'Safety Guard'] },
      { _id: '4', brand: 'Honda', model: 'Activa 6G', type: 'activa', dailyPrice: 450, fuelType: 'petrol', transmission: 'automatic', city: 'vadodara', rating: 4.6, isAvailable: true, seats: 2, features: ['Underseat Storage', 'Lightweight'] },
      { _id: '5', brand: 'Tata', model: 'Nexon EV', type: 'suv', dailyPrice: 3000, fuelType: 'electric', transmission: 'automatic', city: 'ahmedabad', rating: 4.8, isAvailable: true, seats: 5, features: ['EV Charging', 'Touchscreen', 'Spacious'] },
      { _id: '6', brand: 'Toyota', model: 'Camry Hybrid', type: 'car', dailyPrice: 5000, fuelType: 'hybrid', transmission: 'automatic', city: 'ahmedabad', rating: 4.9, isAvailable: true, seats: 5, features: ['Premium Interiors', 'Hybrid Tech', 'Silent Drive'] },
      { _id: '7', brand: 'Maruti Suzuki', model: 'WagonR CNG', type: 'car', dailyPrice: 1200, fuelType: 'cng', transmission: 'manual', city: 'ahmedabad', rating: 4.5, isAvailable: true, seats: 5, features: ['Compact', 'CNG Cylinder'] },
      { _id: '8', brand: 'Toyota', model: 'Innova Crysta', type: 'taxi', dailyPrice: 4000, fuelType: 'diesel', transmission: 'manual', city: 'rajkot', rating: 4.8, isAvailable: true, seats: 7, features: ['Dual AC', 'Large Boot', 'Captain Seats'] }
    ];
    setFleet(mockVehicles);
  };

  // Run analysis message rotation
  useEffect(() => {
    let interval;
    if (runningAnalysis) {
      interval = setInterval(() => {
        setAnalysisMessageIndex(prev => (prev + 1) % analysisMessages.length);
      }, 400);
    }
    return () => clearInterval(interval);
  }, [runningAnalysis]);

  const calculateMatchScore = (vehicle, answers) => {
    let score = 0;
    const type = vehicle.type?.toLowerCase();
    const fuel = vehicle.fuelType?.toLowerCase();
    const seats = vehicle.seats || (type === 'suv' || type === 'taxi' ? 7 : type === 'car' ? 5 : 2);
    const transmission = vehicle.transmission?.toLowerCase();
    
    // 1. Purpose (Max 25 pts)
    const purpose = answers.purpose;
    if (purpose === 'daily') {
      if (type === 'activa' || type === 'bike') score += 25;
      else if (type === 'car' && (fuel === 'electric' || fuel === 'hybrid' || fuel === 'cng')) score += 25;
      else if (type === 'car') score += 18;
      else if (type === 'suv') score += 12;
      else if (type === 'taxi') score += 8;
    } else if (purpose === 'family') {
      if (type === 'suv' || type === 'taxi') {
        if (seats >= 6) score += 25;
        else score += 20;
      }
      else if (type === 'car') {
        if (seats >= 5) score += 22;
        else score += 12;
      }
      else score += 0; // Bike / Scooters are not for families
    } else if (purpose === 'adventure') {
      if (type === 'suv') score += 25;
      else if (type === 'bike') score += 20;
      else if (type === 'car') score += 12;
      else if (type === 'activa') score += 5;
      else score += 2;
    } else if (purpose === 'business') {
      if (type === 'car') {
        if (transmission === 'automatic') score += 25;
        else score += 20;
      } else if (type === 'suv') {
        if (transmission === 'automatic') score += 22;
        else score += 16;
      } else if (type === 'taxi') score += 10;
      else score += 2;
    }
    
    // 2. Terrain Profile (Max 25 pts)
    const terrain = answers.terrain;
    if (terrain === 'city') {
      score += 25; // All vehicles can operate on city roads
    } else if (terrain === 'gravel') {
      if (type === 'suv') score += 25;
      else if (type === 'bike') score += 18;
      else if (type === 'car') score += 10;
      else if (type === 'taxi') score += 6;
      else if (type === 'activa') score += 2;
    }
    
    // 3. Passengers & Luggage (Max 25 pts)
    // Passenger count (15 pts)
    const passengers = Number(answers.passengers);
    if (passengers <= seats) {
      score += 15;
    } else {
      const gap = passengers - seats;
      if (gap === 1) score += 10;
      else if (gap === 2) score += 5;
      else score += 0;
    }
    // Luggage volume (10 pts)
    const luggage = answers.luggage;
    if (luggage === 'light') {
      score += 10;
    } else if (luggage === 'medium') {
      if (type === 'suv' || type === 'taxi' || type === 'car') score += 10;
      else score += 4;
    } else if (luggage === 'heavy') {
      if (type === 'suv' || type === 'taxi') score += 10;
      else if (type === 'car') score += 6;
      else score += 0;
    }
    
    // 4. Fuel & Gearbox Preference (Max 25 pts)
    // Fuel Match (12.5 pts)
    const prefFuel = answers.fuel;
    if (prefFuel === 'any') {
      score += 12.5;
    } else if (prefFuel === fuel) {
      score += 12.5;
    } else if ((prefFuel === 'electric' || prefFuel === 'hybrid') && (fuel === 'electric' || fuel === 'hybrid')) {
      score += 9;
    } else {
      score += 0;
    }
    // Transmission Match (12.5 pts)
    const prefTrans = answers.transmission;
    if (prefTrans === 'any') {
      score += 12.5;
    } else if (prefTrans === transmission) {
      score += 12.5;
    } else {
      score += 0;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const triggerAnalysis = () => {
    setRunningAnalysis(true);
    setAnalysisMessageIndex(0);
    
    setTimeout(() => {
      // Perform matching and sorting
      const scoredList = fleet.map(vehicle => {
        const score = calculateMatchScore(vehicle, answers);
        return { ...vehicle, matchScore: score };
      });
      
      // Sort by score descending
      scoredList.sort((a, b) => b.matchScore - a.matchScore);
      
      setRecommendations(scoredList);
      setRunningAnalysis(false);
      setStep(5); // Move to Results page
    }, 2400);
  };

  const handleReset = () => {
    setAnswers({
      purpose: 'daily',
      terrain: 'city',
      passengers: 2,
      luggage: 'light',
      fuel: 'any',
      transmission: 'any'
    });
    setStep(1);
    setRecommendations([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      
      {/* Wizard card container */}
      <div className="glass rounded-3xl border border-white/[0.08] shadow-[0_15px_50px_rgba(0,0,0,0.5)] bg-gradient-to-br from-white/[0.01] to-white/[0.03] overflow-hidden p-6 sm:p-10">
        
        {/* Progress Bar (Visible for Steps 1-4) */}
        {step <= 4 && (
          <div className="mb-10">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
              <span>Step {step} of 4</span>
              <span>{Math.round(((step - 1) / 4) * 100)}% Complete</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: TRIP PURPOSE */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-left"
            >
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-2">
                <Compass className="text-orange-500 animate-pulse" />
                Select Trip Purpose
              </h3>
              <p className="text-slate-400 text-sm sm:text-base mb-8">
                What is the primary objective of your journey? This helps us determine appropriate vehicle efficiency and styles.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {purposeOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setAnswers({ ...answers, purpose: opt.id })}
                    className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                      answers.purpose === opt.id
                        ? 'bg-orange-500/10 border-orange-500 shadow-glow-sm'
                        : 'glass border-white/10 hover:border-white/20 hover:bg-white/[0.01]'
                    }`}
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{opt.icon}</span>
                    <div>
                      <h4 className="text-white font-bold text-base mb-1">{opt.label}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">{opt.desc}</p>
                    </div>
                    {answers.purpose === opt.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white font-bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-10 flex justify-end">
                <button onClick={nextStep} className="btn-primary py-3.5 px-7 rounded-xl">
                  Next Step <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: TERRAIN PROFILE */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-left"
            >
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-2">
                <Compass className="text-orange-500" />
                Select Terrain Profile
              </h3>
              <p className="text-slate-400 text-sm sm:text-base mb-8">
                What kind of road profile will your ride be maneuvering through? We filter drivetrain suitability accordingly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {terrainOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setAnswers({ ...answers, terrain: opt.id })}
                    className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                      answers.terrain === opt.id
                        ? 'bg-orange-500/10 border-orange-500 shadow-glow-sm'
                        : 'glass border-white/10 hover:border-white/20 hover:bg-white/[0.01]'
                    }`}
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{opt.icon}</span>
                    <div>
                      <h4 className="text-white font-bold text-base mb-1">{opt.label}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">{opt.desc}</p>
                    </div>
                    {answers.terrain === opt.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white font-bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-10 flex justify-between">
                <button onClick={prevStep} className="btn-ghost py-3.5 px-6 rounded-xl">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={nextStep} className="btn-primary py-3.5 px-7 rounded-xl">
                  Next Step <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PASSENGER & LUGGAGE CAPACITY */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-left"
            >
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-2">
                <Compass className="text-orange-500" />
                Cabin Requirements
              </h3>
              <p className="text-slate-400 text-sm sm:text-base mb-8">
                How many passengers will be on board, and what luggage capacity will you need?
              </p>

              {/* Passenger Selector */}
              <div className="mb-8">
                <label className="text-slate-300 text-sm uppercase tracking-wider font-bold block mb-4">Passenger Count</label>
                <div className="flex flex-wrap gap-2.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAnswers({ ...answers, passengers: num })}
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-sm transition-all ${
                        answers.passengers === num
                          ? 'bg-orange-500 border-orange-500 text-white shadow-glow-sm'
                          : 'glass border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500 block mt-2">
                  {answers.passengers <= 2 ? '👥 Solo traveler or couple' : answers.passengers <= 4 ? '👨‍👩‍👧 Small family unit' : '🚌 Large Group / Commuter capacity needed'}
                </span>
              </div>

              {/* Luggage Selectors */}
              <div className="mb-6">
                <label className="text-slate-300 text-sm uppercase tracking-wider font-bold block mb-4">Luggage Volume</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {luggageOptions.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, luggage: opt.id })}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        answers.luggage === opt.id
                          ? 'bg-orange-500/10 border-orange-500 shadow-glow-sm'
                          : 'glass border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-white font-bold text-sm block mb-1">{opt.label}</span>
                      <span className="text-slate-400 text-xs">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex justify-between">
                <button onClick={prevStep} className="btn-ghost py-3.5 px-6 rounded-xl">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={nextStep} className="btn-primary py-3.5 px-7 rounded-xl">
                  Next Step <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PREFERENCES */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-left"
            >
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-2">
                <Compass className="text-orange-500" />
                Drive Preferences
              </h3>
              <p className="text-slate-400 text-sm sm:text-base mb-8">
                Fine-tune your drive configuration. Select fuel constraints and transmission style.
              </p>

              {/* Fuel Type */}
              <div className="mb-8">
                <label className="text-slate-300 text-sm uppercase tracking-wider font-bold block mb-4">Fuel Type Preference</label>
                <div className="flex flex-wrap gap-2.5">
                  {fuelOptions.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, fuel: opt.id })}
                      className={`px-4.5 py-2.5 rounded-xl border font-bold text-xs uppercase transition-all ${
                        answers.fuel === opt.id
                          ? 'bg-orange-500 border-orange-500 text-white shadow-glow-sm'
                          : 'glass border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transmission Type */}
              <div className="mb-6">
                <label className="text-slate-300 text-sm uppercase tracking-wider font-bold block mb-4">Transmission Preference</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {transmissionOptions.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, transmission: opt.id })}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        answers.transmission === opt.id
                          ? 'bg-orange-500/10 border-orange-500 shadow-glow-sm'
                          : 'glass border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-white font-bold text-sm block">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex justify-between">
                <button onClick={prevStep} className="btn-ghost py-3.5 px-6 rounded-xl">
                  <ArrowLeft size={16} /> Back
                </button>
                <button 
                  onClick={triggerAnalysis} 
                  disabled={runningAnalysis}
                  className="btn-primary py-3.5 px-8 rounded-xl shadow-glow"
                >
                  <Wand2 size={16} />
                  <span>{runningAnalysis ? 'Analyzing...' : 'Find Matches'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* DYNAMIC SCANNERS RUNNING (HOLOGRAPHIC OVERLAY) */}
          {runningAnalysis && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-dark-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6"
            >
              {/* Spinning scanning ring */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-orange-500/20" />
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-orange-500"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                />
                <Compass size={40} className="text-orange-500 animate-pulse" />
              </div>

              <motion.h4 
                className="text-white font-bold text-lg mt-8 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                AI Recommender Scan
              </motion.h4>
              
              <AnimatePresence mode="wait">
                <motion.p
                  key={analysisMessageIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-orange-400 font-medium text-xs mt-3 text-center uppercase tracking-widest max-w-sm"
                >
                  {analysisMessages[analysisMessageIndex]}
                </motion.p>
              </AnimatePresence>

              {/* Tiny details box */}
              <div className="mt-8 text-[10px] text-slate-500 font-mono flex items-center gap-1.5 glass px-3 py-1.5 rounded-lg border-white/5">
                <Zap size={10} className="text-orange-500" />
                <span>INPUT_VECTOR: [Purpose: {answers.purpose}, Terrain: {answers.terrain}, Pass: {answers.passengers}, Lug: {answers.luggage}]</span>
              </div>
            </motion.div>
          )}

          {/* STEP 5: RESULTS SCREEN */}
          {step === 5 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-left"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                    <Sparkles size={24} className="text-orange-500 fill-orange-500/20" />
                    AI Recommended Matches
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    We ranked {recommendations.length} vehicles based on compatibility with your trip criteria.
                  </p>
                </div>
                <button 
                  onClick={handleReset}
                  className="btn-ghost text-xs py-2 px-4 rounded-lg flex items-center gap-1.5"
                >
                  <ArrowLeft size={12} /> Restart Quiz
                </button>
              </div>

              {/* Recommended Fleet Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.slice(0, 4).map((vehicle, idx) => {
                  const matchColor = 
                    vehicle.matchScore >= 85 ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                    vehicle.matchScore >= 60 ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
                    'text-slate-400 border-white/10 bg-white/5';
                  
                  return (
                    <motion.div
                      key={vehicle._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass card-glow rounded-2xl overflow-hidden border border-white/[0.08] hover:border-orange-500/30 transition-all duration-300 relative group flex flex-col justify-between"
                    >
                      {/* Top ribbon: match percentage */}
                      <div className="absolute top-4 right-4 z-10">
                        <span className={`text-[11px] font-black tracking-wider uppercase px-3 py-1.5 rounded-full border shadow-lg ${matchColor}`}>
                          {vehicle.matchScore}% Match
                        </span>
                      </div>

                      {/* Header visual */}
                      <div className="h-32 bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center relative overflow-hidden">
                        <span className="text-7xl relative z-10 group-hover:scale-115 transition-transform duration-300">
                          {vehicleIcons[vehicle.type] || '🚗'}
                        </span>
                        
                        {/* Background subtle badge */}
                        <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
                        
                        {/* Ideal Tag */}
                        {idx === 0 && (
                          <span className="absolute top-4 left-4 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                            ★ Absolute Best Fit
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-white font-bold text-lg">{vehicle.brand} {vehicle.model}</h4>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                <span className="text-amber-400 text-[10px] font-bold">{vehicle.rating || 4.5}</span>
                                <span className="text-slate-500 text-[10px]">(Verified)</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-orange-400 font-extrabold text-lg">₹{vehicle.dailyPrice.toLocaleString()}</span>
                              <span className="text-slate-500 text-[9px] block uppercase tracking-tighter">per day</span>
                            </div>
                          </div>

                          {/* Quick specs chips */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <span className="text-[10px] bg-white/5 border border-white/5 text-slate-300 py-1 px-2.5 rounded-lg flex items-center gap-1 font-medium capitalize">
                              <Fuel size={10} className="text-orange-400" />
                              {vehicle.fuelType}
                            </span>
                            <span className="text-[10px] bg-white/5 border border-white/5 text-slate-300 py-1 px-2.5 rounded-lg flex items-center gap-1 font-medium capitalize">
                              <Settings size={10} className="text-orange-400" />
                              {vehicle.transmission}
                            </span>
                            <span className="text-[10px] bg-white/5 border border-white/5 text-slate-300 py-1 px-2.5 rounded-lg flex items-center gap-1 font-medium capitalize">
                              👥 {vehicle.seats || 5} Seats
                            </span>
                          </div>

                          {/* Features or logic explanation */}
                          <div className="border-t border-white/5 pt-3.5 mb-4 text-xs text-slate-400 space-y-1.5">
                            {answers.terrain === 'gravel' && vehicle.type === 'suv' && (
                              <div className="flex items-center gap-1.5 text-green-400 font-medium">
                                <span className="text-xs">✓</span> Excellent AWD/SUV suspension clearance
                              </div>
                            )}
                            {answers.purpose === 'daily' && (vehicle.fuelType === 'electric' || vehicle.fuelType === 'cng') && (
                              <div className="flex items-center gap-1.5 text-green-400 font-medium">
                                <span className="text-xs">✓</span> Highly efficient city commuting fuel-economy
                              </div>
                            )}
                            {answers.passengers <= (vehicle.seats || 5) && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <span className="text-xs text-slate-500">✓</span> Comfortably accommodates {answers.passengers} passengers
                              </div>
                            )}
                            {vehicle.features && vehicle.features.slice(0, 2).map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-1.5 text-slate-500">
                                <span className="text-xs text-slate-600">▪</span> {feat}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Booking navigation CTA */}
                        <button
                          onClick={() => {
                            if (vehicle.isAvailable) {
                              navigate('/booking', { state: { vehicleId: vehicle._id } });
                            } else {
                              toast.error("This recommended ride is currently out on booking.");
                            }
                          }}
                          className={`w-full text-center py-3 rounded-xl text-xs font-bold transition-all ${
                            vehicle.isAvailable
                              ? 'btn-primary shadow-glow-sm'
                              : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {vehicle.isAvailable ? '🚕 Instant Booking' : 'Booked Out'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
