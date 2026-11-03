import { TextShimmer } from "@/components/ui/text-shimmer";

export default function TextShimmerDemo() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <TextShimmer
          text="Generating your response..."
          as="h2"
          className="text-3xl sm:text-4xl font-semibold tracking-tight"
        />
        <p className="text-sm text-muted-foreground">
          Theme-aware CSS background-clip shine with zero layout shift
        </p>
      </div>
    </div>
  );
}
