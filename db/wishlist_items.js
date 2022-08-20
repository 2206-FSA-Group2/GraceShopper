const client = require("./client");

async function assignItemToWishlist(user_id, product_id) {
    try {
      const {
        rows: [wishListItem],
      } = await client.query(
        `
          INSERT into wishlist_items(user_id, product_id)
          VALUES($1, $2)
          RETURNING *;
          `,
        [user_id, product_id]
      );
      return wishListItem;
    } catch (error) {
      throw error;
    }
  }

  async function removeItemFromWishlist(user_id, product_id ) {
    try {
      await client.query(
        `
      DELETE FROM wishlist_items
      WHERE user_id=$1 AND product_id=$2;`,
        [user_id, product_id]
      );
    } catch (error) {
      throw error;
    }
}

async function getWishlistItemsByUser(id) {
    try {
      const { rows } = await client.query(
        `SELECT * FROM wishlist_items
              WHERE user_id=$1;
              `,
        [id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

module.exports = {assignItemToWishlist, getWishlistItemsByUser, removeItemFromWishlist}