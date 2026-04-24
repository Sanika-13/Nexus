import React, { useState, useEffect } from 'react';
import { Leaf, Satellite, CloudRain, Target, Globe, MapPin, Navigation } from 'lucide-react';
import MapSection from './components/MapSection';

const translations = {
  en: {
    title: "Your Farm,",
    highlight: "Smartly Optimized",
    suffix: "from Space.",
    subtext: "KhetGyan uses high-resolution satellite imagery and real-time weather AI to maximize your crop yield.",
    btnStart: "Start Monitoring",
    btnLearn: "Learn More",
    btnApp: "Install App",
    btnAppInstalled: "Install App",
    featureTitle: "Advanced Precision Technology",
    feat1Title: "Satellite Vision",
    feat1Desc: "Monitor plant health using infrared imagery from deep space.",
    feat2Title: "Weather Sync",
    feat2Desc: "Live updates and rain forecasts directly to your dashboard.",
    feat3Title: "Resource Target",
    feat3Desc: "Identify exact spots that need water or nutrients.",
    setupTitle: "Locate Your Farm",
    setupDesc: "Please stand in your field and click the button below to locate your farm on the satellite map.",
    btnGetLoc: "Get My Current Location",
    locError: "Error getting location. Check settings."
  },
  hi: {
    title: "आपका खेत,",
    highlight: "अंतरिक्ष से",
    suffix: "स्मार्ट अनुकूलित।",
    subtext: "खेतज्ञान आपकी फसल की उपज बढ़ाने के लिए उच्च-रिज़ॉल्यूशन सैटेलाइट इमेजरी और रीयल-टाइम वेदर AI का उपयोग करता है।",
    btnStart: "निगरानी शुरू करें",
    btnLearn: "अधिक जानें",
    btnApp: "ऐप इंस्टॉल करें",
    btnAppInstalled: "ऐप इंस्टॉल करें",
    featureTitle: "उन्नत सटीक तकनीक",
    feat1Title: "सैटेलाइट विज़न",
    feat1Desc: "गहरे अंतरिक्ष से इन्फ्रारेड इमेजरी का उपयोग करके पौधों के स्वास्थ्य की निगरानी करें।",
    feat2Title: "वेदर सिंक",
    feat2Desc: "लाइव अपडेट और बारिश का पूर्वानुमान सीधे आपके डैशबोर्ड पर।",
    feat3Title: "संसाधन लक्ष्य",
    feat3Desc: "उन सटीक स्थानों की पहचान करें जिन्हें पानी या पोषक तत्वों की आवश्यकता है।",
    setupTitle: "अपना खेत खोजें",
    setupDesc: "कृपया अपने खेत में खड़े हों और सैटेलाइट मैप पर अपने खेत का पता लगाने के लिए नीचे दिए गए बटन पर क्लिक करें।",
    btnGetLoc: "मेरी वर्तमान स्थिति प्राप्त करें",
    locError: "स्थान प्राप्त करने में त्रुटि। सेटिंग्स की जाँच करें।"
  },
  mr: {
    title: "तुमची शेती,",
    highlight: "अंतराळातून",
    suffix: "स्मार्टपणे अनुकूल.",
    subtext: "खेतज्ञान तुमच्या पिकाचे उत्पन्न वाढवण्यासाठी हाय-रिझोल्यूशन सॅटेलाइट इमेजरी आणि रिअल-टाइम वेदर AI वापरते.",
    btnStart: "देखरेख सुरू करा",
    btnLearn: "अधिक जाणून घ्या",
    btnApp: "अ‍ॅप इंस्टॉल करा",
    btnAppInstalled: "अ‍ॅप इंस्टॉल करा",
    featureTitle: "प्रगत अचूक तंत्रज्ञान",
    feat1Title: "सॅटेलाइट व्हिजन",
    feat1Desc: "अंतराळातील इन्फ्रारेड इमेजरी वापरून पिकांच्या आरोग्यावर लक्ष ठेवा.",
    feat2Title: "हवामान अपडेट",
    feat2Desc: "थेट हवामान अपडेट आणि पावसाचा अंदाज तुमच्या डॅशबोर्डवर मिळवा.",
    feat3Title: "अचूक नियोजन",
    feat3Desc: "पाणी किंवा खतांची गरज असलेल्या नेमक्या जागा ओळखा.",
    setupTitle: "तुमची शेती शोधा",
    setupDesc: "कृपया तुमच्या शेतात उभे राहा आणि सॅटेलाइट मॅपवर तुमच्या शेताचा शोध घेण्यासाठी खालील बटणावर क्लिक करा.",
    btnGetLoc: "माझे सध्याचे स्थान मिळवा",
    locError: "स्थान मिळवताना त्रुटी आली. सेटिंग्ज तपासा."
  }
};

