import { Logo } from "@/components/shared/Logo";

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-background text-foreground select-none">
      <div className="relative flex flex-col items-center max-w-sm text-center">
        
        {/* Ambient background glow */}
        <div className="absolute w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none -top-12" />

        {/* Logo / Brand badge with pulse ring */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-lg relative z-10">
            <Logo size="sm" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping opacity-30" />
        </div>

        {/* Audio Waveform Equalizer Loading Animation */}
        <div className="flex items-center gap-1.5 h-8 mb-5">
          <span className="w-1.5 bg-primary rounded-full animate-[soundWave_1s_ease-in-out_infinite] h-3" />
          <span className="w-1.5 bg-primary rounded-full animate-[soundWave_1.2s_ease-in-out_infinite_0.2s] h-6" />
          <span className="w-1.5 bg-primary rounded-full animate-[soundWave_0.8s_ease-in-out_infinite_0.4s] h-8" />
          <span className="w-1.5 bg-primary rounded-full animate-[soundWave_1.1s_ease-in-out_infinite_0.1s] h-5" />
          <span className="w-1.5 bg-primary rounded-full animate-[soundWave_0.9s_ease-in-out_infinite_0.3s] h-7" />
          <span className="w-1.5 bg-primary rounded-full animate-[soundWave_1.3s_ease-in-out_infinite_0.5s] h-4" />
        </div>

        {/* Bengali Loading Text */}
        <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground mb-1 flex items-center gap-2">
          <span>লোড হচ্ছে</span>
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
          </span>
        </h3>

        <p className="text-xs sm:text-sm text-foreground/60 font-medium">
          কন্টেন্ট প্রস্তুত করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
        </p>
      </div>
    </div>
  );
}

