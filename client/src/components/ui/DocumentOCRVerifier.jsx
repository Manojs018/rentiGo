import React, { useState } from 'react';
import { 
  Upload, ShieldCheck, ShieldAlert, FileText, 
  Calendar, User, Sparkles, RefreshCw, AlertTriangle, CheckCircle 
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DocumentOCRVerifier({ onVerificationSuccess, onVerificationFailed }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // DL State
  const [dlFile, setDlFile] = useState(null);
  const [dlPreview, setDlPreview] = useState('');
  const [dlData, setDlData] = useState({
    number: '',
    nameOnDoc: '',
    expiryDate: '',
    imageUrl: '',
    status: 'unverified',
    validationMessage: ''
  });
  const [dlScanning, setDlScanning] = useState(false);
  const [dlProgress, setDlProgress] = useState('');

  // Aadhaar State
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState('');
  const [aadhaarData, setAadhaarData] = useState({
    number: '',
    nameOnDoc: '',
    imageUrl: '',
    status: 'unverified',
    validationMessage: ''
  });
  const [aadhaarScanning, setAadhaarScanning] = useState(false);
  const [aadhaarProgress, setAadhaarProgress] = useState('');

  // Helper to compress and convert to Base64
  const processImage = (file) => {
    return new Promise((resolve, reject) => {
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
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Run Tesseract OCR on Image
  const runOCR = async (base64Image, type) => {
    const setProgress = type === 'dl' ? setDlProgress : setAadhaarProgress;
    setProgress('Initializing OCR engine...');
    
    try {
      const result = await Tesseract.recognize(
        base64Image,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(`Scanning document: ${Math.round(m.progress * 100)}%`);
            } else {
              setProgress(m.status);
            }
          }
        }
      );
      
      const text = result.data.text;
      console.log(`[OCR Result - ${type}]:`, text);
      parseDocumentText(text, type, base64Image);
      toast.success(`${type === 'dl' ? 'Driving License' : 'Aadhaar Card'} scanned successfully!`);
    } catch (err) {
      console.error('OCR Error:', err);
      toast.error('OCR Text Extraction failed. Please fill out details manually.');
      setProgress('');
    }
  };

  // Smart regex parsing based on OCR text
  const parseDocumentText = (text, type, base64Image) => {
    const lines = text.split('\n').map(line => line.trim().toUpperCase());
    
    if (type === 'dl') {
      // 1. Find Driving License Number (e.g. GJ0120201234567 or DL-1234567890123)
      const dlRegex = /([A-Z]{2}[- ]?[0-9]{2}[- ]?[0-9]{11})|([A-Z]{2}[0-9]{13})/i;
      const matchDL = text.match(dlRegex);
      const dlNum = matchDL ? matchDL[0].replace(/[- ]/g, '').toUpperCase() : '';

      // 2. Find Expiry Date (often labeled EXP, VALID TILL, NT, TILL, etc.)
      let expiryDate = '';
      const dateRegex = /\b(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[012])[-/.](19|20)\d\d\b/;
      const altDateRegex = /\b(19|20)\d\d[-/.](0[1-9]|1[012])[-/.](0[1-9]|[12][0-9]|3[01])\b/;
      
      // Look for lines containing expiry keywords
      const expiryKeywords = ['EXP', 'VALID', 'TILL', 'N.T.', 'NT', 'COV'];
      let expiryLine = lines.find(line => expiryKeywords.some(keyword => line.includes(keyword)));
      
      if (expiryLine) {
        const matchExp = expiryLine.match(dateRegex) || expiryLine.match(altDateRegex);
        if (matchExp) expiryDate = formatParsedDate(matchExp[0]);
      }

      if (!expiryDate) {
        // Fallback: search all dates and pick the one furthest in the future
        const allDates = text.match(new RegExp(dateRegex, 'g')) || [];
        if (allDates.length > 0) {
          expiryDate = formatParsedDate(allDates[0]);
        }
      }

      // 3. Find Name
      let extractedName = '';
      const excludes = ['DRIVING', 'LICENSE', 'LICENCE', 'UNION', 'INDIA', 'STATE', 'TRANSPORT', 'AUTHORITY', 'FATHER', 'HUSBAND', 'ADDRESS', 'DATE', 'NAME'];
      const nameLines = lines.filter(line => {
        const words = line.split(/\s+/);
        return words.length >= 2 && words.length <= 4 && 
               !excludes.some(exc => line.includes(exc)) && 
               !/\d/.test(line);
      });
      
      const userWords = user?.name?.toUpperCase().split(/\s+/) || [];
      const bestLine = nameLines.find(line => userWords.some(word => line.includes(word)));
      if (bestLine) {
        extractedName = bestLine;
      } else if (nameLines.length > 0) {
        extractedName = nameLines[0];
      }

      setDlData(prev => ({
        ...prev,
        number: dlNum || prev.number,
        nameOnDoc: extractedName || prev.nameOnDoc || user?.name || '',
        expiryDate: expiryDate || prev.expiryDate,
        imageUrl: base64Image
      }));
    } else {
      // Aadhaar Card
      // 1. Find Aadhaar Number (12 digits, e.g., 1234 5678 9012)
      const aadhaarRegex = /\b\d{4}\s\d{4}\s\d{4}\b/;
      const rawAadhaarRegex = /\b\d{12}\b/;
      const matchAadhaar = text.match(aadhaarRegex) || text.match(rawAadhaarRegex);
      const aadhaarNum = matchAadhaar ? matchAadhaar[0].replace(/\s+/g, '') : '';

      // 2. Find Name
      let extractedName = '';
      const excludes = ['GOVERNMENT', 'INDIA', 'MALE', 'FEMALE', 'DOB', 'YEAR', 'UNIQUE', 'IDENTIFICATION', 'AUTHORITY', 'AADHAAR'];
      const nameLines = lines.filter(line => {
        const words = line.split(/\s+/);
        return words.length >= 2 && words.length <= 4 && 
               !excludes.some(exc => line.includes(exc)) && 
               !/\d/.test(line);
      });

      const userWords = user?.name?.toUpperCase().split(/\s+/) || [];
      const bestLine = nameLines.find(line => userWords.some(word => line.includes(word)));
      if (bestLine) {
        extractedName = bestLine;
      } else if (nameLines.length > 0) {
        extractedName = nameLines[0];
      }

      setAadhaarData(prev => ({
        ...prev,
        number: aadhaarNum || prev.number,
        nameOnDoc: extractedName || prev.nameOnDoc || user?.name || '',
        imageUrl: base64Image
      }));
    }
  };

  const formatParsedDate = (dateStr) => {
    try {
      const parts = dateStr.split(/[-/.]/);
      if (parts.length === 3) {
        if (parts[2].length === 4) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        } else if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
      }
      return dateStr;
    } catch {
      return '';
    }
  };

  const handleDlUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDlFile(file);
    setDlPreview(URL.createObjectURL(file));
    setDlScanning(true);

    try {
      const base64 = await processImage(file);
      await runOCR(base64, 'dl');
    } catch (err) {
      console.error(err);
      toast.error('Failed to read image. Please enter details manually.');
    } finally {
      setDlScanning(false);
      setDlProgress('');
    }
  };

  const handleAadhaarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAadhaarFile(file);
    setAadhaarPreview(URL.createObjectURL(file));
    setAadhaarScanning(true);

    try {
      const base64 = await processImage(file);
      await runOCR(base64, 'aadhaar');
    } catch (err) {
      console.error(err);
      toast.error('Failed to read image. Please enter details manually.');
    } finally {
      setAadhaarScanning(false);
      setAadhaarProgress('');
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!dlData.number || !dlData.expiryDate || !dlData.nameOnDoc) {
      toast.error('Please complete Driving License details');
      return;
    }
    if (!aadhaarData.number || !aadhaarData.nameOnDoc) {
      toast.error('Please complete Aadhaar Card details');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.verifyDocuments({
        drivingLicense: dlData,
        aadhaar: aadhaarData
      });

      if (res.data.success) {
        updateUser(res.data.user);
        
        if (res.data.user.verificationStatus === 'verified') {
          toast.success('Documents verified successfully! 🛡️');
          if (onVerificationSuccess) onVerificationSuccess(res.data.user);
        } else if (res.data.user.verificationStatus === 'rejected') {
          const dlMsg = res.data.user.verificationDetails?.drivingLicense?.validationMessage || '';
          const aadhaarMsg = res.data.user.verificationDetails?.aadhaar?.validationMessage || '';
          
          toast.error(`Verification Rejected: ${dlMsg || aadhaarMsg}`);
          
          setDlData(prev => ({
            ...prev,
            status: res.data.user.verificationDetails?.drivingLicense?.status,
            validationMessage: dlMsg
          }));
          setAadhaarData(prev => ({
            ...prev,
            status: res.data.user.verificationDetails?.aadhaar?.status,
            validationMessage: aadhaarMsg
          }));
          
          if (onVerificationFailed) onVerificationFailed(res.data.user);
        } else {
          toast.success('Documents submitted for verification.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div className="glass rounded-3xl p-6 border-white/5 space-y-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Sparkles className="text-orange-500 animate-pulse" size={20} />
          Automated Identity Verification
        </h3>
        <p className="text-slate-400 text-xs leading-normal">
          Upload your documents below. Our lightweight OCR scanner will read the details automatically.
          Please review the values and click submit. We use backend AI validation to instantly flag expired licenses.
        </p>
      </div>

      <form onSubmit={handleSubmitVerification} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Driving License Box */}
          <div className="glass rounded-3xl p-6 border-white/5 space-y-4 relative overflow-hidden">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <FileText size={16} className="text-orange-500" />
              Driving License
            </h4>

            {/* Upload Zone */}
            {!dlPreview ? (
              <label className="border-2 border-dashed border-white/10 hover:border-orange-500/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/[0.01] group">
                <Upload className="text-slate-500 group-hover:text-orange-500 transition-colors mb-3" size={28} />
                <span className="text-white text-xs font-semibold">Upload License Image</span>
                <span className="text-[10px] text-slate-500 mt-1">PNG, JPG or WEBP (Max 5MB)</span>
                <input type="file" accept="image/*" onChange={handleDlUpload} className="hidden" />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 bg-dark-950 flex items-center justify-center">
                  <img src={dlPreview} alt="Driving License Preview" className="w-full h-full object-cover" />
                  
                  {/* OCR Scanning Overlay */}
                  {dlScanning && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <div className="text-[11px] font-bold text-orange-400 animate-pulse">{dlProgress}</div>
                      
                      {/* Scanning laser visual effect */}
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent top-0 animate-scanner-scan" />
                    </div>
                  )}

                  {!dlScanning && (
                    <button 
                      type="button" 
                      onClick={() => { setDlPreview(''); setDlFile(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-slate-400 hover:text-white transition-colors text-xs"
                    >
                      Change Image
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* DL Details form */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">License Number</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. GJ0120201234567"
                    className="input-field py-2.5 pl-9 text-xs"
                    value={dlData.number}
                    onChange={e => setDlData({ ...dlData, number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Full Name on DL</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Rahul Sharma"
                      className="input-field py-2.5 pl-9 text-xs"
                      value={dlData.nameOnDoc}
                      onChange={e => setDlData({ ...dlData, nameOnDoc: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Expiry Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="date"
                      className="input-field py-2.5 pl-9 text-xs"
                      value={dlData.expiryDate}
                      onChange={e => setDlData({ ...dlData, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {dlData.status === 'rejected' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="text-[10px] text-red-400 font-semibold">{dlData.validationMessage}</div>
                </div>
              )}
            </div>
          </div>

          {/* Aadhaar Card Box */}
          <div className="glass rounded-3xl p-6 border-white/5 space-y-4 relative overflow-hidden">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <FileText size={16} className="text-orange-500" />
              Aadhaar Card
            </h4>

            {/* Upload Zone */}
            {!aadhaarPreview ? (
              <label className="border-2 border-dashed border-white/10 hover:border-orange-500/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/[0.01] group">
                <Upload className="text-slate-500 group-hover:text-orange-500 transition-colors mb-3" size={28} />
                <span className="text-white text-xs font-semibold">Upload Aadhaar Image</span>
                <span className="text-[10px] text-slate-500 mt-1">PNG, JPG or WEBP (Max 5MB)</span>
                <input type="file" accept="image/*" onChange={handleAadhaarUpload} className="hidden" />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 bg-dark-950 flex items-center justify-center">
                  <img src={aadhaarPreview} alt="Aadhaar Preview" className="w-full h-full object-cover" />
                  
                  {/* OCR Scanning Overlay */}
                  {aadhaarScanning && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <div className="text-[11px] font-bold text-orange-400 animate-pulse">{aadhaarProgress}</div>
                      
                      {/* Scanning laser visual effect */}
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent top-0 animate-scanner-scan" />
                    </div>
                  )}

                  {!aadhaarScanning && (
                    <button 
                      type="button" 
                      onClick={() => { setAadhaarPreview(''); setAadhaarFile(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-slate-400 hover:text-white transition-colors text-xs"
                    >
                      Change Image
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Aadhaar Details form */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Aadhaar Card Number</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. 1234 5678 9012"
                    className="input-field py-2.5 pl-9 text-xs"
                    value={aadhaarData.number}
                    onChange={e => setAadhaarData({ ...aadhaarData, number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Full Name on Aadhaar</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Rahul Sharma"
                    className="input-field py-2.5 pl-9 text-xs"
                    value={aadhaarData.nameOnDoc}
                    onChange={e => setAadhaarData({ ...aadhaarData, nameOnDoc: e.target.value })}
                    required
                  />
                </div>
              </div>

              {aadhaarData.status === 'rejected' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="text-[10px] text-red-400 font-semibold">{aadhaarData.validationMessage}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || dlScanning || aadhaarScanning} 
          className="btn-primary w-full py-4 justify-center text-sm mt-4"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting Verification...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              🛡️ Submit Documents & Verify Profile
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
