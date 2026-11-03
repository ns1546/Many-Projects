const query = `
query {
    product(id: "101") {
        id
        name
        variants {
            id
            sku
            stockLevel
            priceWithTax
        }
    }
}
`;

fetch('http://localhost:3002/shop-api', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({query})
})
.then(r => r.json())
.then(d => console.log('Product 101 Result:', JSON.stringify(d, null, 2)))
.catch(console.error);
