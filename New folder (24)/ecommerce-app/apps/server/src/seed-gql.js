const api = "http://localhost:3002/admin-api";

async function seed() {
    console.log("Logging in...");
    const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: `mutation { login(username: "superadmin", password: "superadmin") { ... on CurrentUser { id } } }`
        })
    });
    const token = res.headers.get("vendure-auth-token");

    const reqAuth = async (query, variables) => {
        const r = await fetch(api, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify({ query, variables })
        });
        const json = await r.json();
        if (json.errors) console.error(JSON.stringify(json.errors, null, 2));
        return json.data;
    };

    console.log("Updating GlobalSettings...");
    await reqAuth(`
        mutation {
            updateGlobalSettings(input: {
                customFields: {
                    heroTitle: "Welcome to Our Professional Store",
                    heroSubtitle: "High Grade E-commerce Experience",
                    heroLink: "/search",
                    promoText: "Use code LAUNCH20 for 20% off",
                    promoLink: "/search",
                    heroBanner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
                }
            }) { ... on GlobalSettings { id } }
        }
    `);

    console.log("Creating Collection...");
    await reqAuth(`
        mutation {
            createCollection(input: {
                translations: [{ languageCode: en, name: "Electronics", slug: "electronics", description: "Electronic devices" }],
                filters: []
            }) { id }
        }
    `);

    console.log("Done seeding via GraphQL.");
}
seed();
