function requireUser(req, res, next) {
    if (!req.user) {
      res.status(401);
      next({
        error: "MissingUserError",
        name: "MissingUserError",
        message: "You must be logged in to perform this action",
      });
    }
    next();
  }

function requireAdmin(req, res, next){
    if (!req.user.isAdmin){
        res.status(401);
        next({
          error: "YouMustBeAdmin",
          name: "MissingAdminPrivileges",
          message: "You must be an Admin to perform this action",
        });
      }
      next();
}
  
  module.exports = {
    requireUser,
    requireAdmin
  };
