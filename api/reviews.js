const express = require("express");
const {
  getAllReviews,
  createReview,
  getReviewsByProductId,
  getReviewsByUserId,
  destroyReview,
} = require("../db");
const router = express.Router();
const { requireUser, requireAdmin } = require("./utils");

// GET /api/reviews
router.get("/", async (req, res, next) => {
  try {
    const reviews = await getAllReviews();
    res.send(reviews);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// GET /api/reviews/:product_id
router.get("/:product_id", async (req, res, next) => {
  const id = Number(req.params.product_id);

  try {
    const reviews = await getReviewsByProductId(id);
    res.send(reviews);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// GET /api/reviews/:user_id
router.get("/:user_id", async (req, res, next) => {
  const id = Number(req.params.user_id);

  try {
    const reviews = await getReviewsByUserId(id);
    res.send(reviews);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// POST /api/reviews
router.post("/", requireUser, async (req, res, next) => {
  const { id } = req.user;
  const { product_id, rating, title, description } = req.body;

  try {
    const newReview = await createReview({
      id,
      product_id,
      rating,
      title,
      description,
    });
    res.send(newReview);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// DELETE /api/reviews/:review_id
router.delete("/:review_id", requireAdmin, async (req, res, next) => {
  const id = Number(req.params.review_id);

  try {
    const deletedProduct = await destroyReview(id);
    res.send(deletedProduct);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

module.exports = router;
