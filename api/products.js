const express = require("express");
const { getAllProducts } = require("../db");
const router = express.Router();
const { requireUser, requireAdmin } = require ('./utils')

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
    const userId = req.user.id;
    const {  } = req.body;
    const obj = { creatorId: userId, isPublic: isPublic, name: name, goal: goal };
    try {
      const newRoutine = await createRoutine(obj);
      res.send(newRoutine);
    } catch ({ name, message }) {
      next({ name, message, status: 401 });
    }
  });
  
  


module.exports = router;