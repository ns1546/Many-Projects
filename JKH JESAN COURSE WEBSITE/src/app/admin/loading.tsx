export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-10 w-64 bg-muted rounded-lg mb-4"></div>
        <div className="h-4 w-96 bg-muted/50 rounded"></div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-border bg-surface p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-muted"></div>
              <div className="h-8 w-16 bg-muted rounded"></div>
            </div>
            <div className="h-4 w-24 bg-muted/50 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
