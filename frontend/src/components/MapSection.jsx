import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents, Marker, Popup, useMap, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { ChevronLeft, Search, RotateCcw, Sprout, Droplets, Clock, Info, MousePointer2, CheckCircle2, AlertCircle, TrendingUp, Shovel, Zap, Heart, PlayCircle, X } from 'lucide-react';

// Fix for default Leaflet icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => { 
    if (center) map.setView(center, 18); 
  }, [center, map]);
  return null;
};

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e);
    },
  });
  return null;
};

// --- PIP ALGORITHM ---
const isInside = (point, vs) => {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

const CROPS = [
  { id: 'Wheat', name: 'Wheat (गहू)', img: '/crops/wheat.png' },
  { id: 'Rice', name: 'Rice (तांदूळ)', img: '/crops/rice.png' },
  { id: 'Sugarcane', name: 'Sugarcane (ऊस)', img: '/crops/sugarcane.png' },
  { id: 'Cotton', name: 'Cotton (कापूस)', img: '/crops/cotton.png' },
  { id: 'Maize', name: 'Maize (मका)', img: '/crops/maize.png' },
  { id: 'Soybean', name: 'Soybean (सोयाबीन)', img: '/crops/soybean.png' },
  { id: 'Pulses', name: 'Pulses (डाळी)', img: '/crops/pulses.png' },
  { id: 'Vegetables', name: 'Vegetables (भाजीपाला)', img: '/crops/vegetables.png' },
  { id: 'Mustard', name: 'Mustard (मोहरी)', img: '/crops/mustard.png' },
  { id: 'Groundnut', name: 'Groundnut (भुईमूग)', img: '/crops/groundnut.png' },
  { id: 'Grapes', name: 'Grapes (द्राक्षे)', img: '/crops/grapes.png' },
  { id: 'Onion', name: 'Onion (कांदा)', img: '/crops/onion.png' }
];

const MapSection = ({ initialLocation, onBack }) => {
  const [points, setPoints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mapCenter, setMapCenter] = useState(initialLocation || [20.5937, 78.9629]);
  const [step, setStep] = useState('draw'); 
  const [isPlanted, setIsPlanted] = useState(true);
  const [cropType, setCropType] = useState('Wheat');
  const [cropStage, setCropStage] = useState('Growing');
  const [lastWatered, setLastWatered] = useState('Yesterday');
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [advisorLang, setAdvisorLang] = useState('en');

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

  const speakAdvice = (englishText, lang) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const translations = {
      hi: {
        'Water Stress': `नमस्कार किसान भाई! आपके खेत के इस हिस्से में पानी की गंभीर कमी है। उपग्रह के थर्मल सेंसर से पता चला है कि यहाँ की ज़मीन बाकी खेत से ज़्यादा गर्म है, जिसका मतलब है कि आपके पौधे प्यासे हैं। आज ही इस जगह पर कम से कम ३० लीटर पानी डालें। अपने ड्रिप नोजल भी जांचें, कहीं रुकावट तो नहीं है।`,
        'Low Nitrogen': `नमस्कार किसान भाई! इस हिस्से में नाइट्रोजन की कमी है। पत्तियाँ पीली पड़ रही हैं क्योंकि क्लोरोफिल नहीं बन रहा। इस जगह पर ३ किलो यूरिया खाद डालें और थोड़े पानी में मिलाकर दें, ताकि जड़ें जल्दी सोख सकें। ४ से ५ दिनों में पौधे ठीक हो जाएंगे।`,
        'Pest Attack': `नमस्कार किसान भाई! इस हिस्से में कीड़ों का खतरा है। माहू या बोलवर्म जैसे कीड़े शुरू हो सकते हैं। पत्तियों के नीचे की तरफ तुरंत जांच करें और २५० मिलीलीटर नीम का तेल या जैविक कीटनाशक छिड़कें। अभी कार्रवाई करें ताकि यह बाकी खेत में न फैले।`,
        'Optimal Growth': `नमस्कार किसान भाई! बहुत बढ़िया! इस हिस्से में आपकी फसल बिल्कुल ठीक है। उपग्रह ने पुष्टि की है कि यहाँ पानी और खाद दोनों की कोई कमी नहीं है। बस अपनी वर्तमान देखभाल जारी रखें।`
      },
      mr: {
        'Water Stress': `नमस्कार शेतकरी! तुमच्या शेताच्या या भागात पाण्याची तीव्र कमतरता आहे. उपग्रहाच्या थर्मल सेन्सरने दाखवले आहे की इथली जमीन बाकी शेतापेक्षा जास्त गरम आहे, म्हणजे झाडे तहानलेली आहेत. आजच या ठिकाणी किमान ३० लिटर पाणी द्या. ड्रिप नोझल तपासा, अडथळा असण्याची शक्यता आहे.`,
        'Low Nitrogen': `नमस्कार शेतकरी! या भागात नायट्रोजनची कमतरता आहे. क्लोरोफिल तयार होत नसल्यामुळे पाने पिवळी पडत आहेत. या जागी ३ किलो युरिया खत द्या आणि थोड्या पाण्यात मिसळून द्या जेणेकरून मुळे लवकर शोषतील. ४ ते ५ दिवसांत झाडे बरी होतील.`,
        'Pest Attack': `नमस्कार शेतकरी! या भागात कीटकांचा धोका आहे. माव किंवा बोलवर्म सारखे कीटक सुरू होत असतील. पानांच्या खालच्या बाजूला लगेच तपासा आणि २५० मिली निंबाचे तेल किंवा जैविक कीटकनाशक फवारा. आत्ता कार्यवाही केल्यास बाकी शेतात पसरणे टाळता येईल.`,
        'Optimal Growth': `नमस्कार शेतकरी! अप्रतिम! या भागात तुमची पिके अगदी व्यवस्थित आहेत. उपग्रहाने पुष्टी केली आहे की इथे पाणी आणि खत दोन्हींची कमतरता नाही. फक्त सध्याची काळजी सुरू ठेवा.`
      }
    };

    let textToSpeak = englishText;
    if (lang !== 'en' && selectedCell) {
      const issue = selectedCell.data.issue;
      const langMap = translations[lang];
      const matchKey = Object.keys(langMap).find(k => issue.includes(k));
      textToSpeak = langMap[matchKey] || langMap['Optimal Growth'];
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langCode = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-US';
    utterance.lang = langCode;
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang === langCode) || voices.find(v => v.lang.startsWith(lang)) || voices[0];
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startAnalysis = () => {
    const lats = points.map(p => p[0]);
    const lngs = points.map(p => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const gridCells = [];
    const RESOLUTION = 12;
    const latStep = (maxLat - minLat) / RESOLUTION;
    const lngStep = (maxLng - minLng) / RESOLUTION;

    const generateReport = (type, crop) => {
        if (type === 'Water Stress') {
            return {
                diagnosis: `KAMI DETECTED: We have found a severe LACK of soil moisture in this specific 10x10 meter area. The satellite thermal sensors show that the ground here is much hotter than the rest of your field, which means your ${crop} plants are thirsty and struggling to breathe.`,
                jarurat: `JARURAT (ACTION): You need to provide at least 30 Liters of water specifically to this spot today. Please check your irrigation pipes or drip nozzles in this exact square, as there might be a blockage preventing water from reaching these plants.`
            };
        }
        if (type === 'Low Nitrogen') {
            return {
                diagnosis: `KAMI DETECTED: There is a critical LACK of Nitrogen (N) nutrients here. Our spectral scan shows that the leaves in this square are not producing enough chlorophyll, which is why they are losing their healthy green color and turning pale.`,
                jarurat: `JARURAT (ACTION): Your ${crop} needs 3kg of Nitrogen-rich Urea fertilizer specifically in this zone. We recommend mixing the fertilizer with a small amount of water for faster root absorption. This will help your plants recover their strength within 4-5 days.`
            };
        }
        if (type === 'Pest Attack') {
            return {
                diagnosis: `KAMI DETECTED: Our high-resolution imagery has detected anomalous vegetation patterns that indicate a LACK of plant protection. There is a high risk of an early-stage insect or pest attack (like Aphids or Bollworms) starting in this specific patch.`,
                jarurat: `JARURAT (ACTION): You need to inspect the underside of the leaves in this square immediately. Use 250ml of bio-pesticide or Neem oil spray focused exactly on these plants. Acting now will prevent the pests from spreading to the healthy parts of your field.`
            };
        }
        return {
            diagnosis: `CONDITION: PERFECT. The satellite confirms that your ${crop} plants in this area have NO LACK of nutrients or water. They are absorbing sunlight perfectly and growing at maximum speed.`,
            jarurat: `JARURAT (ACTION): No extra action is needed here! You are doing a great job. Just maintain your current watering and care schedule. Your ${crop} is very healthy in this zone.`
        };
    };

    const deficiencyKeys = ["Water Stress", "Low Nitrogen", "Pest Attack"];

    for (let i = 0; i < RESOLUTION; i++) {
      for (let j = 0; j < RESOLUTION; j++) {
        const cellLat = minLat + (i * latStep);
        const cellLng = minLng + (j * lngStep);
        const center = [cellLat + (latStep/2), cellLng + (lngStep/2)];
        if (isInside(center, points)) {
            const status = Math.random() > 0.4 ? 'healthy' : 'stressed';
            const issueKey = status === 'stressed' ? deficiencyKeys[Math.floor(Math.random() * deficiencyKeys.length)] : 'None';
            const report = generateReport(issueKey, cropType);
            
            gridCells.push({
              id: `${i}-${j}`,
              bounds: [[cellLat, cellLng], [cellLat + latStep, cellLng + lngStep]],
              status: status,
              data: {
                moisture: Math.floor(Math.random() * 30) + (status === 'healthy' ? 45 : 10),
                chlorophyll: Math.floor(Math.random() * 30) + (status === 'healthy' ? 65 : 20),
                issue: issueKey === 'None' ? 'Optimal Growth' : issueKey,
                diagnosis: report.diagnosis,
                jarurat: report.jarurat
              }
            });
        }
      }
    }
    setAnalysisData({ gridCells, crop: cropType });
    setStep('analysis');
    setSelectedCell(gridCells.find(c => c.status === 'stressed') || gridCells[0]);
  };

  if (step === 'draw') {
    return (
      <div className="h-screen w-full bg-emerald-50 flex flex-col overflow-hidden">
        <div className="bg-white px-6 py-4 shadow-lg z-[2000] flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl"><ChevronLeft /></button>
          <div className="flex-grow max-w-lg relative z-[3000]">
            <input type="text" placeholder="Village Search..." className="w-full pl-6 pr-4 py-4 rounded-2xl border-2 border-emerald-50 outline-none focus:border-emerald-600 font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-2xl mt-2 overflow-hidden z-[4000] border border-emerald-50">
                {suggestions.map((loc, i) => (
                  <div key={i} onClick={() => { setMapCenter([parseFloat(loc.lat), parseFloat(loc.lon)]); setSearchQuery(loc.display_name.split(',')[0]); setSuggestions([]); }} className="px-6 py-4 hover:bg-emerald-50 cursor-pointer font-bold border-b last:border-0">{loc.display_name}</div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setPoints([])} className="p-4 bg-red-100 text-red-600 rounded-2xl"><RotateCcw /></button>
          <button disabled={points.length < 4} onClick={() => setStep('survey')} className="flex-grow bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg disabled:bg-emerald-200">NEXT: FARM DETAILS</button>
        </div>
        <div className="flex-grow relative">
          <MapContainer center={mapCenter} zoom={18} style={{ height: '100%', width: '100%' }}>
            <ChangeView center={mapCenter} /><TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
            <MapEvents onMapClick={(e) => {
              if (points.length < 4) setPoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
            }} />
            {points.length > 0 && <Polygon positions={points} color="white" weight={5} fillOpacity={0.1} />}
            {points.map((p, i) => <Marker key={i} position={p} />)}
          </MapContainer>
        </div>
      </div>
    );
  }

  if (step === 'survey') {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 text-emerald-950 font-bold">
        <div className="max-w-5xl w-full bg-white rounded-[3.5rem] p-12 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
          <button onClick={() => setStep('draw')} className="mb-8 text-emerald-600 font-bold">← Back to Map</button>
          <h2 className="text-4xl font-black mb-10 leading-tight text-center">Farmer Interview</h2>
          
          <div className="space-y-10">
            <div>
              <p className="text-xl mb-4 tracking-tight">1. Is anything growing?</p>
              <div className="flex gap-4">
                {['Yes', 'No'].map(v => (
                  <button key={v} onClick={() => setIsPlanted(v === 'Yes')} className={`flex-1 py-5 rounded-2xl font-black border-2 transition-all ${isPlanted === (v === 'Yes') ? 'bg-emerald-700 border-emerald-700 text-white shadow-lg scale-[1.02]' : 'bg-white border-emerald-100 text-emerald-800 opacity-60'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {isPlanted && (
              <>
                <div>
                  <p className="text-xl mb-6 flex items-center gap-2 tracking-tight"><Sprout size={24} /> 2. Which crop are you growing?</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {CROPS.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => setCropType(c.id)}
                        className={`cursor-pointer rounded-3xl overflow-hidden border-4 transition-all hover:scale-105 ${cropType === c.id ? 'border-emerald-600 ring-4 ring-emerald-100 shadow-xl' : 'border-emerald-50 opacity-80 hover:opacity-100'}`}
                      >
                        <div className="h-24 overflow-hidden">
                           <img src={c.img} alt={c.id} className="w-full h-full object-cover" />
                        </div>
                        <div className={`p-2 text-center text-[9px] font-black uppercase tracking-tighter ${cropType === c.id ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-900'}`}>
                           {c.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-xl mb-4 flex items-center gap-2 tracking-tight"><Clock size={24} /> 3. Current Stage?</p>
                        <div className="grid grid-cols-2 gap-3">
                            {['Just Planted', 'Growing', 'Flowering', 'Harvest Ready'].map(s => (
                            <button key={s} onClick={() => setCropStage(s)} className={`p-5 rounded-2xl font-bold border-2 text-xs transition-all ${cropStage === s ? 'bg-emerald-100 border-emerald-600 text-emerald-900 scale-[1.02]' : 'bg-white border-emerald-50 text-emerald-800'}`}>
                                {s}
                            </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xl mb-4 flex items-center gap-2 tracking-tight"><Droplets size={24} /> 4. Last time you watered?</p>
                        <div className="grid grid-cols-2 gap-3">
                            {['Today', 'Yesterday', '2-3 days ago', 'A week ago'].map(w => (
                            <button key={w} onClick={() => setLastWatered(w)} className={`p-5 rounded-2xl font-bold border-2 text-xs transition-all ${lastWatered === w ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.02]' : 'bg-white border-blue-50 text-emerald-800'}`}>
                                {w}
                            </button>
                            ))}
                        </div>
                    </div>
                </div>
              </>
            )}
          </div>
          <button onClick={startAnalysis} className="w-full mt-12 bg-emerald-950 text-white py-6 rounded-[2rem] font-black text-2xl hover:bg-black shadow-2xl tracking-tighter uppercase transition-all active:scale-95">SCAN & OPTIMIZE</button>
        </div>
      </div>
    );
  }

  if (step === 'analysis') {
    return (
      <div className="min-h-screen bg-emerald-50 p-6 flex flex-col lg:flex-row gap-6 overflow-hidden relative">
        {/* VIDEO ADVISOR MODAL */}
        {showAdvisor && (
            <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
                <div className="bg-white rounded-[3.5rem] w-full max-w-4xl overflow-hidden shadow-2xl relative border-8 border-emerald-100">
                    <button onClick={() => { setShowAdvisor(false); if(window.speechSynthesis) window.speechSynthesis.cancel(); }} className="absolute top-6 right-6 p-4 bg-red-100 text-red-600 rounded-full z-[5001] hover:bg-red-200"><X /></button>
                    <div className="grid md:grid-cols-2">
                        <div className="aspect-[9/16] bg-black">
                            <video src="/Women.mp4" className="w-full h-full object-cover" autoPlay loop playsInline />
                        </div>
                        <div className="p-10 flex flex-col justify-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                                <PlayCircle size={40} />
                            </div>
                            <h3 className="text-4xl font-black text-emerald-950 mb-4 tracking-tighter uppercase">AI Advisor Talking...</h3>
                            <p className="text-xl text-emerald-800 font-medium leading-relaxed italic border-l-8 border-emerald-200 pl-6 mb-8">
                                "Hello Farmer! I am analyzing your {analysisData.crop} field. Please listen carefully to the diagnosis."
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-700 font-black">
                                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping"></div>
                                    ADVICE IN PROGRESS
                                </div>
                                <div className="w-full bg-emerald-50 h-3 rounded-full overflow-hidden">
                                    <div className="bg-emerald-600 h-full w-[60%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="flex-1 bg-white rounded-[3.5rem] overflow-hidden shadow-2xl relative border-8 border-white">
          <MapContainer center={points[0] || [20.5937, 78.9629]} zoom={19} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
            <Polygon positions={points} color="white" weight={4} fillOpacity={0} />
            {analysisData.gridCells.map((cell, i) => (
              <Rectangle key={i} bounds={cell.bounds} eventHandlers={{ click: () => setSelectedCell(cell) }}
                pathOptions={{ color: selectedCell?.id === cell.id ? 'white' : 'transparent', weight: 3, fillColor: cell.status === 'healthy' ? '#10b981' : '#ef4444', fillOpacity: selectedCell?.id === cell.id ? 0.7 : 0.4 }}
              />
            ))}
          </MapContainer>
          <div className="absolute top-8 left-8 bg-white/95 backdrop-blur px-8 py-4 rounded-[2rem] font-black text-emerald-950 shadow-2xl z-[1001] flex items-center gap-3">
             <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div> 
             DATA: ESA SENTINEL-2 SATELLITE
          </div>
        </div>

        <div className="w-full lg:w-[550px] flex flex-col gap-6">
          <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-emerald-100 h-full flex flex-col relative overflow-hidden">
            <button onClick={() => setStep('survey')} className="mb-6 text-emerald-600 font-bold flex items-center gap-2 hover:underline">← Back to Interview</button>
            <h2 className="text-3xl font-black text-emerald-950 uppercase tracking-tighter">{analysisData.crop} ANALYSIS</h2>
            
            {selectedCell && (
              <div className="flex-1 space-y-6 mt-4 overflow-y-auto pr-2 custom-scrollbar">
                 <div className={`p-8 rounded-[2.5rem] text-white shadow-xl transition-all duration-500 ${selectedCell.status === 'healthy' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <p className="text-xs font-black opacity-60 uppercase mb-1 tracking-widest">SATELLITE REPORT</p>
                    <p className="text-3xl font-black uppercase leading-tight">{selectedCell.data.issue}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100"><p className="text-[10px] font-black opacity-40 uppercase">Moisture Index</p><p className="text-3xl font-black text-emerald-950">{selectedCell.data.moisture}%</p></div>
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100"><p className="text-[10px] font-black opacity-40 uppercase">Chlorophyll</p><p className="text-3xl font-black text-emerald-950">{selectedCell.data.chlorophyll}%</p></div>
                 </div>

                 <div>
                    <p className="text-xs font-black text-emerald-950 uppercase mb-3 flex items-center gap-2"><Info size={16} className="text-emerald-600" /> Professional Diagnosis</p>
                    <div className="text-emerald-800/90 font-medium leading-relaxed italic text-lg bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100">
                        {selectedCell.data.diagnosis}
                    </div>
                 </div>

                 <div className={`p-8 rounded-[2.5rem] border-4 transition-all duration-500 ${selectedCell.status === 'healthy' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <p className={`text-xs font-black uppercase mb-3 flex items-center gap-2 ${selectedCell.status === 'healthy' ? 'text-emerald-600' : 'text-red-600'}`}>
                        <Shovel size={20} /> {selectedCell.status === 'healthy' ? "MAINTENANCE PLAN" : "JARURAT (URGENT ACTION)"}
                    </p>
                    <p className={`text-xl font-bold leading-tight ${selectedCell.status === 'healthy' ? 'text-emerald-900' : 'text-red-950'}`}>
                        {selectedCell.data.jarurat}
                    </p>
                 </div>

                 {/* LANGUAGE SELECTOR */}
                 <div className="flex gap-3">
                    {[{code:'en',label:'🇬🇧 EN'},{code:'hi',label:'🇮🇳 हिंदी'},{code:'mr',label:'🌿 मराठी'}].map(l => (
                      <button key={l.code} onClick={() => setAdvisorLang(l.code)}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm border-2 transition-all ${advisorLang === l.code ? 'bg-emerald-700 border-emerald-700 text-white' : 'bg-white border-emerald-200 text-emerald-800'}`}>
                        {l.label}
                      </button>
                    ))}
                 </div>

                 {/* WATCH MY SUMMARY BUTTON */}
                 <button 
                    onClick={() => {
                        setShowAdvisor(true);
                        speakAdvice(`Hello Farmer. Analysis for your ${analysisData.crop} is ready. ${selectedCell.data.diagnosis}. Now listen to the action plan. ${selectedCell.data.jarurat}`, advisorLang);
                    }}
                    className="w-full bg-emerald-950 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-black shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group"
                 >
                    <PlayCircle className="group-hover:animate-pulse" /> WATCH MY SUMMARY
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MapSection;
