import { headers } from "next/headers";
import { GraphQLClient, gql } from "graphql-request";

// This simulates a database lookup in your SaaS Management DB to find the port/API for the tenant
async function getTenantConfig(domain: string) {
  // In production, this fetches from the Prisma management DB or Redis Cache
  console.log("Resolving Saleor API for tenant domain:", domain);
  return {
    apiEndpoint: "http://localhost:8000/graphql/", // Mocking Saleor Core API
    themeColor: "#3b82f6",
    storeName: "SaaS Demo Store",
  };
}

export default async function Home() {
  const headersList = headers();
  const domain = headersList.get("x-tenant-domain") || "localhost";
  
  // 1. Resolve which isolated Saleor instance to talk to
  const tenantConfig = await getTenantConfig(domain);

  // 2. Fetch products dynamically from THAT SPECIFIC isolated database
  const client = new GraphQLClient(tenantConfig.apiEndpoint);
  let products = [];
  try {
    // Note: This requires the Saleor backend to be running.
    // Wrapped in try/catch so it doesn't crash if the Docker backend isn't booted yet.
    const query = gql`
      {
        products(first: 5, channel: "default-channel") {
          edges {
            node {
              id
              name
              pricing {
                priceRange {
                  start {
                    gross { amount currency }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const data: any = await client.request(query);
    products = data?.products?.edges || [];
  } catch (error) {
    console.warn("Saleor API not running or unreachable.", error.message);
  }

  return (
    <div style={{ "--theme-color": tenantConfig.themeColor } as any} className="min-h-screen bg-gray-50 font-sans">
      {/* Dynamic Header */}
      <header className="bg-[var(--theme-color)] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold tracking-tight">{tenantConfig.storeName}</h1>
          <p className="opacity-80 mt-1 text-sm">{domain}</p>
        </div>
      </header>

      {/* Dynamic Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Featured Products</h2>
        
        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
            <span className="text-4xl block mb-4">🛒</span>
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-2">This isolated Saleor instance doesn't have any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p: any) => (
              <div key={p.node.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition border border-gray-100">
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Image</span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900">{p.node.name}</h3>
                  <p className="mt-2 text-xl font-bold text-[var(--theme-color)]">
                    {p.node.pricing?.priceRange?.start?.gross?.amount} {p.node.pricing?.priceRange?.start?.gross?.currency}
                  </p>
                  <button className="mt-4 w-full bg-[var(--theme-color)] hover:opacity-90 text-white font-medium py-2 px-4 rounded-lg transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
