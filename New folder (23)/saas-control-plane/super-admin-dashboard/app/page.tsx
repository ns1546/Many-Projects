"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [domain, setDomain] = useState("");

  const fetchTenants = async () => {
    try {
      // In production, point to the actual Management API domain
      const res = await axios.get("http://localhost:4000/api/tenants");
      setTenants(res.data);
    } catch (error) {
      console.error("Failed to fetch tenants", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    try {
      // 1. Create Owner
      const ownerRes = await axios.post("http://localhost:4000/api/owners", {
        email,
        password: "securepassword", // Hardcoded for MVP UI demo
        name,
      });

      // 2. Provision Tenant Instance
      await axios.post("http://localhost:4000/api/tenants", {
        ownerId: ownerRes.data.id,
        storeName,
        domain,
      });

      alert("Tenant provisioned successfully! Docker instance is booting up.");
      fetchTenants(); // Refresh list
    } catch (error) {
      alert("Error provisioning tenant.");
      console.error(error);
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants Overview</h1>
          <p className="text-slate-400 mt-1">Manage isolated Saleor instances for your business owners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Provisioning Form */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
              <span className="mr-2">🚀</span> Provision New Store
            </h3>
            <form onSubmit={handleProvision} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Owner Name</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Owner Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" placeholder="john@example.com" />
              </div>
              <div className="h-px bg-slate-800 my-4"></div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Store Name</label>
                <input required type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" placeholder="John's Sneakers" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Subdomain</label>
                <div className="flex">
                  <input required type="text" value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full bg-background border border-slate-700 rounded-l-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" placeholder="johnsneakers" />
                  <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-slate-700 bg-slate-800 text-slate-400 text-sm">
                    .saas.local
                  </span>
                </div>
              </div>
              
              <button disabled={isProvisioning} type="submit" className="w-full mt-4 bg-primary hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-primary/25 disabled:opacity-50">
                {isProvisioning ? "Provisioning Docker Instance..." : "Deploy Isolated Instance"}
              </button>
            </form>
          </div>
        </div>

        {/* Tenant List Table */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50">
              <h3 className="font-semibold text-white">Active Instances</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-surface border-b border-slate-800 uppercase text-xs text-slate-500 font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Store Name</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">API Port</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading instances...</td>
                    </tr>
                  ) : tenants.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No tenants provisioned yet. Use the form to deploy your first Saleor instance!</td>
                    </tr>
                  ) : (
                    tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{tenant.storeName}
                          <div className="text-xs text-slate-500 font-normal mt-1">{tenant.domain}</div>
                        </td>
                        <td className="px-6 py-4">{tenant.owner?.name}</td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">:{tenant.apiPort}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tenant.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              tenant.status === 'ACTIVE' ? 'bg-green-400' : 'bg-yellow-400'
                            }`}></span>
                            {tenant.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
