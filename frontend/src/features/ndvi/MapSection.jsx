// features/ndvi/MapSection.jsx
// MOVED from src/components/MapSection.jsx
// All logic is COMPLETELY UNCHANGED — only the file location changed.
// This file handles the 3-step NDVI flow:
//   Step 1: draw — draw farm boundary on Leaflet map
//   Step 2: survey — fill in crop details
//   Step 3: analysis — view NDVI satellite grid results

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents, Marker, Popup, useMap, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { ChevronLeft, Search, RotateCcw, Sprout, Droplets, Clock, LayoutGrid, CheckCircle2, AlertCircle } from 'lucide-react';

// Fix for default Leaflet icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, 18); }, [center, map]);
  return null;
};

const MapSection = ({ initialLocation, onBack }) => {
  const [points, setPoints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mapCenter, setMapCenter] = useState(initialLocation);
  const [step, setStep] = useState('draw'); // 'draw', 'survey', 'analysis'
  
  // Survey State
  const [isPlanted, setIsPlanted] = useState(true);
  const [cropType, setCropType] = useState('Wheat');
  const [cropStage, setCropStage] = useState('Growing');
  const [lastWatered, setLastWatered] = useState('Yesterday');

  const [analysisData, setAnalysisData] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // Suggestions logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 3) { setSuggestions([]); return; }
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}, India&limit=5`);
        setSuggestions(response.data);
      } catch (e) {}
    };
    const timer = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (step !== 'draw') return;
        const { lat, lng } = e.latlng;
        if (points.length < 4) setPoints(prev => [...prev, [lat, lng]]);
      },
    });
    return null;
  };

  const startAnalysis = () => {
    const lats = points.map(p => p[0]);
    const lngs = points.map(p => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const gridCells = [];
    const latStep = (maxLat - minLat) / 4;
    const lngStep = (maxLng - minLng) / 4;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const status = Math.random() > (isPlanted ? 0.4 : 0.8) ? 'healthy' : 'stressed';
        gridCells.push({
          id: `${i}-${j}`,
          bounds: [[minLat + (i * latStep), minLng + (j * lngStep)], [minLat + ((i + 1) * latStep), minLng + ((j + 1) * lngStep)]],
          status: status,
          data: {
            moisture: Math.floor(Math.random() * (status === 'healthy' ? 30 : 20)) + (status === 'healthy' ? 40 : 10),
            health: Math.floor(Math.random() * (status === 'healthy' ? 20 : 40)) + (status === 'healthy' ? 75 : 25),
            issue: status === 'stressed' ? (lastWatered === 'Today' ? 'Nutrient Deficiency' : 'Water Stress') : 'Optimal'
          }
        });
      }
    }

    setAnalysisData({
      gridCells,
      summary: isPlanted ? `Your ${cropType} is in ${cropStage} stage. Satellite detects moisture variance.` : "Bare soil detected. Preparing for plantation."
    });
    setStep('analysis');
    setSelectedCell(gridCells.find(c => c.status === 'stressed'));
  };

  // --- 1. DRAWING VIEW ---
  if (step === 'draw') {
    return (
      <div className="h-screen w-full bg-emerald-50 flex flex-col overflow-hidden">
        <div className="bg-white px-6 py-4 shadow-lg z-[2000] flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl"><ChevronLeft /></button>
          <div className="flex-grow max-w-lg relative z-[3000]">
            <input 
              type="text" placeholder="Village Search..."
              className="w-full pl-6 pr-4 py-4 rounded-2xl border-2 border-emerald-50 outline-none focus:border-emerald-600 font-bold"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-2xl mt-2 overflow-hidden z-[4000] border border-emerald-50">
                {suggestions.map((loc, i) => (
                  <div key={i} onClick={() => { setMapCenter([parseFloat(loc.lat), parseFloat(loc.lon)]); setSearchQuery(loc.display_name.split(',')[0]); setSuggestions([]); }} className="px-6 py-4 hover:bg-emerald-50 cursor-pointer font-bold border-b last:border-0">{loc.display_name}</div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setPoints([])} className="p-4 bg-red-100 text-red-600 rounded-2xl"><RotateCcw /></button>
          <button 
            disabled={points.length < 4}
            onClick={() => setStep('survey')}
            className="flex-grow bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg disabled:bg-emerald-200 transition-all shadow-xl shadow-emerald-200"
          >
            NEXT: FARM DETAILS
          </button>
        </div>
        <div className="flex-grow relative">
          <MapContainer center={mapCenter} zoom={18} style={{ height: '100%', width: '100%' }}>
            <ChangeView center={mapCenter} /><TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" /><MapEvents />
            {points.length > 0 && <Polygon positions={points} color="#10b981" weight={4} fillOpacity={0.2} />}
            {points.map((p, i) => <Marker key={i} position={p} />)}
          </MapContainer>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-10 py-5 rounded-[2.5rem] shadow-2xl border border-emerald-100 z-[1000] text-emerald-950 font-black">
            Field Corners: {points.length}/4
          </div>
        </div>
      </div>
    );
  }

  // --- 2. SURVEY VIEW ---
  if (step === 'survey') {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-[3.5rem] p-12 shadow-2xl border border-emerald-100">
          <button onClick={() => setStep('draw')} className="mb-8 text-emerald-600 font-bold">← Back to Map</button>
          <h2 className="text-4xl font-black text-emerald-950 mb-4 leading-tight">Tell us about <br/>your farm</h2>
          <p className="text-emerald-800/60 mb-10 text-lg">This helps our AI provide 100% accurate health reports.</p>

          <div className="space-y-8">
            {/* Q1: Planted? */}
            <div>
              <p className="font-bold text-emerald-900 mb-4">1. Is anything growing right now?</p>
              <div className="flex gap-4">
                {['Yes', 'No'].map(v => (
                  <button key={v} onClick={() => setIsPlanted(v === 'Yes')} className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all ${isPlanted === (v === 'Yes') ? 'bg-emerald-700 border-emerald-700 text-white shadow-lg' : 'bg-white border-emerald-100 text-emerald-800'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {isPlanted && (
              <>
                {/* Q2: Crop Type */}
                <div>
                  <p className="font-bold text-emerald-900 mb-4 flex items-center gap-2"><Sprout size={18} /> 2. Which crop are you growing?</p>
                  <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-emerald-50 bg-emerald-50 font-bold outline-none focus:border-emerald-600">
                    <option value="Wheat">Wheat (गहू)</option><option value="Rice">Rice (तांदूळ)</option><option value="Sugarcane">Sugarcane (ऊस)</option><option value="Cotton">Cotton (कापूस)</option><option value="Other">Other</option>
                  </select>
                </div>

                {/* Q3: Stage */}
                <div>
                  <p className="font-bold text-emerald-900 mb-4 flex items-center gap-2"><Clock size={18} /> 3. Current Stage?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Just Planted', 'Growing', 'Flowering', 'Ready to Harvest'].map(s => (
                      <button key={s} onClick={() => setCropStage(s)} className={`p-4 rounded-2xl font-bold border-2 text-sm transition-all ${cropStage === s ? 'bg-emerald-100 border-emerald-600 text-emerald-900' : 'bg-white border-emerald-50 text-emerald-800'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Q4: Water */}
            <div>
              <p className="font-bold text-emerald-900 mb-4 flex items-center gap-2"><Droplets size={18} /> 4. Last time you watered?</p>
              <div className="grid grid-cols-2 gap-3">
                {['Today', 'Yesterday', '2-3 days ago', 'A week ago'].map(w => (
                  <button key={w} onClick={() => setLastWatered(w)} className={`p-4 rounded-2xl font-bold border-2 text-sm transition-all ${lastWatered === w ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-blue-50 text-emerald-800'}`}>
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={startAnalysis} className="w-full mt-12 bg-emerald-950 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-2xl">
            SCAN & OPTIMIZE FARM
          </button>
        </div>
      </div>
    );
  }

  // --- 3. ANALYSIS VIEW ---
  if (step === 'analysis') {
    return (
      <div className="min-h-screen bg-emerald-50 p-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-[3.5rem] overflow-hidden shadow-2xl relative border-8 border-white">
          <MapContainer center={points[0]} zoom={19} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
            <Polygon positions={points} color="white" weight={4} fillOpacity={0} />
            {analysisData.gridCells.map((cell, i) => (
              <Rectangle 
                key={i} bounds={cell.bounds} eventHandlers={{ click: () => setSelectedCell(cell) }}
                pathOptions={{
                  color: selectedCell?.id === cell.id ? 'white' : 'transparent',
                  weight: 3,
                  fillColor: cell.status === 'healthy' ? '#10b981' : '#ef4444',
                  fillOpacity: selectedCell?.id === cell.id ? 0.7 : 0.4
                }}
              />
            ))}
          </MapContainer>
          <div className="absolute top-8 left-8 bg-white/95 backdrop-blur px-8 py-4 rounded-[2rem] font-black text-emerald-950 shadow-2xl flex items-center gap-3 border border-emerald-100 z-[1001]">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            SATELLITE X-RAY ACTIVE
          </div>
        </div>

        <div className="w-full lg:w-[500px] flex flex-col gap-6">
          <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-emerald-100 h-full">
            <button onClick={() => setStep('survey')} className="mb-8 text-emerald-600 font-bold">← Edit Farm Details</button>
            <h2 className="text-4xl font-black text-emerald-950 mb-2 leading-tight">{isPlanted ? `${cropType} Status` : 'Pre-Planting Report'}</h2>
            <p className="text-emerald-500 font-black mb-10 text-lg uppercase tracking-widest">{cropStage}</p>

            {selectedCell && (
              <div className={`p-8 rounded-[2.5rem] border-4 mb-8 transition-all ${selectedCell.status === 'healthy' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex justify-between items-center mb-6">
                   <p className="text-sm font-black text-emerald-900/40 uppercase">Selected Area</p>
                   {selectedCell.status === 'healthy' ? <CheckCircle2 className="text-emerald-600" /> : <AlertCircle className="text-red-600" />}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div><p className="text-xs font-bold text-emerald-800/60 uppercase mb-1">Moisture</p><p className="text-3xl font-black text-emerald-950">{selectedCell.data.moisture}%</p></div>
                  <div><p className="text-xs font-bold text-emerald-800/60 uppercase mb-1">Chlorophyll</p><p className="text-3xl font-black text-emerald-950">{selectedCell.data.health}%</p></div>
                </div>
                <div className={`p-6 rounded-2xl ${selectedCell.status === 'healthy' ? 'bg-emerald-600' : 'bg-red-600'} text-white shadow-xl`}>
                  <p className="text-xs font-black uppercase opacity-60 mb-1">Recommendation</p>
                  <p className="text-xl font-bold">{selectedCell.data.issue === 'Optimal' ? 'Perfect Condition' : selectedCell.data.issue}</p>
                </div>
              </div>
            )}

            <div className="bg-emerald-950 p-10 rounded-[3rem] text-white mt-auto relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Precision Plan</p>
                 <p className="text-lg italic text-emerald-100/80 leading-relaxed">"{analysisData.summary}"</p>
               </div>
               <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 translate-x-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MapSection;
