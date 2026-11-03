import { Category } from '../data';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryNav({ categories, activeCategoryId, onSelectCategory }: CategoryNavProps) {
  return (
    <div className="sticky top-[65px] z-30 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5 py-3 shadow-lg">
      <div className="flex overflow-x-auto hide-scrollbar px-4 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategoryId === cat.id
                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] scale-105 border border-white/20'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
