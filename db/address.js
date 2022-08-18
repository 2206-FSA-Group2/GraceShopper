const client = require("./client");

async function createAddress({userId, label, street1, street2, city, state, zipcode }){
    try{
        const{
            rows: [address],
        } = await client.query (
            `INSERT into addresses (user_id, label, street1, street2, city, state, zip)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
            `,
            [userId, label, street1, street2, city, state, zipcode]
        );
            return address;
    } catch (error){
        console.error(error);
    }
}

async function getAddressByUserId(userId){
    try{
        const{
            rows: [address],
        } = await client.query (
            `SELECT *
            FROM addresses
            WHERE user_id = $1;
            `,
            [userId]
        );
        return address;
    } catch (error){
        console.error(error)
    }
}

async function updateAddress({ id, ...fields }) {
    const setString = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(", ");
  
    try {
      const {
        rows: [address],
      } = await client.query(
        `
          UPDATE addresses
          SET ${setString}
          WHERE id=${id}
          RETURNING *;
        `,
        Object.values(fields)
      );
      return address;
    } catch (error){
        console.error(error)
    }
}

async function deleteAddress(id, userId){
    try{
        const{
            rows: [address],
        } = await client.query (
            `DELETE FROM addresses
            WHERE id=$1 
            AND user_id = $2
            RETURNING *;
            `,
            [id, userId]
        );
        return address;
    } catch (error){
        console.error(error)
    }
}

async function attachAddressToOrder({userId, label, street1, street2, city, state, zipcode}){
    try{
        const{
            rows: [address],
        } = await client.query (
            `SELECT orders.*, label, street1, street2, city, state, zip
            FROM addresses
            JOIN addresses ON 
            RETURNING *;
            `,
            [id]
        );
        return address;
    } catch (error){
        console.error(error)
    }
}


module.exports = {
    createAddress,
    getAddressByUserId,
    updateAddress,
    deleteAddress
}