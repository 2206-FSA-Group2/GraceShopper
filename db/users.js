const client = require("./client");
const bcrypt = require('bcrypt');
const { createCart } = require("./carts");

//Encryption is commented out. Upon enabling, replace password to hashedpassword
async function createUser({ email, password, firstName, lastName, isAdmin, isActive }){
    const SALT_COUNT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
try {
    const{
        rows: [user],
    } = await client.query (
        `INSERT INTO users(email, password, first_name, last_name, is_admin, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        RETURNING id, email, password;
        `,
        [email, hashedPassword, firstName, lastName, isAdmin, isActive]
    );
    createCart(user)
        return user
} catch (error){
    throw error;
}
}

//function for login Require consensus on .env file
async function getUser({email, password}){
    const user = await getUserByEmail(email);
    const hashedPassword = user.password;
    const passwordMatched = await bcrypt.compare(password, hashedPassword)
    if (passwordMatched){
        try{
            const {
                rows: [user],
              } = await client.query(
                `
              SELECT id, email, is_admin as "isAdmin"
              FROM users
              WHERE email=$1 AND password=$2;
              `,
                [email, hashedPassword]
              );
        
              return user;
        } catch (error){
            throw error
        }
    }
}

async function getUserByEmail(email){
    try{ 
        const {
            rows: [user],
        } = await client.query(
            `SELECT *
            FROM users
            WHERE email=$1;
            `,
            [email]
        );
            return user
    } catch (error){
        throw error
    }
}

async function getUserInfo(id){
    try {
        const {
            rows: [user],
        } = await client.query(
            `
            SELECT id, email, is_admin as "isAdmin", first_name as "firstName", last_name as "lastName"
            FROM users
            WHERE id=$1;
            `,
            [id]
        );
        return user;
    } catch (error){
        throw error;
    }
}

async function getUserById(userId){
    try {
        const {
            rows: [user],
        } = await client.query(
            `
            SELECT id, email, is_admin as "isAdmin",
            first_name AS first, last_name AS last
            FROM users
            WHERE id=$1;
            `,
            [userId]
        );
        return user;
    } catch (error){
        throw error;
    }
}


async function updateUser({id, ...fields}){
    const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    UPDATE users
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
`,
      Object.values(fields)
    );
    delete user.password
    return user;
  } catch (error) {
    throw error;
    }
}

async function updatePassword ({id, password}){
    try{
        const {
            rows:[user],
        } = await client.query(
            `
            UPDATE users
            SET password=${password}
            WHERE id =${id}
            RETURNING *;
            `
        );
        delete user.password
        return user
    } catch (error){
        throw error
    }
}

//"DELETE" function that is actually and update call
async function deactivateUser(id){
    try {
        const {
            rows:[user],
        } = await client.query(
            `
            UPDATE users
            SET is_active = false
            WHERE id=$1
            RETURNING id, email, is_active as "isActive";
            `,
            [id]
        );
        delete user.password
        return user
    } catch (error){
        throw error
    }
}

//An Admin function to reactive a user incase they want their account back
async function reactivateUser(id){
    try {
        const {
            rows:[user],
        } = await client.query(
            `
            UPDATE users
            SET is_active = true
            WHERE id=$1
            RETURNING *;
            `,
            [id]
        );
        delete user.password
        return user
    } catch (error){
        throw error
    }
}

//An admin function to fetch all users data
async function getAllUsers(){
    try{
        const {
            rows
        } = await client.query(
            `SELECT id, email, first_name, last_name, is_admin as "isAdmin", is_active as "isActive"
            FROM users
            `
        );
        return rows
    } catch (error){
        throw error
    }
}




module.exports = {
    createUser,
    getUser,
    getUserByEmail,
    getUserById,
    updateUser,
    updatePassword,
    deactivateUser,
    reactivateUser,
    getAllUsers,
    getUserInfo
}