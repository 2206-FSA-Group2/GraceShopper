const client = require("./client");

//creates cart item with specified numeric inputs and returns a cartItem object
export async function createCartItem(cartId, productId, quantity, price) {
  try {
    const {
      rows: [cartItem],
    } = await client.query(
      `
        INSERT into cart_items(cart_id,product_id,quantity,price)
        VALUES($1, $2, $3, $4)
        ON CONFLICT (product_id) DO NOTHING
        RETURNING *;
        `,
      [cartId, productId, quantity, price]
    );
    return cartItem;
  } catch (error) {
    throw error;
  }
}

//removes cart_items record associated with the supplied object -- returns nothing.
export async function deleteCartItem({ id }) {
  try {
    await client.query(
      `
    DELETE FROM cart_items
    WHERE id= $1;`,
      [id]
    );
  } catch (error) {
    throw error;
  }
}

async function attachItemsToCarts(carts) {
    const cartsToReturn = [...carts];
    const binds = carts.map((_,index)=> `$${index+1}`).join(", ");
    const cartIds = carts.map((cart)=>cart.id);
    if (!cartIds?.length) return [];

    try {
        const { rows: products } = await client.query(
            `
            SELECT products.id,
                   products.name, 
                   products.description, 
                   cart_items.quantity, 
                   cart_items.price 
                   cart_items.id AS "cartItemId", 
                   cart_items.cart_id
            FROM products JOIN cart_items 
            ON cart_items.product_id = products.id 
            WHERE cart_items.cart_id IN (${binds});
        `,
        cartIds)

        for (const cart of cartsToReturn) {
            const productsToAdd = products.filter((product) => product.cart_id === cart.id
            )
            cart.items = productsToAdd;
        }
        return cartsToReturn;
    }catch (error) { throw error }
}



module.exports = { attachItemsToCart, createCartItem, deleteCartItem };
