const express = require("express");
const { getAllOrders, createOrder, updateOrder, getOrderByOrderId } = require("../db");
const router = express.Router();
const { requireUser, requireAdmin } = require("./utils");

// GET /api/orders
router.get("/", async (req, res, next) => {
  try {
    const orders = await getAllOrders();
    res.send(orders);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// GET /api/orders/:orderId
router.get("/:orderId", async (req, res, next) => {
    const id = Number(req.params.orderId);

    try {
      const order = await getOrderByOrderId(id)
      res.send(order);
    } catch ({ name, message }) {
      next({ name, message, status: 401 });
    }
  });
  

// POST /api/orders
router.post("/", async (req, res, next) => {
  const { cart_id, address_id, status } = req.body;

  try {
    const newOrder = await createOrder({
      cart_id,
      address_id,
      status,
    });
    res.send(newOrder);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// PATCH /api/orders/updateorder
router.patch("/updateorder", requireAdmin, async (req, res, next) => {
  const { id, status } = req.body;
  try {
    const updatedOrder = await updateOrder({ id, status });
    res.send(updatedOrder);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

module.exports = router;