function App() {
  const [lang, setLang] = useState('en');
  const [view, setView] = useState('home'); 
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const t = translations[lang];

  // PWA Install Logic
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("App is already installed or your browser doesn't support installation. (अ‍ॅप आधीच इंस्टॉल केले आहे किंवा तुमचा ब्राउझर सपोर्ट करत नाही.)");
    }
  };

  const handleGetLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords([position.coords.latitude, position.coords.longitude]);
          setView('map');
          setLoading(false);
        },
        (error) => {
          alert(t.locError);
          setLoading(false);
        }
      );
    }
  };

  if (view === 'map' && coords) {
    return <MapSection initialLocation={coords} onBack={() => setView('setup')} />;
  }

  if (view === 'setup') {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col">
        <nav className="bg-white border-b border-emerald-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="bg-emerald-600 p-2 rounded-lg"><Leaf className="text-white" size={24} /></div>
            <span className="text-2xl font-bold text-emerald-900 tracking-tight">KhetGyan</span>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl text-center border border-emerald-100">
            <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"><MapPin className="text-emerald-700" size={40} /></div>
            <h2 className="text-4xl font-extrabold text-emerald-950 mb-4">{t.setupTitle}</h2>
            <p className="text-emerald-800/70 mb-10 text-lg leading-relaxed">{t.setupDesc}</p>
            <button onClick={handleGetLocation} disabled={loading} className="w-full bg-emerald-700 text-white px-8 py-5 rounded-2xl font-bold text-xl hover:bg-emerald-800 shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 disabled:bg-emerald-400">
              {loading ? "Locating..." : <><Navigation size={24} /> {t.btnGetLoc}</>}
            </button>
            <button onClick={() => setView('home')} className="mt-10 text-emerald-600 font-bold hover:underline">← Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <nav className="bg-white border-b border-emerald-100 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-lg"><Leaf className="text-white" size={24} /></div>
          <span className="text-2xl font-bold text-emerald-900 tracking-tight">KhetGyan</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <Globe size={18} className="text-emerald-700" />
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-sm font-bold text-emerald-900 outline-none cursor-pointer">
              <option value="en">English</option><option value="hi">हिंदी (Hindi)</option><option value="mr">मराठी (Marathi)</option>
            </select>
          </div>
          <button 
            onClick={handleInstall}
            className="bg-emerald-700 text-white px-6 py-2 rounded-full font-semibold hover:bg-emerald-800 transition-colors"
          >
            {deferredPrompt ? t.btnApp : t.btnAppInstalled}
          </button>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-12 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className={`text-4xl lg:text-7xl font-extrabold text-emerald-950 leading-tight mb-6 ${lang !== 'en' ? 'font-serif' : ''}`}>
            {t.title} <br /> <span className="text-emerald-600">{t.highlight}</span> <br /> {t.suffix}
          </h1>
          <p className="text-xl text-emerald-800 mb-10 max-w-lg leading-relaxed">{t.subtext}</p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setView('setup')} className="bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 shadow-lg shadow-emerald-200 transition-all">{t.btnStart}</button>
            <button className="bg-white text-emerald-900 border-2 border-emerald-100 px-8 py-4 rounded-xl font-bold text-lg hover:border-emerald-200 transition-all">{t.btnLearn}</button>
          </div>
        </div>
        <div className="bg-emerald-200 rounded-[2.5rem] h-[350px] lg:h-[500px] shadow-2xl flex items-center justify-center overflow-hidden border-8 border-white">
          <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000" alt="Lush green field" className="w-full h-full object-cover" />
        </div>
      </header>

      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-emerald-950 mb-16">{t.featureTitle}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 hover:shadow-xl transition-shadow group">
              <div className="bg-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Satellite className="text-white" size={28} /></div>
              <h3 className="text-2xl font-bold text-emerald-900 mb-4">{t.feat1Title}</h3>
              <p className="text-emerald-800/80 text-lg leading-relaxed">{t.feat1Desc}</p>
            </div>
            <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 hover:shadow-xl transition-shadow group">
              <div className="bg-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><CloudRain className="text-white" size={28} /></div>
              <h3 className="text-2xl font-bold text-emerald-900 mb-4">{t.feat2Title}</h3>
              <p className="text-emerald-800/80 text-lg leading-relaxed">{t.feat2Desc}</p>
            </div>
            <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 hover:shadow-xl transition-shadow group">
              <div className="bg-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Target className="text-white" size={28} /></div>
              <h3 className="text-2xl font-bold text-emerald-900 mb-4">{t.feat3Title}</h3>
              <p className="text-emerald-800/80 text-lg leading-relaxed">{t.feat3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-emerald-950 text-emerald-200 py-12 px-6 text-center">
        <p className="text-lg font-semibold mb-2">KhetGyan Precision Agriculture</p>
        <p className="text-emerald-400/60">© 2026 - Helping farmers optimize resources from space.</p>
      </footer>
    </div>
  );
}

export default App;
