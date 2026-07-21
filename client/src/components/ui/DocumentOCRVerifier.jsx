import React from 'react';

export default function DocumentOCRVerifier({ user, onVerificationComplete }) {
  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-200">
      <h4 className="text-md font-semibold text-orange-500 mb-2">Document Verification</h4>
      <p className="text-xs text-slate-400 mb-4">Upload Driving License & Aadhaar card for instant verification.</p>
      <button
        onClick={() => onVerificationComplete && onVerificationComplete({ status: 'verified' })}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg"
      >
        Simulate Quick Verification
      </button>
    </div>
  );
}
