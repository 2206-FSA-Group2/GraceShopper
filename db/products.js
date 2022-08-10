const client = require("./client");

// Adds a product to our db, this takes an object as parameter, returns a product object
async function createProduct({name, description, price, quantity, isActive}){
    try {
        const {
            rows: [product]
        } = await client.query(
            `
            INSERT into products(name, description, price, quantity_on_hand, is_active)
            VALUES($1, $2, $3, $4, $5)
            ON CONFLICT (name) DO NOTHING
            RETURNING *;
            `,
            [name, description, price, quantity, isActive]
        );
        return product
    } catch (error) {
        console.error(error)
    }
}


module.exports = {createProduct}