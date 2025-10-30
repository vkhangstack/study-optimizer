import { PrismaClient } from '@prisma/client';
import { DateUtils } from '../utils/date';
import { logger } from "../utils/logger";
import { Years, YearSemester } from '../types';
import { ClassService } from './classService';
import { BotService } from './botService';
import { ZaloService } from './zaloService';
import { ZaloBotService } from './zaloBotService';

const prisma = new PrismaClient();

export interface UserProfile {
  user_id?: string;
  display_name?: string;
  avatar?: string;
  user_alias?: string;
}

export class UserService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async findUsersActiveNotify() {
    try {
      const users = await prisma.user.findMany({
        where: { active: true, notify: true },
      });
      return users;
    } catch (error) {
      logger.error('Error finding users:', error);
      throw error;
    }
  }

  async findUserByZaloId(zaloId: string, active?: boolean) {
    try {
      const user = await prisma.user.findUnique({
        where: { zaloId, ...(active !== undefined ? { active } : {}) },
      });
      return user;
    } catch (error) {
      logger.error('Error finding user by Zalo ID:', error);
      throw error;
    }
  }

  async findOrCreateUser(zaloId: string, profile?: UserProfile) {
    try {
      let user = await this.findUserByZaloId(zaloId);

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: zaloId,
            zaloId,
            name: profile?.display_name || profile?.user_alias || 'Unknown',
            avatar: profile?.avatar || null,
          },
        });
      } else if (profile) {
        // Update user profile if new data is available
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: profile.display_name || profile.user_alias || user.name,
            avatar: profile.avatar || user.avatar,
            updatedAt: new Date(),
          },
        });
      }

      return user;
    } catch (error) {
      logger.error('Error finding or creating user:', error);
      throw error;
    }
  }

  async updateUser(zaloId: string, data: Partial<{ name: string; avatar: string; phone: string; active: boolean, notify: boolean; }>) {
    try {
      const user = await prisma.user.update({
        where: { zaloId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async getAllUsers(page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                messages: true,
              },
            },
          },
        }),
        prisma.user.count(),
      ]);

      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const [totalUsers, activeUsers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            messages: {
              some: {
                timestamp: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
              },
            },
          },
        }),
      ]);

      return {
        total: totalUsers,
        active: activeUsers,
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  async deleteUser(zaloId: string) {
    try {
      const result = await prisma.user.delete({
        where: { zaloId },
      });
      return result;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  async saveUser({ zaloId, name, avatar }: { zaloId: string; name: string; avatar?: string }) {
    try {
      const user = await prisma.user.upsert({
        where: { zaloId },
        update: { name, avatar, id: zaloId },
        create: { zaloId, name, avatar, id: zaloId },
      });
      return user;
    } catch (error) {
      logger.error('Error saving user:', error);
      throw error;
    }
  }

  async dailyNotificationCalendarSubject() {
    try {
      const users = await UserService.getInstance().findUsersActiveNotify();

      const subject = await prisma.classSubject.findMany({
        //tmp hardcode year
        where: { year: Years.YEAR_2025_2026, dayOfWeek: DateUtils.getInstance().getCurrentDayOfWeek() },
      });

      const subjectMap = subject?.reduce((map, subj) => {
        map[subj.id] = subj;
        return map;
      }, {} as Record<string, typeof subject[0]>);

      const result = [];

      for (const user of users) {
        // Logic to send notification to each user about their calendar subjects
        logger.info(`Sending daily calendar notification to user: ${user.zaloId}`);
        // You can integrate with ZaloService to send messages here
        const userClasses = await prisma.userClassSubject.findMany({
          where: { userId: user.id, },
        });

        const classes = userClasses
          .map(uc => subjectMap[uc.classSubjectId])
          .filter(cls => cls !== undefined);

        if (classes.length > 0) {
          const message = `📅 Lịch học hôm nay của bạn:\n${classes
            .map(
              cls =>
                `• Môn: ${cls?.subjectName}\n• Giảng viên: ${cls.teacher}\n• Thời gian: ${cls.startTime} đến ${cls.endTime} ${DateUtils.getInstance().getDayOfWeekText(cls.dayOfWeek)}\nChúc bạn một ngày học tập hiệu quả! 🎉`
            )
            .join('\n')}`;

          // Here you would call the ZaloService to send the message
          logger.info(`Message to ${user.zaloId}: \n${message}`);
          // send bot message logic goes here
          result.push({ zaloId: user.zaloId, message });
        } else {
          logger.info(`No classes found for user: ${user.zaloId}`);
        }
      }
      return result;
    } catch (error) {
      logger.error('Error sending daily notification calendar subject:', error);
      throw error;
    }
  }

  async getCalendarSubjectTodayForUser(zaloId: string): Promise<{ subjects: any[]; message: string }> {
    try {
      const user = await this.findUserByZaloId(zaloId);

      if (!user) {
        return { subjects: [], message: "Bạn chưa đăng ký môn học nào." };
      }

      const subjectsToday = await ClassService.getInstance().getCalendarSubjectTodayForUser(user.id);
      if (subjectsToday.length === 0) {
        return { subjects: [], message: "Hôm nay bạn không có lịch học nào. Chúc bạn một ngày vui vẻ! 🎉" };
      }

      const message = `📅 Lịch học hôm nay của bạn:\n${subjectsToday
        .map(
          subj =>
            `• Môn: ${subj.subjectName}\n• Giảng viên: ${subj.teacher}\n• Thời gian: ${subj.startTime} đến ${subj.endTime}\nChúc bạn một ngày học tập hiệu quả! 🎉`
        )
        .join('\n')}`;

      return {
        subjects: subjectsToday,
        message,
      };
    } catch (error) {
      logger.error('Error getting subjects today for user:', error);
      throw error;
    }
  }

  async getSchudulerNotifyBeforeStartSubject(): Promise<{
    message: string;
    schedulerExpression: string;
    zaloId: string;
  }[]> {
    try {
      let users = await this.findUsersActiveNotify();
      const result = [];

      if (!users || users.length === 0) {
        return []
      }

      for (const user of users) {
        if (!user.id) {
          continue
        }

        const subjects = await ClassService.getInstance().getCalendarSubjectTodayForUser(user.id);


        for (const userClass of subjects) {
          const subject = await prisma.classSubject.findUnique({
            where: { id: userClass.id },
          });

          if (!subject) {
            continue
          }

          const now = new Date();
          const classDateTime = DateUtils.getInstance().getNextClassDateTime(subject.dayOfWeek, subject.startTime);
          const notifyTime = new Date(classDateTime.getTime() - 30 * 60 * 1000); // 30 minutes before class
          const schedulerExpression = `${DateUtils.getInstance().getMinutes(notifyTime)} ${DateUtils.getInstance().getHours(notifyTime)} * * *`;

          if (notifyTime > now) {
            // Here you would schedule a job to send notification at notifyTime
            logger.info(`Scheduled notification for user ${user.id} for subject ${subject.subjectName} at ${notifyTime}`);
            result.push({
              message: `⏰ Nhắc nhở: Môn ${subject.subjectName} của bạn sẽ bắt đầu vào lúc ${subject.startTime} hôm nay. Hãy chuẩn bị sẵn sàng!`,
              schedulerExpression,
              zaloId: user.zaloId
            })
            // scheduling logic goes here
          } else {
            logger.info(`Notification time for user ${user.id} for subject ${subject.subjectName} has already passed.`);
          }
        }
      }
      return result;
    } catch (error) {
      logger.error('Error creating scheduler user:', error);
      throw error;
    }
  }

  async deactivateUser(zaloId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { zaloId },
        data: { active: false, updatedAt: new Date() },
      });
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw error;
    }
  }

  async activateUser(zaloId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { zaloId },
        data: { active: true, updatedAt: new Date() },
      });
    } catch (error) {
      logger.error('Error activating user:', error);
      throw error;
    }
  }

  async toggleUserNotify(zaloId: string, notify: boolean): Promise<void> {
    try {
      await prisma.user.update({
        where: { zaloId },
        data: { notify, updatedAt: new Date() },
      });
    } catch (error) {
      logger.error('Error toggling user notify:', error);
      throw error;
    }
  }

  async checkUserRegistration(zaloId: string): Promise<boolean> {
    const user = await this.findUserByZaloId(zaloId);
    if (user && user.active) {
      return true;
    }
    return false;
  }
}