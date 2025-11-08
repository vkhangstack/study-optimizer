import express from "express"
import { AdminController } from "../controllers/adminController"

const router = express.Router()

const adminController = new AdminController()

router.post("/assignments", adminController.createAssignment)
router.get("/assignments", adminController.getAssignments)
router.delete("/assignments/:id", adminController.deleteAssignment)
router.put("/assignments/:id", adminController.updateAssignment)

router.post("/assignments/notify-deadline", adminController.notifyAssignmentDeadline)

router.get("/class-subjects", adminController.getClassSubjects)

export default router
