const express = require("express");
const router = express.Router();
const {
  getWishlistItemsByUser,
  assignItemToWishlist,
  removeItemFromWishlist,
} = require("../db");
const { requireUser } = require("./utils");

// GET /api/wishlist_items
router.get("/", requireUser, async (req, res, next) => {
  const { id } = req.user;
  try {
    const wishlistItems = await getWishlistItemsByUser(id);
    res.send(wishlistItems);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// POST /api/wishlist_items
router.post("/", requireUser, async (req, res, next) => {
  const { id } = req.user;
  const { product_id } = req.body;

  try {
    const newWishListItem = await assignItemToWishlist(id, product_id);
    res.send(newWishListItem);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// DELETE /api/wishlist_items/:productId
router.delete("/:productId", requireUser, async (req, res, next) => {
  const { id } = req.user;
  const product_id = Number(req.params.productId);

  try {
    const deletedItem = await removeItemFromWishlist(id, product_id);
    res.send(deletedItem);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

module.exports = router;
