const express = require("express");
const { getActiveCart, getPurchasedCartsByUser, createCart } = require("../db/carts");
const { requireUser } = require("./utils");
const router = express.Router();

// GET /api/carts/cart THIS GETS THE CURRENT CART
router.get("/cart", requireUser, async (req, res, next) => {
  const { id } = req.user;
  try {
    const cart = await getActiveCart({ id });
    res.send(cart);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// GET /api/carts/mycarts THIS GETS THE PREVIOUS ORDERS
router.get("/mycarts", requireUser, async (req, res, next) => {
    const { id } = req.user;
    try {
      const cart = await getPurchasedCartsByUser({id})
      res.send(cart);
    } catch ({ name, message }) {
      next({ name, message, status: 401 });
    }
  });

// PATCH /api/carts/cart THIS SETS THE CART TO PURCHASED
router.patch("/cart", requireUser, async (req, res, next) => {
    const userId = req.user.id;
    try {
        const {id} = await getActiveCart({ id:userId });
        const purchasedCart = await convertCartToPurchased({id})
        res.send(purchasedCart)
      } catch ({ name, message }) {
        next({ name, message, status: 401 });
      }
  });

// POST /api/carts/newcart THIS CREATES A NEW CART
router.post("/newcart", requireUser, async (req, res, next) => {
    const userId = req.user.id;
    try {
        const newCart = await createCart({id:userId})
        res.send(newCart)
      } catch ({ name, message }) {
        next({ name, message, status: 401 });
      }
  });


// What is the functionality of deleteActiveCart?

module.exports = router;
