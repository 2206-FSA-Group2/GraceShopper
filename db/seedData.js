const client = require("./client");
const fs = require("fs");
const { parse } = require("csv-parse");

const itemArr = [];
const categoryLinks = {};
const photoLinks = {};
let allProducts = [];


const {
  createUser,
  getUser,
  getUserById
} = require('./users');
const {
  createCart, getActiveCart, convertCartToPurchased
} = require('./carts')
const {
  assignItemToCart
} = require('./cart_items')

const {
  createProduct,
  assignCategory,
  attachPhotoToProduct,
  getAllProducts,
} = require("./products");

const { createAddress } = require("./address");
const { createInitialReviews } = require("./reviews");


function readInventoryFile() {
  //read the inventory seed file and create objects to be used by product table seeder function.
  fs.createReadStream("./db/product_seed.csv")
    .pipe(parse({ delimeter: ",", from_line: 2 }))
    //for each line of the file, store the product data in the itemArr array; associate the category info and photo urls with the item name so that they can be appropriately linked in the db seeder function.  Note that row[2] is the item's name
    .on("data", function (row) {
      categoryLinks[row[2]] = {
        number: row[0],
        name: row[1],
      };
      itemArr.push({
        name: row[2],
        description: row[3],
        price: row[4] - 0,
        quantity: row[5],
        isActive: true,
      });

      //the following statements check if a photo URL exists on the line.  If the url exists, it gets added to the lookup object under a key with the inventory item's name
      if (row[6] !== "") {
        photoLinks[row[2]] = [
          {
            url: row[6],
            priority: 1,
          },
        ];
      }
      if (row[7] !== "") {
        photoLinks[row[2]].push({
          url: row[7],
          priority: 2,
        });
      }
      if (row[8] !== "") {
        photoLinks[row[2]].push({
          url: row[8],
          priority: 3,
        });
      }
    })
    .on("error", function (error) {
      console.log(error.message);
    })
    .on("end", function () {});
}

