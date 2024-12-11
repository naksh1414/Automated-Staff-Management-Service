import { Router } from "express";
import { StaffController } from "../controllers/staff.controller";
// import { authenticate } from "../middlewares/auth.middleware";
// import { validateRole } from "../middlewares/role.middleware";

const router = Router();
const staffController = new StaffController();

router.post("/login", staffController.loginStaff.bind(staffController));

router.post("/register", staffController.registerStaff.bind(staffController));

router.post("/", staffController.createStaff.bind(staffController));

router.get("/:id", staffController.getStaffById.bind(staffController));

router.get("/", staffController.getAllStaff.bind(staffController));

router.put("/:id", staffController.updateStaff.bind(staffController));

router.delete("/:id", staffController.deleteStaff.bind(staffController));

router.post(
  "/:id/unassign-bus",
  staffController.unassignBus.bind(staffController)
);

router.post(
  "/:id/assign-bus",
  staffController.assignToBus.bind(staffController)
);

router.post(
  "/:id/assign-route",
  staffController.assignToRoute.bind(staffController)
);

router.patch("/:id/status", staffController.updateStatus.bind(staffController));

router.post(
  "/:id/unassign-route",
  staffController.unassignRoute.bind(staffController)
);

export default router;
