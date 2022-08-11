require("dotenv").config()
const express = require("express")
const app = express()
const router = require("./api")
const cors = require('cors')
const client = require("./db/client")

// Setup your Middleware and API Router here
app.use(express.json());
app.use(cors())
app.use("/api", router)
client.connect()


router.use((error, req, res, next) => {
    res.send({
        name: error.name,
        message: error.message,
        error: error.error
    });
  });
  
module.exports = app;
