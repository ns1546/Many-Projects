import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const guarantees = [
  {
    icon: Truck,
    title: "Global Express Delivery",
    description: "Complimentary priority shipping on orders over $50 with real-time end-to-end tracking.",
    badge: "Fast & Insured"
  },
  {
    icon: ShieldCheck,
    title: "2-Year Official Warranty",
    description: "Every device is backed by our full manufacturer guarantee and rapid replacement policy.",
    badge: "Guaranteed"
  },
  {
    icon: RotateCcw,
    title: "30-Day Risk-Free Trial",
    description: "Test our hardware in your own setup. If it doesn't exceed your expectations, return it hassle-free.",
    badge: "100% Refund"
  },
  {
    icon: Headphones,
    title: "24/7 Hardware Concierge",
    description: "Direct access to our expert support engineers via priority live chat and dedicated support.",
    badge: "Always Available"
  }
];

export function TrustSection() {
  return (
    <section className="py-20 bg-background border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Uncompromising Standards</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-foreground">
            The Nexus Guarantee
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            We hold our service, shipping, and customer experience to the same rigorous tolerances as our hardware.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative group p-6 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
