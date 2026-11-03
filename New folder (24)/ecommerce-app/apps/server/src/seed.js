const api = "http://localhost:3002/admin-api";

async function req(query, variables = {}, token = "") {
    const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? {"Authorization": `Bearer ${token}`} : {}) },
        body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (json.errors) console.error(JSON.stringify(json.errors, null, 2));
    return json.data;
}

async function seed() {
    console.log("Logging in...");
    const loginData = await req(`
        mutation {
            login(username: "superadmin", password: "superadmin") {
                ... on CurrentUser {
                    id
                }
            }
        }
    `);
    // Wait, the Vendure default is cookie auth, or we can get token. Let's see if we get a token.
    // Wait, by default Vendure uses tokenMethod: ['bearer', 'cookie']. So we can get a token by checking headers, OR we just use a script inside the Nest app.
}
seed();
