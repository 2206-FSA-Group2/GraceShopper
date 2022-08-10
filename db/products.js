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

async function createCategory({name, product_id}){
    try {
        const {
            rows: [product]
        } = await client.query(
            `
            INSERT into categories(name, product_id)
            VALUES($1, $2)
            RETURNING *;
            `,
            [name, product_id]
        );
        return product
    } catch (error) {
        console.error(error)
    }
}

async function createInitialCategories() {
    console.log('Starting to create categories...');
    try {
      const categoriesToCreate = [
        { name: 'Consoles', product_id: 1 },
        { name: 'Software', product_id: 2 },
        { name: 'Hardware', product_id: 3  },
      ];
      const categories = await Promise.all(categoriesToCreate.map(createCategory));
  
      console.log('Categories created:');
      console.log(categories);
      console.log('Finished creating categories!');
    } catch (error) {
      console.error('Error creating categories!');
      throw error;
    }
  }

async function getAllCategories(){
    try {
        const { rows } = await client.query(
          `
          SELECT *
          FROM categories
        `
        );
        console.log("These are all the categories: ", rows)
        return rows;
      } catch (error) {
        console.error(error);
      }
}

async function attachPhotoToProduct({product_id, url, priority}){
    try {
        const {
            rows: [product]
        } = await client.query(
            `
            INSERT into product_photos(product_id, url, priority)
            VALUES($1, $2, $3)
            RETURNING *;
            `,
            [product_id, url, priority]
        );
        return product
    } catch (error) {
        console.error(error)
    }
}

async function createInitialPhotos() {
    console.log('Starting to create photos...');
    try {
      const photosToCreate = [
        { product_id: 1 ,url:"https://upload.wikimedia.org/wikipedia/commons/6/60/Disk_II.jpg" ,priority: 1},
        { product_id: 1 ,url:"http://oldcomputers.net/pics/ti994-monitor.jpg" ,priority: 2},
        { product_id: 2, url:"http://oldcomputers.net/pics/ti994-left.jpg" ,priority: 1 },
        { product_id: 3, url:"https://upload.wikimedia.org/wikipedia/commons/8/8d/Epson-hx-20.jpg" ,priority: 1},
      ];
      const photos = await Promise.all(photosToCreate.map(attachPhotoToProduct));
  
      console.log('Photos created:');
      console.log(photos);
      console.log('Finished creating photos!');
    } catch (error) {
      console.error('Error creating photos!');
      throw error;
    }
  }

async function getPhotosByProductId(product_id){
    try {
        const {
          rows
        } = await client.query(`
        SELECT *    
        FROM product_photos
        WHERE product_id=${product_id};
        `);
        console.log("These are the photos: ", rows)
        return rows;
      } catch (error) {
        console.error(error);
      }
}

module.exports = {createProduct, getAllProducts, getProductsById, updateProduct, destroyProduct, createInitialCategories, getAllCategories, createInitialPhotos, getPhotosByProductId}