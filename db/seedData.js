const client = require("./client");
const fs= require('fs');
const { parse } = require("csv-parse");


const itemArr = [];
const categoryArr = [];
const photoArr = [];
let productId=1;

const {
  createUser,
  getUserById
} = require('./users');
const {
  createCart
} = require('./carts')

const {
  createProduct
} = require('./products');

//read the inventory seed file and create objects to be used by product table seeder function.
fs.createReadStream("./product_seed.csv")
  .pipe(parse({ delimeter: ',', from_line: 2 }))
  //for each line of the file, store the data in the appropriate object
  .on("data", function (row) {
    categoryArr.push({"id": row[0]-0,
                      "name": row[1], 
                      "product_id": productId});
    itemArr.push({"name":row[2],
                  "description":row[3],
                  "price":row[4]-0,
                  "quantity_on_hand":row[5]-0})
    if(row[6]!=='') {
      photoArr.push({"product_id":productId,
                     "url":row[6]})
    }
    if(row[7]!=='') {
      photoArr.push({"product_id":productId,
                     "url":row[7]})
    }
    if(row[8]!=='') {
      photoArr.push({"product_id":productId,
                     "url":row[8]})
    }
    productId++; //end of row -- increment for next product
  })
  .on("error", function (error) {
    console.log(error.message)
  })
  .on("end",function () {
//     console.log("finished reading inventory file")
//     console.log("the items are:",itemArr)
// console.log("the category entries are:",categoryArr)
// console.log("the photo entries are:",photoArr);
  })


async function dropTables(){
  console.log("Dropping all tables") 
  await client.query(
     `DROP TABLE IF EXISTS wishlist_items;
     DROP TABLE IF EXISTS orders;
     DROP TABLE IF EXISTS order_status;
     DROP TABLE IF EXISTS addresses;
     DROP TABLE IF EXISTS cart_items;
     DROP TABLE IF EXISTS carts;
     DROP TABLE IF EXISTS reviews;
     DROP TABLE IF EXISTS users;
     DROP TABLE IF EXISTS categories;
     DROP TABLE IF EXISTS product_photos;
     DROP TABLE IF EXISTS products;
     `
   )
}
async function createTables() {
  await dropTables();
  console.log("Starting to build tables...");
  // create all tables, in the correct order
  try {
    await client.query(
      `CREATE TABLE products (
        id SERIAL PRIMARY KEY,
              name VARCHAR(255) UNIQUE NOT NULL,
              description VARCHAR(255) NOT NULL,
              price NUMERIC NOT NULL,
              quantity_on_hand INTEGER,
              is_active BOOLEAN DEFAULT true
      );
      CREATE TABLE product_photos (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) NOT NULL,
        url VARCHAR(255) NOT NULL,
        priority INTEGER
      );
      CREATE TABLE categories(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        product_id INTEGER REFERENCES products(id) NOT NULL
      );

      CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true
      );
      CREATE TABLE reviews(
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        rating INTEGER NOT NULL,
        title VARCHAR(255),
        description VARCHAR(255)
      );

      CREATE TABLE carts(
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        purchased BOOLEAN DEFAULT false
      );

      CREATE TABLE cart_items(
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES carts(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC NOT NULL
      );
      
      CREATE TABLE addresses(
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        label VARCHAR(255),
        street1 VARCHAR(255) NOT NULL,
        street2 VARCHAR(255),
        city VARCHAR(255) NOT NULL,
        state VARCHAR(2) NOT NULL,
        zip INTEGER NOT NULL 
      );

      CREATE TABLE order_status(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255)
      );

      CREATE TABLE orders(
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES carts(id),
        address_id INTEGER REFERENCES addresses(id),
        status INTEGER REFERENCES order_status(id)
      );

      CREATE TABLE wishlist_items(
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id)
      );
      `
    );
  } catch (error) {
    throw error;
  }
}

async function createInitialUsers() {
  console.log('Starting to create users...');
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

async function createInitialProducts() {
  console.log('Starting to create products...');
  try {
    const productsToCreate = [
      { name: 'PlayStation1', description: 'Everything works, brand new!', price: 150, quantity: 5, isActive: true },
      { name: 'PlayStation2', description: 'Barely works', price: 25, quantity: 1, isActive: true  },
      { name: 'Gameboy Color', description: 'Still sealed! Never opened', price: 100, quantity: 4, isActive: true  },
    ];
    const products = await Promise.all(productsToCreate.map(createProduct));

    console.log('Products created:');
    console.log(products);
    console.log('Finished creating products!');
  } catch (error) {
    console.error('Error creating products!');
    throw error;
  }
}
async function createInitialCarts() {
  console.log('Starting to create carts...');
  try {
    const user1 = await getUserById(1);
    console.log("fetched user 1: ", user1)
    const user2 = await getUserById(2);
    const user3 = await getUserById(3);
    const myUsers = [user1, user2, user3];
    const carts = await Promise.all(myUsers.map(createCart));

    console.log('Carts created:');
    console.log(carts);
    console.log('Finished creating products!');
  } catch (error) {
    console.error('Error creating products!');
    throw error;
  }
}


async function rebuildDB() {
  try {
    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialProducts();
    await createInitialCarts();
  } catch (error) {
    console.log('Error during rebuildDB');
    throw error;
  }
}

module.exports = {
  rebuildDB
}
