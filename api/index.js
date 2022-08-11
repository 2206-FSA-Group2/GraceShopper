const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");

router.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

router.use((req, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);
  }

  next();
});

// GET /api/health
router.get("/health", async (req, res, next) => {
  res.send({ message: "All is well, server is running", status: 200 });
});

// ROUTER: /api/users
const usersRouter = require("./users");
router.use("/users", usersRouter);

// ROUTER: /api/products
const productsRouter = require("./products");
router.use("/products", productsRouter);

// ROUTER: /api/orders
// const ordersRouter = require("./orders");
// router.use("/orders", orders);

// ROUTER: /api/carts
const cartsRouter = require("./carts");
router.use("/carts", cartsRouter);

// ROUTER: /api/cart_items
const cartItemsRouter = require('./cart_items');
router.use('/cart_items', cartItemsRouter)

router.use("*", (req, res, next) => {
  res.status(404);
  res.render("error", { error: "Not Found" });
});

module.exports = router;