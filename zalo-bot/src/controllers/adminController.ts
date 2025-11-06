import { Request, Response } from "express"
import { AssignmentService } from "../services/assignmentService"

export class AdminController {
  private assignmentService: AssignmentService

  constructor() {
    this.assignmentService = AssignmentService.getInstance()
  }

  getAssignments = async (req: Request, res: Response) => {
    try {
      const { classSubjectId } = req.params
      if (!classSubjectId) {
        return res.status(400).json({ success: false, message: "classSubjectId is required" })
      }
      const assignments = await this.assignmentService.getAssignmentsByClassSubjectId(classSubjectId)
      res.json({ success: true, assignments })
    } catch (error) {
      res.status(500).json({ success: false, message: "Error retrieving assignments" })
    }
  }

  createAssignment = async (req: Request, res: Response) => {
    try {
      const { classSubjectId, title, description, deadline, deadlineRemind } = req.body
      if (!classSubjectId || !title || !deadline) {
        return res.status(400).json({ success: false, message: "classSubjectId, title, and deadline are required" })
      }
      const assignment = await this.assignmentService.createAssignment({
        classSubjectId,
        title,
        description,
        deadline: new Date(deadline),
        deadlineRemind: deadlineRemind ? new Date(deadlineRemind) : undefined,
      })
      res.json({ success: true, assignment })
    } catch (error) {
      res.status(500).json({ success: false, message: "Error creating assignment" })
    }
  }

  deleteAssignment = async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params
      if (!assignmentId) {
        return res.status(400).json({ success: false, message: "assignmentId is required" })
      }
      await this.assignmentService.deleteAssignment(assignmentId)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: "Error deleting assignment" })
    }
  }

  updateAssignment = async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params
      const { title, description, deadline, deadlineRemind } = req.body
      if (!assignmentId) {
        return res.status(400).json({ success: false, message: "assignmentId is required" })
      }
      const updatedAssignment = await this.assignmentService.updateAssignment(assignmentId, {
        title,
        description,
        deadline: deadline ? new Date(deadline) : undefined,
        deadlineRemind: deadlineRemind ? new Date(deadlineRemind) : undefined,
      })
      res.json({ success: true, updatedAssignment })
    } catch (error) {
      res.status(500).json({ success: false, message: "Error updating assignment" })
    }
  }
}