async function dropTables() {
  console.log("Dropping all tables");
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
  );
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
        description VARCHAR(255),
        UNIQUE (user_id, product_id)
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

      CREATE TABLE orders(
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES carts(id),
        address_id INTEGER REFERENCES addresses(id),
        status VARCHAR(255) NOT NULL
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
  console.log("Starting to create users...");
  try {
    const usersToCreate = [
      {
        email: "albert",
        password: "bertie99",
        firstName: `Albert`,
        lastName: `Sanchez`,
        isAdmin: true,
        isActive: true,
      },
      {
        email: "sandra",
        password: "sandra123",
        firstName: `Sandra`,
        lastName: `Hills`,
        isAdmin: false,
        isActive: true,
      },
      {
        email: "glamgal",
        password: "glamgal123",
        firstName: `Glamgal`,
        lastName: `Dwarf`,
        isAdmin: false,
        isActive: true,
      },
    ];
    const users = await Promise.all(usersToCreate.map(createUser));

    console.log("Users created:");
    console.log(users);
    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function loginInitialUsers(){
  console.log('Logging in initial users...');
  try {
    const email = "albert"
    const password = "bertie99"
    const users = await getUser({email, password});
    console.log('Users Logged in');
    console.log(users);
    console.log('Finished Logging users!');
  } catch (error) {
    console.error('Error logging users!');
    throw error;
  }
}

async function createInitialAddress(){
  console.log('Creating initial address...');
  try{
    const addressToCreate = [
      {
        userId: 1,
        label: 'This is my primary residence',
        street1: '428 Albert Street',
        street2: '812 Yellow Lane',
        city: 'New York City',
        state: 'NY',
        zipcode: 98876,
      },
      {
        userId: 2,
        label: 'This is my work residence',
        street1: '428 Sandra Street',
        street2: '218 Green Lane',
        city: 'San Diego',
        state: 'CA',
        zipcode: 98876,
      },
      {
        userId: 3,
        label: 'This is my secondary residence',
        street1: '428 Gandalf Street',
        street2: '128 Blue Lane',
        city: 'Houston',
        state: 'TX',
        zipcode: 98876,
      }
    ];
    const address = await Promise.all(addressToCreate.map(createAddress));

    console.log(address);
    console.log('Finished creating address..');

  } catch (error){
    console.error('Error creating address');
    throw error;
  }
}

async function createInitialProducts() {
  console.log("Starting to create products...");
  try {
    //create products from the contents of the inventory file that we read above:

    const products = await Promise.all(itemArr.map(createProduct));

    console.log("Products created:");
    console.log(products);
    console.log("Finished creating products!");
  } catch (error) {
    console.error("Error creating products!");
    throw error;
  } finally {
    allProducts = await getAllProducts();
    createInitialCategories();
    createInitialPhotos();
  }
}
async function createInitialCategories() {
  console.log("Starting to create categories...");
  try {
    for (product of allProducts) {
      await assignCategory({
        name: categoryLinks[product.name].name,
        product_id: product.id,
      });
    }
  } catch (error) {
    console.error("Error creating categories!");
    throw error;
  }
}

async function createInitialPhotos() {
  console.log("Starting to create photos...");
  try {
    // const photosToCreate = [
    //   {
    //     product_id: 1,
    //     url: "https://upload.wikimedia.org/wikipedia/commons/6/60/Disk_II.jpg",
    //     priority: 1,
    //   },
    //   {
    //     product_id: 1,
    //     url: "http://oldcomputers.net/pics/ti994-monitor.jpg",
    //     priority: 2,
    //   },
    //   {
    //     product_id: 2,
    //     url: "http://oldcomputers.net/pics/ti994-left.jpg",
    //     priority: 1,
    //   },
    //   {
    //     product_id: 3,
    //     url: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Epson-hx-20.jpg",
    //     priority: 1,
    //   },
    // ];
    //photoLinks has the URLs of the photo in an array associated with each product--now that product IDs exist, associate the correct one with each URL so that we can build out the product_photos table
    for (product of allProducts) {
      photoLinks[product.name].map((p) => (p.product_id = product.id));
    }
    //now each photo item has the correct product_id set--call attachPhoto on each photo object
    for (const item in photoLinks) {
      photoLinks[item].map(attachPhotoToProduct);
    }

    console.log("Finished creating photos!");
  } catch (error) {
    console.error("Error creating photos!");
    throw error;
  }
}
async function createInitialCarts() {
  console.log("Starting to create carts...");
  try {
    const user1 = await getUserById(1);
    console.log("fetched user 1: ", user1);
    const user2 = await getUserById(2);
    const user3 = await getUserById(3);
    const myUsers = [user1, user2, user3];
    const carts = await Promise.all(myUsers.map(createCart));

    console.log("Carts created:");
    console.log(carts);
    console.log("Finished creating carts!");
  } catch (error) {
    console.error("Error creating carts!");
    throw error;
  }
}

async function assignInitialCartItems() {
  console.log("starting to assign items")
  const item = await assignItemToCart(1, 7, 1, 15.99)
  const item2 = await assignItemToCart(1, 11, 1, 1.99)
  const item3 = await assignItemToCart(1, 3, 1, 155.99)
  const cart=await getActiveCart({id:1})
  console.log(777, cart)

}

async function rebuildDB() {
  try {
    await dropTables();
    await readInventoryFile();
    await createTables();
    await createInitialUsers();
    await createInitialAddress();
    await loginInitialUsers();
    await createInitialProducts();
    await createInitialCarts();
    await assignInitialCartItems();
    await createInitialReviews()
    const cartId = await getActiveCart({id:1})
    const cartPurchased = await convertCartToPurchased({id:cartId[0].id})
    await getActiveCart({id:1})
  } catch (error) {
    console.log("Error during rebuildDB");
    throw error;
  }
}

module.exports = {
  rebuildDB,
};
