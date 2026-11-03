import { Plus, Flame, Leaf } from 'lucide-react';
import { MenuItem } from '../data';

interface MenuCardProps {
  item: MenuItem;
  onAddClick: (item: MenuItem) => void;
}

export function MenuCard({ item, onAddClick }: MenuCardProps) {
  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col sm:flex-row h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(244,63,94,0.15)] cursor-pointer group" onClick={() => onAddClick(item)}>
      <div className="relative h-48 sm:h-auto sm:w-2/5 sm:min-w-[160px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent z-10 sm:bg-gradient-to-r"></div>
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
          {item.isPopular && (
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg border border-white/20">
              <Flame size={12} /> POPULAR
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 z-20">
          {item.isVegetarian ? (
            <div className="glass p-1.5 rounded-full border-emerald-500/50 shadow-lg">
              <Leaf size={14} className="text-emerald-400" />
            </div>
          ) : (
            <div className="glass p-1.5 rounded-full border-rose-500/50 shadow-lg">
               <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow relative z-20">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-100 text-lg leading-tight group-hover:text-rose-400 transition-colors">{item.name}</h3>
        </div>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4 font-light">{item.description}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {item.discountPrice && (
              <span className="text-xs text-gray-500 line-through">৳{item.price}</span>
            )}
            <span className="font-bold text-xl text-gradient">
              ৳{item.discountPrice || item.price}
            </span>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddClick(item);
            }}
            className="bg-white/10 hover:bg-gradient-to-r hover:from-rose-500 hover:to-orange-500 text-white transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg border border-white/10 group-hover:scale-110"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
