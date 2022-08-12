const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { requireUser, requireAdmin } = require("./utils");
const {
  getUserByEmail,
  createUser,
  getUser,
  getUserById,
  deactivateUser,
  reactivateUser,
  updateUser,
} = require("../db/users");

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  const { email, password, firstName, lastName, isActive, isAdmin } = req.body;
  if (password.length < 8) {
    next({
      name: "PasswordTooShort",
      message: "Password Too Short!",
      error: "This is an error",
    });
  }
  try {
    const _user = await getUserByEmail(email);

    if (_user) {
      next({
        name: "UserExistsError",
        message: `User ${email} is already taken.`,
        error: "There was an error",
      });
    }
    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      isActive,
      isAdmin,
    });
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET
    );

    res.send({
      token: token,
      user: user,
      message: "Thank you for signing up!",
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/users/login

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  // request must have both
  if (!email || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a valid email and password",
    });
  }

  try {
    const user = await getUser({ email, password });

    if (user) {
       
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET
      );

      res.send({ message: "you're logged in!", token: token, user: user });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Email or password is incorrect",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// GET /api/users/me FOR PROFILE
router.get("/me", requireUser, async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");
  const token = auth.slice(prefix.length);

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    if (id) {
      res.send(await getUserById(id));
    }
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// PATCH /api/users/deactivation
router.patch("/deactivation", requireAdmin, async (req, res, next) => {
  const id = req.user.id;
  try {
    res.send(await deactivateUser(id));
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// PATCH /api/users/reactivation
router.patch("/reactivation", requireAdmin, async (req, res, next) => {
  const { id } = req.body;
  try {
    const _user = await getUserByEmail(email);
    if (_user && _user.isActive) {
      next({
        name: "User is already active",
        message: "User is already active",
      });
    } else {
      next({
        name: "UserDoesNotExist",
        message: "User Does not exist",
      });
    }
    res.send(await reactivateUser(id));
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// GET /api/users/me/:userId FOR PROFILE
router.patch("/me/:userId", requireUser, async (req, res, next) => {
  const { email, firstName, lastName } = req.body;
  const id = req.params.userId;
  try {
    const updatedUser = await updateUser(id, email, firstName, lastName);
    res.send(updatedUser);
  } catch ({ name, message }) {
    next({ name, message, status: 401 });
  }
});

// LEAVE UPDATING PASSWORD FOR LATER
// router.patch("/me/:userId", requireUser, async (req, res, next) => {
//   const { password } = req.body;
//   const id = req.params.userId;
//   try {
//     const updatedPassword = await updatePassword(id, password);
//     res.send(updatedPassword);
//   } catch ({ name, message }) {
//     next({ name, message, status: 401 });
//   }
// });

module.exports = router;
