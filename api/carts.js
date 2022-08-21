const express = require("express");
const { assignItemToCart, attachItemsToCarts } = require("../db");
const { getActiveCart, getPurchasedCartsByUser, createCart, getAllPurchasedCarts,convertCartToPurchased } = require("../db/carts");
const { requireUser, requireAdmin } = require("./utils");
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
        const cart = await getActiveCart({ id:userId });
        const purchasedCart = await convertCartToPurchased(cart)
        res.send(purchasedCart)
      } catch ({ name, message }) {
        next({ name, message, status: 401 });
      }
  });
  
// GET /api/carts/newguestcart
router.post("/newguestcart", async (req,res,next) => {
  try{
    const data = req.body.cartItems
    cartItems = JSON.parse(data)
    const cart = await createCart({id: 0})
    if (cartItems.length) cartItems.map((item)=> { //put each item in the cart
       assignItemToCart(cart.id,item.id,item.quantity,item.price)
   })
   
    fullCart = await attachItemsToCarts([cart])
   res.send(fullCart)
 }catch(error){throw(error)}
})
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
router.get("/allcarts", requireAdmin, async(req,res,next)=>{
try {
  const allCarts = await getAllPurchasedCarts()
  res.send(allCarts)
} catch ({ name, message }) {
  next({ name, message, status: 401 });
}
})
module.exports = router;
