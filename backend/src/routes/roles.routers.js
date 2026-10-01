const express = require("express");

//controllers
const {
  createNewRole,
  getAllRoles,
  createNewRolePermission,
  GetALLRolePermission,
  createNewPermission,
  getAllPermissions,
  DeleteRolePermissionById,
} = require("../controllers/roles.controller");

const rolesRouter = express.Router();

rolesRouter.post("/createRole", createNewRole);
rolesRouter.get("/getRole", getAllRoles);
rolesRouter.post("/createRolePermission", createNewRolePermission);
rolesRouter.get("/getRolePermission",GetALLRolePermission);
rolesRouter.post("/createPermission", createNewPermission);
rolesRouter.get("/getPermissions" ,getAllPermissions)
rolesRouter.delete("/:id",DeleteRolePermissionById);

module.exports = rolesRouter;
