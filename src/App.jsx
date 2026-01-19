import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Search, Wind, Droplets, Sun, Cloud, CloudRain,
  MapPin, Activity, Thermometer, Zap,
  CloudLightning, CloudSnow, Calendar, Mail, ArrowUp, ArrowDown
} from 'lucide-react';

// --- API CONFIGURATION ---
const API_KEY = 'b39da27be475d9ca4f128048d75556b3';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';
const EMAIL = "beingabhinavtiwari@gmail.com";

// --- HELPER: Calculate US AQI from PM2.5 (0-500 Scale) ---
const calculateUSAQI = (pm25) => {
  const c = Math.round(pm25 * 10) / 10;
  if (c <= 12.0) return Math.round(((50 - 0) / (12.0 - 0)) * (c - 0) + 0);
  if (c <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (c - 12.1) + 51);
  if (c <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (c - 35.5) + 101);
  if (c <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (c - 55.5) + 151);
  if (c <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (c - 150.5) + 201);
  if (c <= 350.4) return Math.round(((400 - 301) / (350.4 - 250.5)) * (c - 250.5) + 301);
  if (c <= 500.4) return Math.round(((500 - 401) / (500.4 - 350.5)) * (c - 350.5) + 401);
  return 500;
};

const App = () => {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [tomorrow, setTomorrow] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (city) => {
    setLoading(true);
    try {
      // 1. Current Weather
      const weatherRes = await axios.get(`${BASE_URL}weather?q=${city}&units=metric&appid=${API_KEY}`);
      setWeather(weatherRes.data);
      const { lat, lon } = weatherRes.data.coord;

      // 2. Forecast (Get Tomorrow's Data)
      const forecastRes = await axios.get(`${BASE_URL}forecast?q=${city}&units=metric&appid=${API_KEY}`);

      const today = new Date();
      const tomorrowDate = new Date(today);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const dateString = tomorrowDate.toISOString().split('T')[0];

      const tomorrowReadings = forecastRes.data.list.filter(reading => reading.dt_txt.includes(dateString));

      if (tomorrowReadings.length > 0) {
        const temps = tomorrowReadings.map(r => r.main.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const middayReading = tomorrowReadings.find(r => r.dt_txt.includes("12:00:00")) || tomorrowReadings[0];
        setTomorrow({ ...middayReading, minTemp, maxTemp });
      }

      // 3. AQI Data
      const aqiRes = await axios.get(`${BASE_URL}air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
      const rawData = aqiRes.data.list[0];

      // Calculate Real Number (0-500)
      const realAqi = calculateUSAQI(rawData.components.pm2_5);

      setAqi({ ...rawData, realAqi });

    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Delhi');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) fetchWeather(query);
  };

  const getWeatherIcon = (main, size = 48) => {
    switch (main?.toLowerCase()) {
      case 'clear': return <Sun className="text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)]" size={size} />;
      case 'clouds': return <Cloud className="text-gray-300 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]" size={size} />;
      case 'rain':
      case 'drizzle': return <CloudRain className="text-blue-400 drop-shadow-[0_0_25px_rgba(96,165,250,0.6)]" size={size} />;
      case 'thunderstorm': return <CloudLightning className="text-purple-400 drop-shadow-[0_0_25px_rgba(192,132,252,0.6)]" size={size} />;
      case 'snow': return <CloudSnow className="text-cyan-200 drop-shadow-[0_0_25px_rgba(165,243,252,0.6)]" size={size} />;
      default: return <Cloud className="text-gray-300" size={size} />;
    }
  };

  const getAqiInfo = (index) => {
    const levels = {
      1: { text: "Good", color: "text-green-400", bar: "bg-green-400", desc: "Air quality is satisfactory." },
      2: { text: "Fair", color: "text-yellow-400", bar: "bg-yellow-400", desc: "Air quality is acceptable." },
      3: { text: "Moderate", color: "text-orange-400", bar: "bg-orange-400", desc: "Sensitive groups may affect." },
      4: { text: "Poor", color: "text-red-400", bar: "bg-red-400", desc: "Health effects may occur." },
      5: { text: "Hazardous", color: "text-red-600", bar: "bg-red-600", desc: "Health warnings of emergency conditions." }
    };
    return levels[index] || levels[1];
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-500/30">

      {/* --- Smooth Background Orbs (Slow) --- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-500/20 rounded-full blur-[120px] animate-slow-pulse mix-blend-screen" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-500/20 rounded-full blur-[120px] animate-slow-pulse mix-blend-screen" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px] animate-slow-pulse mix-blend-screen" style={{ animationDelay: '7s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto"
      >

        {/* --- LEFT PANEL --- */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel rounded-[2.5rem] p-10 flex flex-col justify-between h-full min-h-[600px] relative overflow-hidden">

            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                  <Zap size={22} className="text-white" fill="currentColor" />
                </div>
                <h1 className="text-xl font-bold tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">WEATHER.IO</h1>
              </div>

              <form onSubmit={handleSearch} className="relative mb-10 group z-20">
                <input
                  type="text"
                  placeholder="Search city..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full glass-input rounded-2xl py-5 pl-14 pr-6 text-lg text-white placeholder-white/30 outline-none focus:ring-2 ring-blue-500/30 transition-all"
                />
                <Search className="absolute left-5 top-5 text-white/40 group-focus-within:text-white transition-colors" size={24} />
              </form>
            </div>

            {/* Main Weather */}
            {weather && (
              <div className="relative z-10 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-blue-100 mb-6 bg-blue-500/10 w-fit px-5 py-2 rounded-full border border-blue-500/20 backdrop-blur-md">
                  <MapPin size={18} />
                  <span className="text-sm font-semibold tracking-wide uppercase">{weather.name}, {weather.sys.country}</span>
                </div>

                <div className="flex flex-col">
                  <h1 className="text-[10rem] leading-none font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20 tracking-tighter -ml-2">
                    {Math.round(weather.main.temp)}°
                  </h1>
                  <div className="flex items-center gap-5 mt-4">
                    {getWeatherIcon(weather.weather[0].main, 56)}
                    <span className="text-3xl capitalize font-medium text-white/90">{weather.weather[0].description}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer with Hover Email */}
            <div className="pt-8 mt-auto border-t border-white/5 flex items-end justify-between">
              <div className="relative group">
                <p className="text-[10px] text-blue-300/70 uppercase tracking-widest mb-1.5 font-semibold">Designed By</p>
                <a href={`mailto:${EMAIL}`} className="text-base font-bold text-white hover:text-blue-300 transition-colors flex items-center gap-2 pb-1">
                  Abhinav Tiwari
                  <Mail size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-300" />
                </a>

                {/* Email Tooltip */}
                <div className="absolute bottom-full left-0 mb-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-30">
                  <div className="glass-panel px-4 py-2 rounded-xl text-sm text-white/90 whitespace-nowrap shadow-xl flex items-center gap-2">
                    <Mail size={14} className="text-blue-300" /> {EMAIL}
                  </div>
                  <div className="w-3 h-3 bg-white/10 border-r border-b border-white/10 transform rotate-45 absolute left-6 -bottom-1.5 backdrop-blur-xl"></div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                <p className="text-sm text-white/50 font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL --- */}
        <div className="lg:col-span-7 flex flex-col gap-8">

          {/* Row 1: Highlights */}
          <div className="grid grid-cols-3 gap-6">
            {weather && (
              <>
                <StatCard label="Wind" value={`${weather.wind.speed} km/h`} icon={Wind} />
                <StatCard label="Humidity" value={`${weather.main.humidity}%`} icon={Droplets} />
                <StatCard label="Real Feel" value={`${Math.round(weather.main.feels_like)}°`} icon={Thermometer} />
              </>
            )}
          </div>

          {/* Row 2: AQI & Tomorrow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">

            {/* AQI CARD (UPDATED WITH REAL NUMBER) */}
            {aqi && (
              <div className="glass-panel rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-40 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-white/10 transition-colors duration-500"></div>

                <div className="flex justify-between items-start z-10 mb-auto">
                  <div className="p-3.5 bg-white/5 rounded-2xl text-white/80">
                    <Activity size={24} />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${getAqiInfo(aqi.main.aqi).color.replace('text', 'bg')}/20 ${getAqiInfo(aqi.main.aqi).color}`}>
                    Air Quality
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-center z-10 mt-4">
                  {/* REAL 0-500 NUMBER */}
                  <span className="text-6xl font-bold leading-none mb-2 tracking-tighter">{aqi.realAqi}</span>

                  {/* STATUS TEXT (Hazardous, etc) */}
                  <span className={`text-3xl font-bold block ${getAqiInfo(aqi.main.aqi).color} mb-4`}>
                    {getAqiInfo(aqi.main.aqi).text}
                  </span>

                  <p className="text-base text-white/60 mb-6 leading-relaxed font-medium">
                    {getAqiInfo(aqi.main.aqi).desc}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden flex p-0.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div key={lvl} className={`flex-1 mx-0.5 rounded-full transition-all duration-500 ${lvl <= aqi.main.aqi ? getAqiInfo(lvl).bar : 'bg-transparent'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TOMORROW CARD */}
            {tomorrow && (
              <div className="glass-panel rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group hover:bg-white/5 transition-colors cursor-default">
                <div className="absolute bottom-0 left-0 p-40 bg-blue-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500"></div>

                <div className="flex justify-between items-start z-10 mb-auto">
                  <div className="p-3.5 bg-blue-500/20 rounded-2xl text-blue-200">
                    <Calendar size={24} />
                  </div>
                  <span className="text-xs font-bold bg-blue-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider text-blue-200">Tomorrow</span>
                </div>

                <div className="z-10 mt-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <span className="text-6xl font-bold block mb-2">{Math.round(tomorrow.main.temp)}°</span>
                      <span className="text-lg text-white/70 capitalize font-medium">{tomorrow.weather[0].description}</span>
                    </div>
                    <div className="drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      {getWeatherIcon(tomorrow.weather[0].main, 80)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                      <ArrowDown size={18} className="text-blue-300" />
                      <div>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Min</p>
                        <p className="text-lg font-bold">{Math.round(tomorrow.minTemp)}°</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                      <ArrowUp size={18} className="text-red-300" />
                      <div>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Max</p>
                        <p className="text-lg font-bold">{Math.round(tomorrow.maxTemp)}°</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Clean Stat Card
const StatCard = ({ label, value, icon: Icon }) => (
  <div className="glass-panel rounded-[2rem] p-6 flex flex-col justify-between hover:bg-white/5 transition-colors group h-full">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-white/5 rounded-2xl text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300 group-hover:bg-white/10">
        <Icon size={22} />
      </div>
    </div>
    <div>
      <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  </div>
);

export default App;