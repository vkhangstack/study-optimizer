import { Assignment, PrismaClient, UserAssignment } from "@prisma/client"
import { AssignmentStatus, Years, YearSemester } from "../types"
import { DateUtils } from "../utils/date"
import { GenerateUtils } from "../utils/generatre"

const prisma = new PrismaClient()

export class AssignmentService {
  private static instance: AssignmentService

  public static getInstance(): AssignmentService {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService()
    }
    return AssignmentService.instance
  }

  async getAssignmentsByClassSubjectId(classSubjectId: string) {
    try {
      const assignments = await prisma.assignment.findMany({
        where: { classSubjectId: classSubjectId },
        orderBy: { createdAt: "desc" },
      })
      return assignments
    } catch (error) {
      console.error("Error getting assignments by classSubjectId:", error)
      throw error
    }
  }

  async createAssignment(data: { classSubjectId: string; title: string; description?: string; deadline: Date; deadlineRemind?: Date }) {
    try {
      const assignment = await prisma.assignment.create({
        data: {
          id: GenerateUtils.getInstance().generateId(),
          classSubjectId: data.classSubjectId,
          description: data.description || "",
          name: data.title,
          deadline: data.deadline,
          deadlineRemind: data.deadlineRemind || null,
          createdAt: new Date(),
        },
      })
      return assignment
    } catch (error) {
      console.error("Error creating assignment:", error)
      throw error
    }
  }

  async deleteAssignment(assignmentId: string) {
    try {
      await prisma.assignment.delete({
        where: { id: assignmentId },
      })
    } catch (error) {
      console.error("Error deleting assignment:", error)
      throw error
    }
  }

  async updateAssignment(
    assignmentId: string,
    data: {
      title?: string
      description?: string
      deadline?: Date
      deadlineRemind?: Date
    }
  ) {
    try {
      const assignment = await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          name: data.title,
          description: data.description,
          deadline: data.deadline,
          deadlineRemind: data.deadlineRemind,
        },
      })
      return assignment
    } catch (error) {
      console.error("Error updating assignment:", error)
      throw error
    }
  }

  async getUserAssignments(userId: string) {
    try {
      const userAssignments = await prisma.userAssignment.findMany({
        where: { userId, isDeleted: false },
      })
      if (userAssignments.length === 0) {
        return []
      }
      const assignments = await Promise.all(
        userAssignments.map(async (ua) => {
          const assignment = await prisma.assignment.findUnique({
            where: { id: ua.assignmentId },
          })
          return {
            ...ua,
            assignment,
          }
        })
      )
      return assignments
    } catch (error) {
      console.error("Error getting user assignments:", error)
      throw error
    }
  }

  async getUserAssignmentExist(classSubjectId: string, deadline: string, userId: string): Promise<null | UserAssignment> {
    try {
      const assignment = await prisma.assignment.findFirst({
        where: {
          classSubjectId,
          deadline: new Date(deadline),
        },
      })
      if (!assignment) {
        return null
      }

      const userAssignment = await prisma.userAssignment.findFirst({
        where: {
          assignmentId: {
            equals: assignment.id,
          },
          userId,
          isDeleted: false,
        },
      })
      return userAssignment
    } catch (error) {
      console.error("Error getting user assignment by class subject and deadline:", error)
      throw error
    }
  }

  async assignAssignmentToUser(assignmentId: string, userId: string, createdBy: string) {
    try {
      const userAssignment = await prisma.userAssignment.create({
        data: {
          id: GenerateUtils.getInstance().createHashAssignment(assignmentId + userId + Date.now()),
          assignmentId: assignmentId,
          userId,
          status: AssignmentStatus.PENDING,
          createdAt: new Date(),
          createdBy: createdBy,
          isDeleted: false,
        },
      })
      return userAssignment
    } catch (error) {
      console.error("Error assigning assignment to user:", error)
      throw error
    }
  }

  async unassignAssignmentFromUser(assignmentId: string, userId: string) {
    try {
      await prisma.userAssignment.updateMany({
        where: {
          assignmentId,
          userId,
        },
        data: {
          isDeleted: true,
        },
      })
    } catch (error) {
      console.error("Error unassigning assignment from user:", error)
      throw error
    }
  }

  async updateUserAssignmentStatus(assignmentId: string, userId: string, status: AssignmentStatus) {
    try {
      const userAssignment = await prisma.userAssignment.updateMany({
        where: {
          id: {
            equals: assignmentId,
          },
          userId,
        },
        data: {
          status,
        },
      })
      return userAssignment
    } catch (error) {
      console.error("Error updating user assignment status:", error)
      throw error
    }
  }

  async getAssignmentByName(name: string) {
    try {
      const assignment = await prisma.assignment.findFirst({
        where: { name },
      })
      return assignment
    } catch (error) {
      console.error("Error getting assignment by name:", error)
      throw error
    }
  }

  async getAssignmentByClassSubjectId(classSubjectId: string) {
    try {
      const assignments = await prisma.assignment.findMany({
        where: { classSubjectId },
        orderBy: { createdAt: "desc" },
      })
      return assignments
    } catch (error) {
      console.error("Error getting assignments by classSubjectId:", error)
      throw error
    }
  }

  async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      })
      return assignment
    } catch (error) {
      console.error("Error getting assignment by ID:", error)
      throw error
    }
  }

  async getUserAssignmentById(id: string, userId: string) {
    try {
      const userAssignment = await prisma.userAssignment.findFirst({
        where: {
          id: id,
          userId,
          isDeleted: false,
        },
      })
      return userAssignment
    } catch (error) {
      console.error("Error getting user assignment by ID:", error)
      throw error
    }
  }

  async removeAssignmentFromUsers(userAssignmentId: string, userId: string) {
    try {
      await prisma.userAssignment.updateMany({
        where: {
          id: userAssignmentId,
          userId,
        },
        data: {
          isDeleted: true,
        },
      })
    } catch (error) {
      console.error("Error removing assignment from users:", error)
      throw error
    }
  }

  async getAssignmentsYetDueByUser(userId: string) {
    try {
      const now = new Date()
      const userAssignments = await prisma.userAssignment.findMany({
        where: {
          userId,
          isDeleted: false,
          status: AssignmentStatus.PENDING,
        },
      })

      const assignmentIds = userAssignments.map((ua) => ua.assignmentId)

      const assignments = await prisma.assignment.findMany({
        where: {
          id: { in: assignmentIds },
          deadline: {
            gt: now,
          },
        },
      })

      const yetDueAssignments = assignments.filter((assignment) => {
        const timeDiff = assignment.deadline.getTime() - now.getTime()
        const daysDiff = timeDiff / (1000 * 3600 * 24)
        return daysDiff <= 7 // Due within 7 days
      })

      return yetDueAssignments
    } catch (error) {
      console.error("Error getting assignments yet due by user:", error)
      throw error
    }
  }
}
