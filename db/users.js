const client = require("./client");
const bcrypt = require('bcrypt');

//Encryption is commented out. Upon enabling, replace password to hashedpassword
async function createUser({ email, password, firstName, lastName, isAdmin, isActive }){
    // const SALT_COUNT = 20;
    // const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
try {
    const{
        rows: [user],
    } = await client.query (
        `INSERT INTO users(email, password, first_name, last_name, is_admin, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        RETURNING *
        `,
        [email, password, firstName, lastName, isAdmin, isActive]
    );
        return user
} catch (error){
    throw error;
}
}

//function for login Require consensus on .env file
async function getUser({email, password}){
    try{
        const user = await getUserByEmail(email);
        const hashedPassword = user.password;
        const passwordMatched = await bcrypt.compare(password, hashedPassword)
        
        if (passwordMatched){
            delete user.password
            return user
        }
    } catch (error){
        throw error
    }
}

async function getUserByEmail(email){
    try{ 
        const {
            rows: [user],
        } = await client.query(
            `SELECT *
            FROM users
            WHERE email=$1
            `
            [email]
        );
            return user
    } catch (error){
        throw error
    }
}

async function getUserById(userId){
    try {
        const {
            rows: [user],
        } = await client.query(
            `
            SELECT id, email
            FROM users
            WHERE id=$1
            `,
            [userId]
        );
        return user;
    } catch (error){
        throw error;
    }
}


//All in one update for "Update Profile" Possible update password only function??
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
            RETURNING *
            `
        );
        return user
    } catch (error){
        throw error
    }
}

//"DELETE" function that is actually and update call
async function destroyUser(id){
    try {
        const {
            rows:[user],
        } = await client.query(
            `
            UPDATE users
            SET is_active = false
            WHERE id=$1
            RETURNING *
            `,
            [id]
        );
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
            RETURNING *
            `,
            [id]
        );
        return user
    } catch (error){
        throw error
    }
}

//An admin function to fetch all users data
async function getAllUsers(){
    try{
        const {
            rows:[users],
        } = await client.query(
            `SELECT *
            FROM users
            RETURNING *
            `
        );
        return users
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
    destroyUser,
    reactivateUser,
    getAllUsers
}