const mutation = `
mutation {
    addItemToOrder(productVariantId: "101", quantity: 1) {
        __typename
        ... on Order {
            id
            code
            totalWithTax
            lines {
                id
                quantity
                productVariant {
                    name
                    sku
                }
            }
        }
        ... on ErrorResult {
            errorCode
            message
        }
    }
}
`;

fetch('http://localhost:3002/shop-api', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({query: mutation})
})
.then(r => r.json())
.then(d => console.log('Add to cart result:', JSON.stringify(d, null, 2)))
.catch(console.error);
