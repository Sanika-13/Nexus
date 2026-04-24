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

const mapTranslations = {
  en: {
    backToMap: '← Back to Map', nextBtn: 'NEXT: FARM DETAILS', farmerInterview: 'Farmer Interview',
    q1: '1. Is anything growing?', yes: 'Yes', no: 'No',
    q2: '2. Which crop are you growing?', q3soil: '3. What type of soil do you have?',
    q4: '4. Current Stage?', q5: '5. Last time you watered?',
    scanBtn: 'SCAN & OPTIMIZE', backToInterview: '← Back to Interview',
    analysis: 'ANALYSIS', satReport: 'SATELLITE REPORT', moistureLabel: 'Moisture Index',
    chloroLabel: 'Chlorophyll', diagLabel: 'Professional Diagnosis',
    maintenance: 'MAINTENANCE PLAN', jarurat: 'JARURAT (URGENT ACTION)',
    watchBtn: 'WATCH MY SUMMARY', advicePlaying: 'ADVICE IN PROGRESS',
    satBadge: 'DATA: ESA SENTINEL-2 SATELLITE', advisorTitle: 'AI Advisor Talking...',
    advisorGreet: 'Hello Farmer! I am analyzing your',
    advisorListen: 'field. Please listen carefully to the diagnosis.',
    justPlanted: 'Just Planted', growing: 'Growing', flowering: 'Flowering', harvestReady: 'Harvest Ready',
    today: 'Today', yesterday: 'Yesterday', twoDays: '2-3 days ago', weekAgo: 'A week ago'
  },
  hi: {
    backToMap: '← मानचित्र पर वापस', nextBtn: 'अगला: खेत विवरण', farmerInterview: 'किसान साक्षात्कार',
    q1: '1. क्या कुछ उग रहा है?', yes: 'हाँ', no: 'नहीं',
    q2: '2. आप कौन सी फसल उगा रहे हैं?', q3soil: '3. आपकी मिट्टी का प्रकार क्या है?',
    q4: '4. वर्तमान चरण?', q5: '5. आपने आखिरी बार कब पानी दिया?',
    scanBtn: 'स्कैन करें और अनुकूलित करें', backToInterview: '← साक्षात्कार पर वापस',
    analysis: 'विश्लेषण', satReport: 'उपग्रह रिपोर्ट', moistureLabel: 'नमी सूचकांक',
    chloroLabel: 'क्लोरोफिल', diagLabel: 'पेशेवर निदान',
    maintenance: 'रखरखाव योजना', jarurat: 'ज़रूरत (तत्काल कार्रवाई)',
    watchBtn: 'मेरा सारांश देखें', advicePlaying: 'सलाह जारी है',
    satBadge: 'डेटा: ESA SENTINEL-2 उपग्रह', advisorTitle: 'AI सलाहकार बात कर रहा है...',
    advisorGreet: 'नमस्कार किसान! मैं आपके',
    advisorListen: 'खेत का विश्लेषण कर रहा हूँ। कृपया ध्यान से सुनें।',
    justPlanted: 'अभी लगाया', growing: 'बढ़ रहा है', flowering: 'फूल आ रहे हैं', harvestReady: 'कटाई के लिए तैयार',
    today: 'आज', yesterday: 'कल', twoDays: '2-3 दिन पहले', weekAgo: 'एक हफ्ते पहले'
  },
  mr: {
    backToMap: '← नकाशावर परत', nextBtn: 'पुढे: शेत तपशील', farmerInterview: 'शेतकरी मुलाखत',
    q1: '1. काही उगवत आहे का?', yes: 'होय', no: 'नाही',
    q2: '2. तुम्ही कोणते पीक घेत आहात?', q3soil: '3. तुमच्या मातीचा प्रकार कोणता?',
    q4: '4. सध्याचा टप्पा?', q5: '5. शेवटचे पाणी कधी दिले?',
    scanBtn: 'स्कॅन करा आणि सुधारा', backToInterview: '← मुलाखतीवर परत',
    analysis: 'विश्लेषण', satReport: 'उपग्रह अहवाल', moistureLabel: 'आर्द्रता निर्देशांक',
    chloroLabel: 'क्लोरोफिल', diagLabel: 'व्यावसायिक निदान',
    maintenance: 'देखभाल योजना', jarurat: 'जरुरत (तातडीची कारवाई)',
    watchBtn: 'माझा सारांश पहा', advicePlaying: 'सल्ला सुरू आहे',
    satBadge: 'डेटा: ESA SENTINEL-2 उपग्रह', advisorTitle: 'AI सल्लागार बोलत आहे...',
    advisorGreet: 'नमस्कार शेतकरी! मी तुमच्या',
    advisorListen: 'शेताचे विश्लेषण करत आहे. कृपया लक्षपूर्वक ऐका.',
    justPlanted: 'नुकतेच लावले', growing: 'वाढत आहे', flowering: 'फुलत आहे', harvestReady: 'काढणीसाठी तयार',
    today: 'आज', yesterday: 'काल', twoDays: '2-3 दिवसांपूर्वी', weekAgo: 'एक आठवड्यापूर्वी'
  }
};

