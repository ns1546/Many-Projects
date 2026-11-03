"use client";

if (typeof window !== "undefined") {
  if (!(window as any).process) {
    (window as any).process = { env: { NEXTAUTH_URL: "http://localhost:3000", NODE_ENV: "development" } };
  } else if (!(window as any).process.env) {
    (window as any).process.env = { NEXTAUTH_URL: "http://localhost:3000", NODE_ENV: "development" };
  }

  if (!(window as any).__safeDomPatched) {
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
}

export default function ClientInit() {
  return null;
}
