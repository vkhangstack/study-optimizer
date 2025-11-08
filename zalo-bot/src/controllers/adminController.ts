import { Request, Response } from "express"
import { AssignmentService } from "../services/assignmentService"
import { ClassService } from "../services/classService"
import { BotService } from "../services/botService"
import { logger } from "../utils/logger"

export class AdminController {
  private assignmentService: AssignmentService
  private classSubjectService: ClassService
  private botService: BotService
  private classService: ClassService

  constructor() {
    this.assignmentService = AssignmentService.getInstance()
    this.classSubjectService = ClassService.getInstance()
    this.botService = BotService.getInstance()
    this.classService = ClassService.getInstance()

  }

  getAssignments = async (req: Request, res: Response) => {
    try {
      logger.info("Admin requested to get assignments")
      const queryData = req.query
      const classSubjectId = queryData["classSubjectId"] as string
      if (!classSubjectId) {
        return res.status(400).json({ success: false, message: "classSubjectId is required" })
      }
      const assignments = await this.assignmentService.getAssignmentsByClassSubjectId(classSubjectId)
      res.json({ success: true, assignments })
    } catch (error) {
      logger.error("Error retrieving assignments:", error)
      res.status(500).json({ success: false, message: "Error retrieving assignments" })
    }
  }

  createAssignment = async (req: Request, res: Response) => {
    try {
      logger.info("Admin requested to create assignment")
      const { classSubjectId, title, description, deadline, deadlineRemind } = req.body
      if (!classSubjectId || !title || !deadline) {
        return res.status(400).json({ success: false, message: "classSubjectId, title, and deadline are required" })
      }
      const classSubjectInfo = await this.classSubjectService.getClassSubjectById(classSubjectId)
      if (!classSubjectInfo) {
        logger.warn(`Class subject not found: ${classSubjectId}`)
        return res.status(404).json({ success: false, message: "Class subject not found" })
      }
      const assignment = await this.assignmentService.createAssignment({
        classSubjectId,
        title,
        description,
        deadline: new Date(deadline),
        deadlineRemind: deadlineRemind ? new Date(deadlineRemind) : undefined,
      })

      const users = await this.classService.getUsersRegisteredClass(classSubjectInfo.id)

      for (const user of users) {
        await this.assignmentService.assignAssignmentToUser(assignment.id, user, user)
      }
      res.json({ success: true, assignment })
    } catch (error) {
      logger.error("Error creating assignment:", error)
      res.status(500).json({ success: false, message: "Error creating assignment" })
    }
  }

  deleteAssignment = async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params
      if (!assignmentId) {
        logger.warn("assignmentId is required for deletion")
        return res.status(400).json({ success: false, message: "assignmentId is required" })
      }
      await this.assignmentService.deleteAssignment(assignmentId)
      res.json({ success: true })
    } catch (error) {
      logger.error("Error deleting assignment:", error)
      res.status(500).json({ success: false, message: "Error deleting assignment" })
    }
  }

  updateAssignment = async (req: Request, res: Response) => {
    try {
      logger.info("Admin requested to update assignment")
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
      logger.error("Error updating assignment:", error)
      res.status(500).json({ success: false, message: "Error updating assignment" })
    }
  }

  getClassSubjects = async (req: Request, res: Response) => {
    try {
      logger.info("Admin requested to get class subjects")
      const classSubjects = await this.classSubjectService.getAllClasses()
      res.json({ success: true, classSubjects })
    } catch (error) {
      logger.error("Error retrieving class subjects:", error)
      res.status(500).json({ success: false, message: "Error retrieving class subjects" })
    }
  }

  notifyAssignmentDeadline = async (req: Request, res: Response) => {
    try {
      logger.info("Admin triggered assignment deadline notification")
      await this.botService.dailyReminderAssignmentDue()
      res.json({ success: true, message: "Assignment deadline notifications sent" })
    } catch (error) {
      logger.error("Error notifying assignment deadline:", error)
      res.status(500).json({ success: false, message: "Error notifying assignment deadline" })
    }
  }
}
