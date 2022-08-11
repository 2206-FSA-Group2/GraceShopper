const { attachItemsToCarts } = require("./cart_items.js");
const client = require("./client");

//creates cart associated with the supplied user object; returns cart object.
async function createCart({ id }) {
  try {
    if (id) {
      const {
        rows: [cart],
      } = await client.query(
        `INSERT INTO carts("user_id")
            VALUES($1)
            RETURNING *;`,
        [id]
      );
      return cart;
    }
  } catch (error) {
    throw error;
  }
}

//sets the cart to purchased -- parameter is a cart object, returns cart object
async function convertCartToPurchased({ id }) {
  try {
    const {
      rows: [cart],
    } = await client.query(
      `
            UPDATE carts
            SET purchased = true
            WHERE id = $1
            RETURNING *;`,
      [id]
    );
    return cart;
  } catch (error) {
    throw error;
  }
}

//deletes non-purchased carts -- parameter is a user object, returns nothing
async function deleteActiveCart({ id }) {
  try {
    if (id) {
      //need to get cart to delete, delete its items, then delete the cart
      const rows = await client.query(
        `SELECT * FROM carts
                 WHERE user_id = $1
                 AND
                 purchased = false;                 
                 `,
        [id]
      );
      const cartId = rows[0]?.id;
      await client.query(
        `DELETE FROM cart_items
                 WHERE cart_id = $1;
                 DELETE FROM carts
                 WHERE id = $1;`,
        [cartId]
      );
    }
  } catch (error) {
    throw error;
  }
}

//gets all carts -- parameter is a user object, returns an array of carts with cart_items attached
async function getPurchasedCartsByUser({ id }) {
  try {
    const { rows: carts } = await client.query(
      `SELECT * from CARTS
            WHERE carts.user_id = $1
            AND purchased = true;
            `,
      [id]
    );
    return attachItemsToCarts(carts);
  } catch (error) {
    throw error;
  }
}

//gets active cart --takes user object and returns cart object
async function getActiveCart({ id }) {
    try {
    const {rows: [cart]} = await client.query(
        `SELECT * from CARTS
        WHERE carts.user_id = $1
        AND purchased = false;
        `,
        [id]
    )
    return cart
    } catch(error) { throw error }
}

module.exports = {
  createCart,
  deleteActiveCart,
  getPurchasedCartsByUser,
  convertCartToPurchased,
  getActiveCart
};
