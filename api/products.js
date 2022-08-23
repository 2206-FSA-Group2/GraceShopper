const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  destroyProduct,
  assignCategory,
  attachPhotoToProduct,
  getAllCategories,
  getPhotosByProductId,
  getProductsById,
} = require("../db");
const router = express.Router();
const { requireAdmin } = require("./utils");

// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.send(products);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// POST /api/products
router.post("/", requireAdmin, async (req, res, next) => {
  const { name, description, price, quantity, isActive } = req.body;

  try {
    const newProduct = await createProduct({
      name,
      description,
      price,
      quantity,
      isActive,
    });
    res.send(newProduct);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

//GET /api/products/:productId
router.get("/:productId", async (req, res, next) => {
  const id = Number(req.params.productId);

  try {
    const product = await getProductsById(id);
    res.send(product);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// PATCH /api/products/:productId
router.patch("/:productId", requireAdmin, async (req, res, next) => {
  const id = Number(req.params.productId);

  const { name, description, price, quantity, isActive } = req.body;

  try {
    const updatedProduct = await updateProduct({
      id: id,
      name: name,
      description: description,
      price: price,
      quantity_on_hand: quantity,
      is_active: isActive,
    });

    res.send(updatedProduct);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// DELETE /api/products/:productId
router.delete("/:productId", requireAdmin, async (req, res, next) => {
  const id = Number(req.params.productId);

  try {
    const deletedProduct = await destroyProduct(id);
    res.send(deletedProduct);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// POST /api/products/category/:productId
router.post("/category/:productId", requireAdmin, async (req, res, next) => {
  const { name, product_id } = req.body;

  try {
    const newCategory = await assignCategory({ name, product_id });

    res.send(newCategory);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// POST /api/products/addPhoto/:productId
router.post("/addPhoto/:productId", requireAdmin, async (req, res, next) => {
  const { product_id, url, priority } = req.body;

  try {
    const newPhoto = await attachPhotoToProduct({ product_id, url, priority });

    res.send(newPhoto);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// GET /api/products/all/categories
router.get("/all/categories", async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.send(categories);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// GET /api/products/photos/:productId
router.get("/photos/:productId", async (req, res, next) => {
  const id = Number(req.params.productId);

  try {
    const photos = await getPhotosByProductId(id);
    res.send(photos);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

module.exports = router;
