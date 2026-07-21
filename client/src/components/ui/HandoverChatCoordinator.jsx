import React from 'react';

export default function HandoverChatCoordinator({ booking, onClose }) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h3 className="text-xl font-bold text-orange-500">Vehicle Handover & Chat</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold">&times;</button>
        </div>
        <div className="py-6 space-y-4">
          <p className="text-sm text-slate-400">Handover coordination for booking: <span className="text-slate-200 font-mono">{booking._id || booking.id}</span></p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm">
            Status: {booking.status || 'Active'}
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl">Close</button>
        </div>
      </div>
    </div>
  );
}
