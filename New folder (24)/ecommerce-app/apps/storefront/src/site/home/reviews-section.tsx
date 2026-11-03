import { Star, CheckCircle, Quote } from 'lucide-react';

const reviews = [
  {
    author: "Alex Rivera",
    role: "Lead Sound Engineer & Producer",
    product: "AeroSound Apex Pro",
    rating: 5,
    date: "Verified Buyer • 3 days ago",
    content: "The acoustic tuning on the Apex Pro is breathtaking. Beryllium drivers give you transient speed and sub-bass control that usually costs $800+. The hybrid ANC completely deletes airplane engine hum."
  },
  {
    author: "David Chen",
    role: "Staff Software Engineer, Remote",
    product: "CyberDeck 75% Mechanical Keyboard",
    rating: 5,
    date: "Verified Buyer • 1 week ago",
    content: "Hands down the most refined typing experience on the market. Gasket mount cushioning, pre-lubed switches right out of the box, and zero chassis ping. My wrist fatigue completely vanished."
  },
  {
    author: "Maya Lindqvist",
    role: "Industrial Product Designer",
    product: "Chronos Titanium Smartwatch",
    rating: 5,
    date: "Verified Buyer • 2 weeks ago",
    content: "Incredible attention to industrial design. The Grade 5 titanium beveling and sapphire lens are sublime. Battery actually lasted 13 full days with GPS active. Fast checkout and delivered in 48 hours."
  }
];

export function ReviewsSection() {
  return (
    <section className="py-20 bg-muted/20 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-4 fill-amber-400" />
            ))}
            <span className="text-xs font-bold text-foreground ml-2">4.9 / 5.0 Global Rating</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Loved by Audio &amp; Hardware Enthusiasts
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Read unedited feedback from sound engineers, developers, and creators worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="relative p-7 rounded-2xl border border-border/70 bg-card shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <Quote className="size-8 text-primary/20 mb-4" />
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed italic mb-6">
                  &ldquo;{rev.content}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-foreground">{rev.author}</h4>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                    <CheckCircle className="size-3" /> Verified
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{rev.role}</p>
                <div className="mt-2 text-[11px] text-primary font-medium">
                  Purchased: {rev.product}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
