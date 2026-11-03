import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Admin Control Plane | SaaS",
  description: "Manage your universal e-commerce tenants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-surface border-r border-slate-800 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <h1 className="text-xl font-bold text-white tracking-tight">Saleor<span className="text-primary">SaaS</span></h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <a href="#" className="flex items-center px-3 py-2 bg-primary/10 text-primary rounded-lg font-medium transition-colors">
              <span className="mr-3">🏢</span>
              Tenants
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition-colors">
              <span className="mr-3">💳</span>
              Billing
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition-colors">
              <span className="mr-3">⚙️</span>
              Settings
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-background/95 backdrop-blur sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-slate-200">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <button className="text-sm font-medium text-slate-300 hover:text-white transition">Sign Out</button>
            </div>
          </header>
          <div className="p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
