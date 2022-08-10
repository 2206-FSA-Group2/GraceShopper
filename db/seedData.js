const client = require("./client");
const fs= require('fs');
const { parse } = require("csv-parse");


const itemArr = [];
const categoryArr = [];
const photoArr = [];
let productId=1;

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
    console.log("finished reading inventory file")
    console.log("the items are:",itemArr)
console.log("the category entries are:",categoryArr)
console.log("the photo entries are:",photoArr);
  })



// async function createTables() {
//   console.log("Starting to build tables...");
//   // create all tables, in the correct order
//   try {
//     await client.query(
//       `CREATE TABLE products (
//         id SERIAL PRIMARY KEY,
//               name VARCHAR(255) UNIQUE NOT NULL,
//               description VARCHAR(255) NOT NULL,
//               price NUMERIC NOT NULL,
//               quantity_on_hand INTEGER,
//               is_active BOOLEAN DEFAULT true
//       );
//       CREATE TABLE product_photos (
//         id SERIAL PRIMARY KEY,
//         product_id INTEGER REFERENCES products(id) NOT NULL,
//         url VARCHAR(255) NOT NULL,
//         priority INTEGER
//       );
//       CREATE TABLE categories(
//         id INTEGER PRIMARY KEY,
//         name VARCHAR(255) UNIQUE NOT NULL,
//         product_id INTEGER REFERENCES products(id) NOT NULL
//       );
//       `
//     );
//   } catch (error) {
//     throw error;
//   }
// }


// createTables();
