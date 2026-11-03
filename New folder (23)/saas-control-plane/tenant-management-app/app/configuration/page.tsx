"use client";

export default function ConfigurationPage() {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>Store Subscription & Settings</h1>
        
        <div style={{ marginTop: "20px" }}>
          <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Current Plan: Professional</h3>
            <p style={{ margin: "0", color: "#666" }}>Your store is currently active and processing orders.</p>
          </div>
        </div>

        <div style={{ marginTop: "30px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px" }}>Store Front Theme</h2>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>Select the primary color for your storefront (this will sync to your isolated Next.js storefront).</p>
          
          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ width: "40px", height: "40px", background: "#3b82f6", borderRadius: "50%", cursor: "pointer", border: "2px solid #000" }}></div>
            <div style={{ width: "40px", height: "40px", background: "#10b981", borderRadius: "50%", cursor: "pointer" }}></div>
            <div style={{ width: "40px", height: "40px", background: "#f43f5e", borderRadius: "50%", cursor: "pointer" }}></div>
            <div style={{ width: "40px", height: "40px", background: "#8b5cf6", borderRadius: "50%", cursor: "pointer" }}></div>
          </div>
        </div>

        <div style={{ marginTop: "40px" }}>
          <button style={{ background: "#111", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Save SaaS Settings</button>
        </div>
      </div>
    </div>
  );
}
