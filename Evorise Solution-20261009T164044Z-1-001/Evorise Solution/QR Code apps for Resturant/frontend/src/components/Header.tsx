import { ShoppingCart, Search, Globe } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  tableNumber: string;
  onOpenCart: () => void;
}

export function Header({ cartItemCount, tableNumber, onOpenCart }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass px-4 py-3 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-500/30">
          SG
        </div>
        <div>
          <h1 className="font-bold text-gray-100 leading-tight">Spice Garden</h1>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
              Open
            </span>
            <span>•</span>
            <span className="font-medium bg-white/10 px-2 py-0.5 rounded-full border border-white/5">Table #{tableNumber}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300">
          <Search size={20} />
        </button>
        <button className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 hidden sm:block">
          <Globe size={20} />
        </button>
        <button 
          onClick={onOpenCart}
          className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 relative group"
        >
          <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg shadow-rose-500/40 border border-[#0f172a]">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
