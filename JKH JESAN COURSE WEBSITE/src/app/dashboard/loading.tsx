export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 animate-pulse">
      <div className="container mx-auto px-4 grid md:grid-cols-[250px_1fr] lg:grid-cols-[280px_1fr] gap-8">
        
        {/* Sidebar Skeleton */}
        <aside className="hidden md:block">
          <div className="sticky top-28 bg-surface p-6 rounded-2xl border border-border h-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-muted shrink-0"></div>
              <div className="space-y-2 w-full">
                <div className="h-4 w-3/4 bg-muted rounded"></div>
                <div className="h-3 w-1/2 bg-muted/50 rounded"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-full bg-muted/50 rounded-xl"></div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className="space-y-8">
          <div>
            <div className="h-10 w-64 bg-muted rounded-lg mb-4"></div>
            <div className="h-4 w-96 bg-muted/50 rounded"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border bg-surface p-6 rounded-xl h-32 shadow-sm"></div>
            ))}
          </div>
          
          <div className="mt-8">
            <div className="h-6 w-40 bg-muted rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 w-full bg-surface border border-border rounded-xl shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
