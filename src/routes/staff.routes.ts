import { Router } from "express";
import { StaffController } from "../controllers/staff.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRole } from "../middlewares/role.middleware";

const router = Router();
const staffController = new StaffController();

router.post(
  "/",
  authenticate,
  validateRole(["admin"]),
  staffController.createStaff.bind(staffController)
);

router.get(
  "/:id",
  authenticate,
  staffController.getStaffById.bind(staffController)
);

router.get(
  "/",
  authenticate,
  staffController.getAllStaff.bind(staffController)
);

router.put(
  "/:id",
  authenticate,
  validateRole(["admin"]),
  staffController.updateStaff.bind(staffController)
);

router.delete(
  "/:id",
  authenticate,
  validateRole(["admin"]),
  staffController.deleteStaff.bind(staffController)
);

router.post(
  "/:id/unassign-bus",
  authenticate,
  validateRole(["admin"]),
  staffController.unassignBus.bind(staffController)
);

router.post(
  "/:id/assign-bus",
  authenticate,
  validateRole(["admin"]),
  staffController.assignToBus.bind(staffController)
);

router.post(
  "/:id/assign-route",
  authenticate,
  validateRole(["admin"]),
  staffController.assignToRoute.bind(staffController)
);

router.patch(
  "/:id/status",
  authenticate,
  validateRole(["admin"]),
  staffController.updateStatus.bind(staffController)
);

router.post(
  "/:id/unassign-route",
  authenticate,
  validateRole(["admin"]),
  staffController.unassignRoute.bind(staffController)
);

export default router;
