const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const { requireUser } = require ('./utils')
const { getUserByEmail, createUser, getUser, getUserById } = require ('../db/users')

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
      const user = await createUser({ email, password, firstName, lastName, isActive, isAdmin });
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
  

module.exports = router;