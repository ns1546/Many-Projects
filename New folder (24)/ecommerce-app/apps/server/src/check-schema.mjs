async function check() {
  const r = await fetch('http://localhost:3002/admin-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query {
          __type(name: "Mutation") {
            fields {
              name
              args {
                name
                type {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
        }
      `
    })
  });
  const data = await r.json();
  const muts = data.data.__type.fields.filter(f => 
    ['reindex', 'createProduct', 'createProductVariants', 'createAssets', 'createCollection'].includes(f.name)
  );
  console.log(JSON.stringify(muts, null, 2));
}
check();
