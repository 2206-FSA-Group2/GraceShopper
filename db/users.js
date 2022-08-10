const client = require("./client");
const bcrypt = require('bcrypt');


async function createUser({ email, password, firstName, lastName, isAdmin, isActive }){
    const SALT_COUNT = 20;
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
try {
    const{
        rows: [user],
    } = await client.query (
        `INSERT INTO users(email, password, first_name, last_name, is_admin, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        RETURNING *
        `,
        [email, hashedPassword, firstName, lastName, isAdmin, isActive]
    );
        return user
} catch (error){
    throw error;
}
}

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

async function destroyUser(id){
    try {
        const {
            rows:[user],
        } = await client.query(
            `
            SELECT id, is_active
            FROM users
            WHERE id=$1
            SET is_active = false
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
            SELECT id, is_active
            FROM users
            WHERE id=$1
            SET is_active = true
            RETURNING *
            `,
            [id]
        );
        return user
    } catch (error){
        throw error
    }
}




module.exports = {
    createUser,
    getUser,
    getUserByEmail,
    getUserById,
    destroyUser,
    reactivateUser
}