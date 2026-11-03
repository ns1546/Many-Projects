const fs = require('fs');

async function test() {
  const query = `
    query {
      product(id: "1") {
        id
        name
        featuredAsset { preview }
        variants {
          id
          price
          priceWithTax
        }
      }
    }
  `;
  const response = await fetch('http://localhost:3002/shop-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
