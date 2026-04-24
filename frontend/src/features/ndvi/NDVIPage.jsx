// features/ndvi/NDVIPage.jsx
// NDVI satellite analysis page.
// Asks the user for geolocation permission, then renders MapSection.
// The MapSection logic (draw → survey → analysis) is completely preserved.

import React, { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import MapSection from './MapSection';

const NDVIPage = () => {
  const [coords, setCoords] = useState(null);   // [lat, lng] once obtained
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetLocation = () => {
    setLoading(true);
    setError('');

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords([position.coords.latitude, position.coords.longitude]);
        setLoading(false);
      },
      () => {
        setError('Could not get your location. Please check your browser permissions and try again.');
        setLoading(false);
      }
    );
  };

  // ── Once we have coordinates → show the full MapSection (unchanged logic) ──
  if (coords) {
    return (
      <MapSection
        initialLocation={coords}
        onBack={() => setCoords(null)} // Reset to location step
      />
    );
  }

  // ── Location Prompt Screen ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center backdrop-blur-xl">
          
          {/* Icon */}
          <div className="bg-emerald-500/20 border border-emerald-500/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <MapPin className="text-emerald-400" size={36} />
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-3">
            Locate Your Farm
          </h2>
          <p className="text-emerald-200/60 mb-10 text-base leading-relaxed">
            Stand in your field and click below to pinpoint your exact location on the satellite map.
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-2xl px-4 py-3 mb-6">
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            id="get-location-btn"
            onClick={handleGetLocation}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-white font-bold px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0 text-lg shadow-xl shadow-emerald-900/50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Locating your farm...
              </>
            ) : (
              <>
                <Navigation size={22} />
                Get My Current Location
              </>
            )}
          </button>

          <p className="text-emerald-200/30 text-xs mt-6">
            📍 Your location is used only to center the satellite map. We don't store GPS coordinates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NDVIPage;
