async function run() {
  const r1 = await fetch('http://localhost:3002/admin-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { login(username: "superadmin", password: "superadmin") { ... on CurrentUser { id } } }`
    })
  });
  const token = r1.headers.get('vendure-auth-token');
  console.log('Login token:', token ? 'Success' : 'Failed');

  const r2 = await fetch('http://localhost:3002/admin-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      query: `mutation { reindex { id state progress } }`
    })
  });
  const j2 = await r2.json();
  console.log('Reindex job:', JSON.stringify(j2, null, 2));

  // wait 2 seconds and check search in shop-api
  await new Promise(res => setTimeout(res, 2000));
  const r3 = await fetch('http://localhost:3002/shop-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `{ search(input: { take: 10 }) { totalItems items { productId productName slug } } }`
    })
  });
  const j3 = await r3.json();
  console.log('Search in shop-api:', JSON.stringify(j3, null, 2));
}
run();
