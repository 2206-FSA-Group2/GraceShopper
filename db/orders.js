const client = require("./client");

async function createOrder({ cart_id, address_id, status }) {
  try {
    const {
      rows: [order],
    } = await client.query(
      `
              INSERT into orders(cart_id, address_id, status)
              VALUES($1, $2, $3)
              RETURNING *;
              `,
      [cart_id, address_id, status]
    );
    return order;
  } catch (error) {
    console.error(error);
  }
}

async function getAllOrders() {
  try {
    const { rows } = await client.query(
      `
            SELECT *
            FROM orders
          `
    );
    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function getOrdersByUserId(id) {
    try {
      const {
        rows
      } = await client.query(`
          SELECT *   
          FROM orders
          WHERE user_id=$1;
          `, [id]);
      return rows;
    } catch (error) {
      console.error(error);
    }
}

async function getOrderByOrderId(id) {
    try {
      const {
        rows: [order]
      } = await client.query(`
          SELECT *   
          FROM orders
          WHERE id=$1;
          `, [id]);
      return order;
    } catch (error) {
      console.error(error);
    }
}

async function updateOrder({id, ...fields}){
    const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');
  try {
    const {
      rows: [order],
    } = await client.query(
      `
    UPDATE orders
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
`,
      Object.values(fields)
    );
    return order;
  } catch (error) {
    throw error;
    }
}


module.exports = { createOrder, getAllOrders, getOrdersByUserId, getOrderByOrderId, updateOrder };
