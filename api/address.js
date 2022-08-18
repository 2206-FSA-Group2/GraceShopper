const express = require("express");
const {
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressByUserId,
} = require("../db/address");
const { requireUser } = require("./utils");
const router = express.Router();

// POST /api/address/createaddress
router.post("/createaddress", requireUser, async (req, res, next) => {
  const { userId, label, street1, street2, city, state, zipcode } = req.body;

  try {
    const address = await createAddress({
      userId,
      label,
      street1,
      street2,
      city,
      state,
      zipcode,
    });

    res.send(address);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// Patch /api/address/updateaddress
router.patch("/:addressId/updateaddress", requireUser, async (req, res, next) => {
    const id = req.params.addressId
  const { userId, label, street1, street2, city, state, zipcode } = req.body;

  try {
    const updatedAddress = await updateAddress({
      id,
      userId,
      label,
      street1,
      street2,
      city,
      state,
      zipcode,
    });

    res.send(updatedAddress);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// Get /api/address/getaddress
router.get("/getaddress", requireUser, async (req, res, next) => {
  const { userId } = req.body;
  try {
    const address = await getAddressByUserId(userId);
    res.send(address);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// DELETE /api/address/:addressId/deleteaddress
router.delete(
  "/:addressId/deleteaddress",
  requireUser,
  async (req, res, next) => {
    const id = req.params.addressId;
    const { userId } = req.body;
    try {
      const deletedAddress = await deleteAddress(id, userId);
      res.send(deletedAddress);
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

module.exports = router;
