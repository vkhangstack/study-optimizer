import { PrismaClient } from "@prisma/client"
import { Years, YearSemester } from "../types"
import { DateUtils } from "../utils/date"
import { GenerateUtils } from "../utils/generatre"

const prisma = new PrismaClient()

export class ClassService {
  private static instance: ClassService

  public static getInstance(): ClassService {
    if (!ClassService.instance) {
      ClassService.instance = new ClassService()
    }
    return ClassService.instance
  }

  async getAllClasses() {
    try {
      const classes = await prisma.classSubject.findMany({
        orderBy: { subjectName: "asc" },
      })
      return classes
    } catch (error) {
      console.error("Error getting all classes:", error)
      throw error
    }
  }

  async getClassSubjectBySubjectId(subjectId: string) {
    try {
      const classSubject = await prisma.classSubject.findFirst({
        where: { subjectId: { startsWith: subjectId } },
      })
      return classSubject
    } catch (error) {
      console.error("Error getting class by subjectId:", error)
      throw error
    }
  }

  async getClassSubjectBySubjectLikeId(subjectId: string) {
    try {
      const classSubject = await prisma.classSubject.findFirst({
        where: { subjectId: { contains: subjectId } },
      })
      return classSubject
    } catch (error) {
      console.error("Error getting class by subjectId:", error)
      throw error
    }
  }

  async getClassByZaloId(zaloId: string) {
    try {
      const user = await prisma.userClassSubject.findMany({
        where: { userId: zaloId },
      })

      const classSubject = await prisma.classSubject.findMany({
        where: { id: { in: user.map((u) => u.classSubjectId) } },
      })

      return classSubject
    } catch (error) {
      console.error("Error getting class by userId:", error)
      throw error
    }
  }

  async getClassSubjectById(classSubjectId: string) {
    try {
      const classSubject = await prisma.classSubject.findUnique({
        where: { id: classSubjectId },
      })
      return classSubject
    } catch (error) {
      console.error("Error getting class by classSubjectId:", error)
      throw error
    }
  }

  async getClassSubjectMap(zaloId: string) {
    try {
      const classSubjects = await this.getClassByZaloId(zaloId)
      const classSubjectMap: Record<string, any> = {}
      classSubjects.forEach((cs) => {
        classSubjectMap[cs.id] = cs
      })
      return classSubjectMap
    } catch (error) {
      console.error("Error getting class subject map:", error)
      throw error
    }
  }

  async setClassForUser(zaloId: string, subjectIds: string[]) {
    try {
      // Remove existing class associations
      await prisma.userClassSubject.deleteMany({
        where: { userId: zaloId },
      })

      // Create new class associations
      const createData = subjectIds.map((subjectId) => ({
        id: GenerateUtils.getInstance().generateId(),
        userId: zaloId,
        classSubjectId: subjectId,
        // hardcoded year and semester for now
        year: Years.YEAR_2025_2026,
        semester: YearSemester.SUMMER_SEMESTER,
      }))

      await prisma.userClassSubject.createMany({
        data: createData,
      })
    } catch (error) {
      console.error("Error setting class for user:", error)
      throw error
    }
  }

  async getAllMainClasses() {
    try {
      const classes = await prisma.classSubject.findMany({
        where: {
          isMain: true,
          // hardcoded year and semester for now
          year: Years.YEAR_2025_2026,
          semester: YearSemester.SUMMER_SEMESTER,
        },
        orderBy: { subjectName: "asc" },
      })
      return classes
    } catch (error) {
      console.error("Error getting all main classes:", error)
      throw error
    }
  }
  async getCalendarSubjectTodayForUser(userId: string) {
    try {
      const userClasses = await prisma.userClassSubject.findMany({
        where: {
          userId: userId,
          // hardcoded year and semester for now
          year: Years.YEAR_2025_2026,
          semester: YearSemester.SUMMER_SEMESTER,
        },
      })

      const classSubjectIds = userClasses.map((uc) => uc.classSubjectId)

      const subjectsToday = await prisma.classSubject.findMany({
        where: {
          id: { in: classSubjectIds },
          dayOfWeek: DateUtils.getInstance().getCurrentDayOfWeek(),
          year: Years.YEAR_2025_2026,
          semester: YearSemester.SUMMER_SEMESTER,
        },
      })

      return subjectsToday
    } catch (error) {
      console.error("Error getting calendar subjects today for user:", error)
      throw error
    }
  }

  async setClassMainStatus(subjectId: string, isMain: boolean) {
    try {
      await prisma.classSubject.update({
        where: { subjectId },
        data: { isMain },
      })
    } catch (error) {
      console.error("Error setting class main status:", error)
      throw error
    }
  }

  async addUserToClass(zaloId: string, subjectId: string) {
    try {
      // Check if the association already exists
      const existingAssociation = await prisma.userClassSubject.findFirst({
        where: {
          userId: zaloId,
          classSubjectId: subjectId,
        },
      })

      if (existingAssociation) {
        // Association already exists, no need to add
        return
      }

      // Create new association
      await prisma.userClassSubject.create({
        data: {
          id: GenerateUtils.getInstance().generateId(),
          userId: zaloId,
          classSubjectId: subjectId,
          // hardcoded year and semester for now
          year: Years.YEAR_2025_2026,
          semester: YearSemester.SUMMER_SEMESTER,
        },
      })
    } catch (error) {
      console.error("Error adding user to class:", error)
      throw error
    }
  }

  async removeUserFromClass(zaloId: string, subjectId: string) {
    try {
      await prisma.userClassSubject.deleteMany({
        where: {
          userId: zaloId,
          classSubjectId: subjectId,
        },
      })
    } catch (error) {
      console.error("Error removing user from class:", error)
      throw error
    }
  }

  async getUsersRegisteredClass(classSubjectId: string) {
    try {
      const userClasses = await prisma.userClassSubject.findMany({
        where: {
          classSubjectId,
        },
      })
      const userIds = new Set<string>()
      userClasses.forEach((uc) => userIds.add(uc.userId))

      return userIds
    } catch (error) {
      console.error("Error getting users registered for class:", error)
      throw error
    }
  }
}
