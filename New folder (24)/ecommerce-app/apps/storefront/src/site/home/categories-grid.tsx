import { Link } from '@/platform/i18n/navigation';
import { ArrowUpRight, Headphones, Laptop, Watch, Zap } from 'lucide-react';
import Image from 'next/image';

const categories = [
  {
    title: "Audio & Acoustics",
    slug: "audio-sound",
    count: "4 Products",
    description: "Active noise-cancelling headphones, true wireless earbuds, and bookshelf monitors.",
    icon: Headphones,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    gradient: "from-blue-600/80 to-indigo-900/80"
  },
  {
    title: "Computing & Desk",
    slug: "computing-desk",
    count: "4 Products",
    description: "CNC gasket mechanical keyboards, precision mice, and ultrawide curved monitors.",
    icon: Laptop,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    gradient: "from-emerald-600/80 to-teal-900/80"
  },
  {
    title: "Wearables & Tech",
    slug: "wearables-watches",
    count: "4 Products",
    description: "Grade 5 titanium sapphire smartwatches, biometric health rings, and mechanical timepieces.",
    icon: Watch,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    gradient: "from-amber-600/80 to-orange-900/80"
  },
  {
    title: "Power & Travel Gear",
    slug: "power-travel",
    count: "4 Products",
    description: "140W GaN chargers, foldable MagSafe stations, and weatherproof Cordura commuter backpacks.",
    icon: Zap,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    gradient: "from-violet-600/80 to-purple-900/80"
  }
];

export function CategoriesGrid() {
  return (
    <section id="categories" className="py-20 bg-background border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Department Showcase</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2 text-foreground">
              Explore by Category
            </h2>
            <p className="text-muted-foreground mt-2 text-base max-w-xl">
              Each piece of hardware in our catalog is rigorously engineered for precision, longevity, and peak sensory delight.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            <span>View All Departments</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/collection/${cat.slug}`}
                className="group relative h-96 rounded-2xl overflow-hidden border border-border/60 bg-muted/40 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-end p-6"
              >
                {/* Background Image */}
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 filter brightness-[0.75] group-hover:brightness-[0.6]"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300" />
                <div className={`absolute inset-0 bg-gradient-to-tr ${cat.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 mix-blend-overlay`} />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <div className="size-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                    <Icon className="size-4" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-medium text-white/90">
                    {cat.count}
                  </span>
                </div>

                {/* Card Content */}
                <div className="relative z-10 space-y-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{cat.title}</span>
                    <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </h3>
                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="pt-2">
                    <span className="inline-block text-xs font-semibold text-white/80 group-hover:text-white underline underline-offset-4">
                      Shop Collection &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
