const client = require("./client");

async function createUser({ email, password, firstName, lastName }){
try {
    const{
        rows: [user],
    } = await client.query (
        `INSERT INTO users(email, password, firstName, lastName)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
        RETURNING *
        `,
        [email, password, firstName, lastName]
    );
        return user
} catch (error){
    throw error;
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


module.exports = {
    createUser,
    getUserByEmail,
    getUserById
}