// ── Global Process & DOM Environment Polyfill ─────────────────────────
// Guarantees NextAuth and 3rd party libraries never crash on client-side process.env references.

const g = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : {})) as any;

if (!g.process) {
  g.process = { env: { NEXTAUTH_URL: "http://localhost:3000", NODE_ENV: "development" } };
} else if (!g.process.env) {
  g.process.env = { NEXTAUTH_URL: "http://localhost:3000", NODE_ENV: "development" };
}

if (!g.process.env.NEXTAUTH_URL) {
  g.process.env.NEXTAUTH_URL = "http://localhost:3000";
}

// Enterprise DOM removeChild resilience guard
if (typeof window !== "undefined" && !(window as any).__safeDomPatched) {
  const origRemove = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child: any) {
    if (!this.contains(child)) {
      return child;
    }
    return origRemove.call(this, child);
  };

  const origInsert = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode: any, refNode: any) {
    if (refNode && !this.contains(refNode)) {
      return this.appendChild(newNode);
    }
    return origInsert.call(this, newNode, refNode);
  };
  (window as any).__safeDomPatched = true;
}

export {};
