const express = require("express");
const {
  assignItemToCart,
  removeItemFromCart,
  editCartItemQuantity,
  getActiveCart
} = require("../db");

const { requireUser } = require('./utils')
const router = express.Router();

//POST /api/cart_items/newcartitem THIS ADDS ITEMS TO CART
router.post("/newcartitem", requireUser, async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity, price } = req.body;
  try {
    const currentCart = await getActiveCart({ id: userId });
    const cartId = currentCart.id;

    const addedCartItem = await assignItemToCart(
      cartId,
      productId,
      quantity,
      price
    );
    res.send(addedCartItem);
  } catch ({ name, message }) {
    message = message + "cartId: " + cartId + "productId: " + productId + "quantity" + quantity + "price" + price
    next({ name, message, status: 401 });
  }
});

//DELETE /api/cart_items/newcartitem THIS REMOVES ITEM FROM CART
router.delete("/newcartitem", async (req, res, next) => {
  const { id } = req.body;
  try {
    const deletedItem = await removeItemFromCart({ id });
    res.send(deletedItem);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

//PATCH /api/cart_items/newcartitem THIS CHANGES ITEM QUANTITY IN CART
router.patch("/newcartitem", async (req, res, next) => {
  const { id, quantity } = req.body;

  try {
    const updatedCartItem = await editCartItemQuantity({ id, quantity });
    res.send(updatedCartItem);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});


module.exports = router;
