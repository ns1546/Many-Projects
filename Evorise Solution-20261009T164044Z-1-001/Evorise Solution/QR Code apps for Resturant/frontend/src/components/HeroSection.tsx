import { Clock, Star, Flame } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative w-full h-72 sm:h-80 overflow-hidden group">
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700 z-10"></div>
      <img 
        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200" 
        alt="Restaurant Interior" 
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent z-20 flex flex-col justify-end p-6 text-white">
        <div className="animate-slide-up">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-2 text-gradient tracking-tight">Spice Garden</h2>
          <p className="text-gray-300 text-sm sm:text-base mb-5 font-light">Experience the finest authentic culinary journey.</p>
          
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1.5 glass px-4 py-2 rounded-full border-white/10">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span className="text-gray-100">4.8 <span className="text-gray-400 font-normal">(2.4k)</span></span>
            </div>
            <div className="flex items-center gap-1.5 glass px-4 py-2 rounded-full border-white/10 text-gray-100">
              <Clock size={16} className="text-rose-400" />
              <span>15-25 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