const MapSection = ({ initialLocation, onBack, lang = 'en' }) => {
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
  const [showFertilizer, setShowFertilizer] = useState(false);
  const [advisorLang, setAdvisorLang] = useState('en');
  const [soilType, setSoilType] = useState('Loamy');

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
        const reports = {
          'Water Stress': {
            en: {
              diagnosis: `KAMI DETECTED: We have found a severe LACK of soil moisture in this specific 10x10 meter area. The satellite thermal sensors show that the ground here is much hotter than the rest of your field, which means your ${crop} plants are thirsty and struggling to breathe.`,
              jarurat: `JARURAT (ACTION): You need to provide at least 30 Liters of water specifically to this spot today. Please check your irrigation pipes or drip nozzles in this exact square, as there might be a blockage preventing water from reaching these plants.`
            },
            hi: {
              diagnosis: `कमी पाई गई: इस 10x10 मीटर क्षेत्र में मिट्टी की नमी की गंभीर कमी है। उपग्रह के थर्मल सेंसर दिखाते हैं कि यहाँ की ज़मीन बाकी खेत से ज़्यादा गर्म है, यानी आपके ${crop} के पौधे प्यासे हैं और सांस लेने में संघर्ष कर रहे हैं।`,
              jarurat: `जरूरत (कार्रवाई): आज ही इस जगह पर कम से कम 30 लीटर पानी दें। अपने सिंचाई पाइप या ड्रिप नोज़ल जांचें — शायद कोई रुकावट है जो पानी को इन पौधों तक पहुंचने से रोक रही है।`
            },
            mr: {
              diagnosis: `कमतरता आढळली: या 10x10 मीटर भागात मातीतील ओलाव्याची तीव्र कमतरता आहे. उपग्रहाचे थर्मल सेन्सर दाखवतात की इथली जमीन बाकी शेतापेक्षा जास्त गरम आहे, म्हणजे तुमचे ${crop} झाडे तहानलेले आहेत.`,
              jarurat: `जरुरत (कारवाई): आजच या जागी किमान 30 लिटर पाणी द्या. तुमचे सिंचन पाईप किंवा ड्रिप नोझल तपासा — कदाचित अडथळा आहे जो पाणी झाडांपर्यंत पोहोचण्यापासून रोखत आहे.`
            }
          },
          'Low Nitrogen': {
            en: {
              diagnosis: `KAMI DETECTED: There is a critical LACK of Nitrogen (N) nutrients here. Our spectral scan shows that the leaves in this square are not producing enough chlorophyll, which is why they are losing their healthy green color and turning pale.`,
              jarurat: `JARURAT (ACTION): Your ${crop} needs 3kg of Nitrogen-rich Urea fertilizer specifically in this zone. We recommend mixing the fertilizer with a small amount of water for faster root absorption. This will help your plants recover their strength within 4-5 days.`
            },
            hi: {
              diagnosis: `कमी पाई गई: यहाँ नाइट्रोजन (N) पोषक तत्वों की गंभीर कमी है। हमारे स्पेक्ट्रल स्कैन से पता चलता है कि इस वर्ग की पत्तियाँ पर्याप्त क्लोरोफिल नहीं बना रहीं, इसीलिए वे हरा रंग खो रही हैं और पीली पड़ रही हैं।`,
              jarurat: `जरूरत (कार्रवाई): आपके ${crop} को इस क्षेत्र में 3 किलो नाइट्रोजन-युक्त यूरिया खाद की जरूरत है। खाद को थोड़े पानी में मिलाकर दें ताकि जड़ें जल्दी सोख सकें। इससे 4-5 दिनों में पौधे ठीक हो जाएंगे।`
            },
            mr: {
              diagnosis: `कमतरता आढळली: येथे नायट्रोजन (N) पोषक तत्त्वांची तीव्र कमतरता आहे. आमच्या स्पेक्ट्रल स्कॅनमध्ये दिसते की या भागातील पाने पुरेसे क्लोरोफिल तयार करत नाहीत, म्हणूनच ती हिरवा रंग गमावत पिवळी पडत आहेत.`,
              jarurat: `जरुरत (कारवाई): तुमच्या ${crop} ला या भागात 3 किलो युरिया खत हवे आहे. खत थोड्या पाण्यात मिसळून द्या जेणेकरून मुळे लवकर शोषतील. 4-5 दिवसांत झाडे बरी होतील.`
            }
          },
          'Pest Attack': {
            en: {
              diagnosis: `KAMI DETECTED: Our high-resolution imagery has detected anomalous vegetation patterns that indicate a LACK of plant protection. There is a high risk of an early-stage insect or pest attack (like Aphids or Bollworms) starting in this specific patch.`,
              jarurat: `JARURAT (ACTION): You need to inspect the underside of the leaves in this square immediately. Use 250ml of bio-pesticide or Neem oil spray focused exactly on these plants. Acting now will prevent the pests from spreading to the healthy parts of your field.`
            },
            hi: {
              diagnosis: `कमी पाई गई: हमारी हाई-रिज़ॉल्यूशन इमेजरी में असामान्य वनस्पति पैटर्न मिले हैं जो पौधों की सुरक्षा की कमी दर्शाते हैं। इस जगह पर कीड़ों (जैसे माहू या बोलवर्म) के शुरुआती हमले का खतरा है।`,
              jarurat: `जरूरत (कार्रवाई): तुरंत इस वर्ग में पत्तियों के नीचे की तरफ जांच करें। 250 मिलीलीटर जैविक कीटनाशक या नीम का तेल स्प्रे करें। अभी कार्रवाई से कीड़े खेत के बाकी हिस्सों में फैलने से रुकेंगे।`
            },
            mr: {
              diagnosis: `कमतरता आढळली: आमच्या हाय-रिझोल्यूशन इमेजरीमध्ये असामान्य वनस्पती नमुने दिसले जे रोप संरक्षणाची कमतरता दर्शवतात. या जागी कीटकांचा (माव किंवा बोलवर्म) प्रारंभिक हल्ल्याचा धोका आहे.`,
              jarurat: `जरुरत (कारवाई): लगेच या भागातील पानांच्या खालच्या बाजूची तपासणी करा. 250 मिली जैविक कीटकनाशक किंवा निंबाचे तेल फवारा. आत्ता कारवाई केल्यास कीटक शेताच्या बाकी भागात पसरणे टाळता येईल.`
            }
          },
          'None': {
            en: {
              diagnosis: `CONDITION: PERFECT. The satellite confirms that your ${crop} plants in this area have NO LACK of nutrients or water. They are absorbing sunlight perfectly and growing at maximum speed.`,
              jarurat: `JARURAT (ACTION): No extra action is needed here! You are doing a great job. Just maintain your current watering and care schedule. Your ${crop} is very healthy in this zone.`
            },
            hi: {
              diagnosis: `स्थिति: परफेक्ट। उपग्रह पुष्टि करता है कि इस क्षेत्र में आपके ${crop} के पौधों को पोषक तत्वों या पानी की कोई कमी नहीं है। वे पूरी तरह से सूर्य का प्रकाश सोख रहे हैं और तेज़ी से बढ़ रहे हैं।`,
              jarurat: `जरूरत (कार्रवाई): यहाँ कोई अतिरिक्त कार्रवाई की जरूरत नहीं! आप बहुत अच्छा काम कर रहे हैं। बस अपना वर्तमान पानी देने और देखभाल का कार्यक्रम जारी रखें। इस क्षेत्र में आपका ${crop} बहुत स्वस्थ है।`
            },
            mr: {
              diagnosis: `स्थिती: परिपूर्ण. उपग्रह पुष्टी करतो की या भागात तुमच्या ${crop} झाडांना पोषक तत्त्वे किंवा पाण्याची कोणतीही कमतरता नाही. ती सूर्यप्रकाश पूर्णपणे शोषून घेत आहेत आणि वेगाने वाढत आहेत.`,
              jarurat: `जरुरत (कारवाई): येथे कोणतीही अतिरिक्त कारवाई आवश्यक नाही! तुम्ही उत्कृष्ट काम करत आहात. फक्त सध्याचे पाणी देण्याचे आणि काळजी घेण्याचे वेळापत्रक सुरू ठेवा. या भागात तुमचे ${crop} अत्यंत निरोगी आहे.`
            }
          }
        };

        const l = lang || 'en';
        const key = reports[type] ? type : 'None';
        return reports[key][l] || reports[key]['en'];
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
          <button onClick={onBack} className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl" title={mapTranslations[lang]?.backToMap}><ChevronLeft /></button>
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
          <button disabled={points.length < 4} onClick={() => setStep('survey')} className="flex-grow bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg disabled:bg-emerald-200">{mapTranslations[lang]?.nextBtn}</button>
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
          <button onClick={() => setStep('draw')} className="mb-8 text-emerald-600 font-bold">{mapTranslations[lang]?.backToMap}</button>
          <h2 className="text-4xl font-black mb-10 leading-tight text-center">{mapTranslations[lang]?.farmerInterview}</h2>
          
          <div className="space-y-10">
            <div>
              <p className="text-xl mb-4 tracking-tight">{mapTranslations[lang]?.q1}</p>
              <div className="flex gap-4">
                {[[mapTranslations[lang]?.yes,'Yes'],[mapTranslations[lang]?.no,'No']].map(([label,val]) => (
                  <button key={val} onClick={() => setIsPlanted(val === 'Yes')} className={`flex-1 py-5 rounded-2xl font-black border-2 transition-all ${isPlanted === (val === 'Yes') ? 'bg-emerald-700 border-emerald-700 text-white shadow-lg scale-[1.02]' : 'bg-white border-emerald-100 text-emerald-800 opacity-60'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isPlanted && (
              <>
                <div>
                  <p className="text-xl mb-6 flex items-center gap-2 tracking-tight"><Sprout size={24} /> {mapTranslations[lang]?.q2}</p>
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

                {/* Q3: SOIL TYPE */}
                <div>
                  <p className="text-xl mb-6 flex items-center gap-2 tracking-tight"><Shovel size={24} /> {mapTranslations[lang]?.q3soil}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { id: 'Black', name: 'Black (काळी)', img: '/crops/soil_black.png' },
                      { id: 'Red', name: 'Red (लाल)', img: '/crops/soil_red.png' },
                      { id: 'Alluvial', name: 'Alluvial (जलोढ)', img: '/crops/soil_alluvial.png' },
                      { id: 'Sandy', name: 'Sandy (वाळू)', img: '/crops/soil_sandy.png' },
                      { id: 'Clay', name: 'Clay (चिकण)', img: '/crops/soil_clay.png' },
                      { id: 'Loamy', name: 'Loamy (दोमट)', img: '/crops/soil_loamy.png' },
                    ].map(s => (
                      <div key={s.id} onClick={() => setSoilType(s.id)}
                        className={`cursor-pointer rounded-3xl overflow-hidden border-4 transition-all hover:scale-105 ${soilType === s.id ? 'border-amber-600 ring-4 ring-amber-100 shadow-xl' : 'border-emerald-50 opacity-80 hover:opacity-100'}`}>
                        <div className="h-24 overflow-hidden">
                          <img src={s.img} alt={s.id} className="w-full h-full object-cover" />
                        </div>
                        <div className={`p-2 text-center text-[9px] font-black uppercase tracking-tighter ${soilType === s.id ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-900'}`}>
                          {s.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-xl mb-4 flex items-center gap-2 tracking-tight"><Clock size={24} /> {mapTranslations[lang]?.q4}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[[mapTranslations[lang]?.justPlanted,'Just Planted'],[mapTranslations[lang]?.growing,'Growing'],[mapTranslations[lang]?.flowering,'Flowering'],[mapTranslations[lang]?.harvestReady,'Harvest Ready']].map(([label,val]) => (
                            <button key={val} onClick={() => setCropStage(val)} className={`p-5 rounded-2xl font-bold border-2 text-xs transition-all ${cropStage === val ? 'bg-emerald-100 border-emerald-600 text-emerald-900 scale-[1.02]' : 'bg-white border-emerald-50 text-emerald-800'}`}>
                                {label}
                            </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xl mb-4 flex items-center gap-2 tracking-tight"><Droplets size={24} /> {mapTranslations[lang]?.q5}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[[mapTranslations[lang]?.today,'Today'],[mapTranslations[lang]?.yesterday,'Yesterday'],[mapTranslations[lang]?.twoDays,'2-3 days ago'],[mapTranslations[lang]?.weekAgo,'A week ago']].map(([label,val]) => (
                            <button key={val} onClick={() => setLastWatered(val)} className={`p-5 rounded-2xl font-bold border-2 text-xs transition-all ${lastWatered === val ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.02]' : 'bg-white border-blue-50 text-emerald-800'}`}>
                                {label}
                            </button>
                            ))}
                        </div>
                    </div>
                </div>
              </>
            )}
          </div>
          <button onClick={startAnalysis} className="w-full mt-12 bg-emerald-950 text-white py-6 rounded-[2rem] font-black text-2xl hover:bg-black shadow-2xl tracking-tighter uppercase transition-all active:scale-95">{mapTranslations[lang]?.scanBtn}</button>
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
             {mapTranslations[lang]?.satBadge}
          </div>
        </div>

        <div className="w-full lg:w-[550px] flex flex-col gap-6">
          <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-emerald-100 h-full flex flex-col relative overflow-hidden">
            <button onClick={() => setStep('survey')} className="mb-6 text-emerald-600 font-bold flex items-center gap-2 hover:underline">{mapTranslations[lang]?.backToInterview}</button>
            <h2 className="text-3xl font-black text-emerald-950 uppercase tracking-tighter">{analysisData.crop} {mapTranslations[lang]?.analysis}</h2>
            
            {selectedCell && (
              <div className="flex-1 space-y-6 mt-4 overflow-y-auto pr-2 custom-scrollbar">
                 <div className={`p-8 rounded-[2.5rem] text-white shadow-xl transition-all duration-500 ${selectedCell.status === 'healthy' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <p className="text-xs font-black opacity-60 uppercase mb-1 tracking-widest">{mapTranslations[lang]?.satReport}</p>
                    <p className="text-3xl font-black uppercase leading-tight">{selectedCell.data.issue}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100"><p className="text-[10px] font-black opacity-40 uppercase">{mapTranslations[lang]?.moistureLabel}</p><p className="text-3xl font-black text-emerald-950">{selectedCell.data.moisture}%</p></div>
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100"><p className="text-[10px] font-black opacity-40 uppercase">{mapTranslations[lang]?.chloroLabel}</p><p className="text-3xl font-black text-emerald-950">{selectedCell.data.chlorophyll}%</p></div>
                 </div>

                 <div>
                    <p className="text-xs font-black text-emerald-950 uppercase mb-3 flex items-center gap-2"><Info size={16} className="text-emerald-600" /> {mapTranslations[lang]?.diagLabel}</p>
                    <div className="text-emerald-800/90 font-medium leading-relaxed italic text-lg bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100">
                        {selectedCell.data.diagnosis}
                    </div>
                 </div>

                 <div className={`p-8 rounded-[2.5rem] border-4 transition-all duration-500 ${selectedCell.status === 'healthy' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <p className={`text-xs font-black uppercase mb-3 flex items-center gap-2 ${selectedCell.status === 'healthy' ? 'text-emerald-600' : 'text-red-600'}`}>
                        <Shovel size={20} /> {selectedCell.status === 'healthy' ? mapTranslations[lang]?.maintenance : mapTranslations[lang]?.jarurat}
                    </p>
                    <p className={`text-xl font-bold leading-tight ${selectedCell.status === 'healthy' ? 'text-emerald-900' : 'text-red-950'}`}>
                        {selectedCell.data.jarurat}
                    </p>
                 </div>

                 {/* LANGUAGE SELECTOR */}
                 <div className="flex gap-3">
                    {[{code:'en',label:'🇬🇧 EN'},{code:'hi',label:'🇮🇳 हिंदी'}].map(l => (
                      <button key={l.code} onClick={() => setAdvisorLang(l.code)}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm border-2 transition-all ${advisorLang === l.code ? 'bg-emerald-700 border-emerald-700 text-white' : 'bg-white border-emerald-200 text-emerald-800'}`}>
                        {l.label}
                      </button>
                    ))}
                 </div>

                 {/* FERTILIZER MODAL */}
                 {showFertilizer && selectedCell && (() => {
                   const issue = selectedCell.data.issue;
                   const crop = analysisData.crop;
                   const recs = {
                     'Water Stress': [
                       { name: lang==='hi' ? 'पोटेशियम सल्फेट (SOP)' : 'Potassium Sulphate (SOP)', dose: '2 kg / acre', method: lang==='hi' ? 'पानी में मिलाकर जड़ों के पास डालें' : 'Mix in water and apply near roots', timing: lang==='hi' ? 'आज ही — पानी देने के साथ' : 'Today — along with irrigation', color: 'blue' },
                       { name: lang==='hi' ? 'ह्यूमिक एसिड' : 'Humic Acid', dose: '500 ml / acre', method: lang==='hi' ? 'ड्रिप या स्प्रे से दें' : 'Apply via drip or spray', timing: lang==='hi' ? '2-3 दिन लगातार' : '2-3 consecutive days', color: 'blue' },
                     ],
                     'Low Nitrogen': [
                       { name: lang==='hi' ? 'यूरिया (46% N)' : 'Urea (46% N)', dose: '3 kg / zone', method: lang==='hi' ? 'थोड़े पानी में मिलाकर जड़ों के पास डालें' : 'Mix in water and apply near roots', timing: lang==='hi' ? 'आज सुबह — शाम को पानी दें' : 'This morning — water in evening', color: 'green' },
                       { name: lang==='hi' ? 'DAP (डाई-अमोनियम फॉस्फेट)' : 'DAP (Di-Ammonium Phosphate)', dose: '2 kg / zone', method: lang==='hi' ? 'मिट्टी में मिलाएं' : 'Mix into soil', timing: lang==='hi' ? '3 दिन बाद दोबारा जांचें' : 'Re-check after 3 days', color: 'green' },
                       { name: lang==='hi' ? '19:19:19 NPK स्प्रे' : '19:19:19 NPK Spray', dose: '5 g / litre water', method: lang==='hi' ? 'पत्तियों पर छिड़कें' : 'Foliar spray on leaves', timing: lang==='hi' ? 'सुबह 7-9 बजे' : 'Between 7-9 AM', color: 'green' },
                     ],
                     'Pest Attack': [
                       { name: lang==='hi' ? 'नीम तेल स्प्रे' : 'Neem Oil Spray', dose: '250 ml / acre', method: lang==='hi' ? 'पत्तियों के नीचे की तरफ छिड़कें' : 'Spray under the leaves', timing: lang==='hi' ? 'शाम 5 बजे के बाद' : 'After 5 PM', color: 'orange' },
                       { name: lang==='hi' ? 'क्लोरपाइरीफॉस 20% EC' : 'Chlorpyrifos 20% EC', dose: '2 ml / litre water', method: lang==='hi' ? 'पूरे पौधे पर स्प्रे करें' : 'Spray entire plant', timing: lang==='hi' ? 'हर 7 दिन में एक बार' : 'Once every 7 days', color: 'orange' },
                       { name: lang==='hi' ? 'ट्राइकोडर्मा विरिडी (जैविक)' : 'Trichoderma Viride (Bio)', dose: '1 kg / acre', method: lang==='hi' ? 'मिट्टी में मिलाएं' : 'Mix into soil', timing: lang==='hi' ? 'कीटनाशक के 3 दिन बाद' : '3 days after pesticide', color: 'orange' },
                     ],
                     'Optimal Growth': [
                       { name: lang==='hi' ? '12:32:16 NPK' : '12:32:16 NPK', dose: '1 kg / acre', method: lang==='hi' ? 'पानी में मिलाकर दें' : 'Dissolve in water and apply', timing: lang==='hi' ? 'हर 15 दिन में' : 'Every 15 days', color: 'green' },
                       { name: lang==='hi' ? 'सूक्ष्म पोषक मिश्रण (Micronutrient Mix)' : 'Micronutrient Mix', dose: '500 g / acre', method: lang==='hi' ? 'पर्णीय छिड़काव' : 'Foliar spray', timing: lang==='hi' ? 'महीने में एक बार' : 'Once a month', color: 'green' },
                     ],
                   };
                   const list = recs[issue] || recs['Optimal Growth'];
                   const colorMap = { green: 'emerald', blue: 'blue', orange: 'orange' };
                   return (
                     <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
                       <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden border-4 border-emerald-100">
                         <div className="bg-emerald-950 p-8 flex items-center justify-between">
                           <div>
                             <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">{crop} · {issue}</p>
                             <h3 className="text-white text-3xl font-black tracking-tight">{lang==='hi' ? 'खाद सिफारिश' : 'Fertilizer Recommendations'}</h3>
                           </div>
                           <button onClick={() => setShowFertilizer(false)} className="p-3 bg-white/10 rounded-2xl text-white hover:bg-white/20"><X size={22}/></button>
                         </div>
                         <div className="p-8 space-y-4">
                           {list.map((r, i) => (
                             <div key={i} className="border-2 border-emerald-100 rounded-3xl p-5 bg-emerald-50">
                               <p className="font-black text-emerald-950 text-lg">{r.name}</p>
                               <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                 <div className="bg-white rounded-2xl p-3 border border-emerald-100">
                                   <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">{lang==='hi' ? 'मात्रा' : 'Dose'}</p>
                                   <p className="font-black text-emerald-900 text-sm">{r.dose}</p>
                                 </div>
                                 <div className="bg-white rounded-2xl p-3 border border-emerald-100">
                                   <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">{lang==='hi' ? 'तरीका' : 'Method'}</p>
                                   <p className="font-black text-emerald-900 text-[10px] leading-tight">{r.method}</p>
                                 </div>
                                 <div className="bg-white rounded-2xl p-3 border border-emerald-100">
                                   <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">{lang==='hi' ? 'समय' : 'Timing'}</p>
                                   <p className="font-black text-emerald-900 text-[10px] leading-tight">{r.timing}</p>
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                   );
                 })()}

                 {/* WATCH MY SUMMARY BUTTON */}
                 <button 
                    onClick={() => {
                        setShowAdvisor(true);
                        speakAdvice(`Hello Farmer. Analysis for your ${analysisData.crop} is ready. ${selectedCell.data.diagnosis}. Now listen to the action plan. ${selectedCell.data.jarurat}`, advisorLang);
                    }}
                    className="w-full bg-emerald-950 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-black shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group"
                 >
                    <PlayCircle className="group-hover:animate-pulse" /> {mapTranslations[lang]?.watchBtn}
                 </button>

                 {/* RECOMMEND FERTILIZER BUTTON */}
                 <button
                    onClick={() => setShowFertilizer(true)}
                    className="w-full bg-amber-500 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-amber-600 shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                 >
                    <Sprout size={24} /> {lang==='hi' ? 'खाद सिफारिश देखें' : 'Recommend Fertilizer'}
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
