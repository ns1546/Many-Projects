const r = await fetch('http://localhost:3002/shop-api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `{
      collections(options: { filter: { parentId: { eq: "1" } } }) {
        totalItems
        items {
          id
          name
          slug
        }
      }
    }`
  })
});
const d = await r.json();
console.log(JSON.stringify(d, null, 2));
