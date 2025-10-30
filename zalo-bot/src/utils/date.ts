export class DateUtils {
  private static instance: DateUtils

  public static getInstance(): DateUtils {
    if (!DateUtils.instance) {
      DateUtils.instance = new DateUtils()
    }
    return DateUtils.instance
  }

  public getDayOfWeekText(dayOfWeek: number): string {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
    return days[dayOfWeek % 7]
  }

  public getCurrentDayOfWeek(): number {
    const today = new Date()
    return today.getDay()
  }

  public formatDate(date?: Date): string {
    if (!date) {
      date = new Date()
    }

    const day = date.getDate().toString().padStart(2, "0")
    return `${day}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
  }

  public formatDateTime(date?: Date): string {
    if (!date) {
      date = new Date()
    }

    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year} ${this.getHours(date)}:${this.getMinutes(date).toString().padStart(2, "0")}`
  }

  public getNextClassDateTime(dayOfWeek: number, time: string): Date {
    const now = new Date()
    const currentDayOfWeek = now.getDay()
    let daysUntilClass = (dayOfWeek - currentDayOfWeek + 7) % 7
    if (daysUntilClass === 0) {
      const [hours, minutes] = time.split(":").map(Number)
      if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
        daysUntilClass = 7 // Next week
      }
    }

    const classDate = new Date(now)
    classDate.setDate(now.getDate() + daysUntilClass)
    const [hours, minutes] = time.split(":").map(Number)
    classDate.setHours(hours, minutes, 0, 0)

    return classDate
  }

  public getHours(date: Date): number {
    return date.getHours()
  }

  public getMinutes(date: Date): number {
    return date.getMinutes()
  }

  public isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDay() === date2.getDate()
  }
}
