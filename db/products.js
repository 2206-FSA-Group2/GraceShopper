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

async function getAllProducts(){
    try {
        const { rows } = await client.query(
          `
          SELECT *
          FROM products
        `
        );
        return rows;
      } catch (error) {
        console.error(error);
      }
}

async function getProductsById(id){
    try {
        const {
          rows: [product],
        } = await client.query(`
        SELECT *   
        FROM products
        WHERE id=${id};
        `);
        return product;
      } catch (error) {
        console.error(error);
      }
}

async function updateProduct({id, ...fields}){
    const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [product],
    } = await client.query(
      `
        UPDATE products
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `,
      Object.values(fields)
    );
    return product;
  } catch (error) {
    console.error(error);
  }
}

async function destroyProduct(id){
try {
    const {rows: [product]} = await client.query(
        `
        DELETE FROM products
        WHERE id=$1
        RETURNING *;
      `,
        [id]
      );
      return product
} catch (error) {
    console.error(error);
}
}

async function createInitialCategories() {
    console.log('Starting to create categories...');
    try {
      const usersToCreate = [
        { email: 'albert', password: 'bertie99', firstName: `Albert`, lastName: `Sanchez`, isAdmin: false, isActive: true },
        { email: 'sandra', password: 'sandra123', firstName: `Sandra`, lastName: `Hills`, isAdmin: false, isActive: true },
        { email: 'glamgal', password: 'glamgal123', firstName: `Glamgal`, lastName: `Dwarf`, isAdmin: false, isActive: true },
      ];
      const users = await Promise.all(usersToCreate.map(createUser));
  
      console.log('Users created:');
      console.log(users);
      console.log('Finished creating users!');
    } catch (error) {
      console.error('Error creating users!');
      throw error;
    }
  }


module.exports = {createProduct, getAllProducts, getProductsById, updateProduct, destroyProduct}