const express = require("express");
const {
  assignItemToCart,
  removeItemFromCart,
  editCartItemQuantity,
  getActiveCartId,
  getActiveCart,

} = require("../db");


const { requireUser } = require('./utils')
const router = express.Router();

router.post("/savecart", requireUser, async(req,res,next) => {
  try{
  const {cartItems} = req.body
  const existingCart = await getActiveCart(req.user)
  //for each item in cartItems, check to see if it's not already in the cart; if it
  //is not, assign the item to the cart.
  for(item in cartItems) {
    if (!existingCart.items.find(product => product.id === item.id)) {
      assignItemToCart(existingCart.id, item.id, item.quantity, item.price)
    }
  }
}catch(error) {throw error}

})

//POST /api/cart_items/newcartitem THIS ADDS ITEMS TO CART
router.post("/newcartitem", requireUser, async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity, price } = req.body;
  try {
    const returnedId = await getActiveCartId(userId);
    const cartId = returnedId.id


    const addedCartItem = await assignItemToCart(
      cartId,
      productId,
      quantity,
      price
    );
    res.send(addedCartItem);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

//DELETE /api/cart_items/newcartitem THIS REMOVES ITEM FROM CART
router.delete("/newcartitem", requireUser, async (req, res, next) => {
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
