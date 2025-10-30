
import { PrismaClient } from "@prisma/client"
import { GenerateUtils } from "../src/utils/generatre";

const prisma = new PrismaClient()
import { Years, YearSemester } from "../src/types/enums";



const subject = [
    { subjectId: "MA004.F13.LT.CNTT", subjectName: "Cấu trúc rời rạc", teacher: "Lê Hoàng Tuấn", certificate: 4, dayOfWeek: 7, startTime: "08:00", endTime: "11:30", year: Years.YEAR_2025_2026, semester: YearSemester.SUMMER_SEMESTER, isMain: true },
    { subjectId: "IE105.F13.LT.CNTT", subjectName: "Nhập môn bảo đảm và an ninh thông tin", teacher: "Tô Nguyễn Nhật Quang", certificate: 4, dayOfWeek: 1, startTime: "18:15", endTime: "21:30", year: Years.YEAR_2025_2026, semester: YearSemester.SUMMER_SEMESTER, isMain: true },
    { subjectId: "MA005.F12.LT.CNTT", subjectName: "Xác suất thống kê", teacher: "Nguyễn Văn Hợi", certificate: 3, dayOfWeek: 3, startTime: "18:15", endTime: "21:30", year: Years.YEAR_2025_2026, semester: YearSemester.SUMMER_SEMESTER, isMain: true },
    { subjectId: "IT003.F13.LT.CNTT", subjectName: "Cấu trúc dữ liệu và giải thuật", teacher: "Phạm Thế Sơn", certificate: 4, dayOfWeek: 4, startTime: "18:15", endTime: "21:30", year: Years.YEAR_2025_2026, semester: YearSemester.SUMMER_SEMESTER, isMain: true },
]



async function main() {
    for (const sub of subject) {
        const existing = await prisma.classSubject.findFirst({
            where: { subjectId: sub.subjectId },
        });

        if (existing) {
            await prisma.classSubject.update({
                where: { id: existing.id },
                data: {
                    subjectId: sub.subjectId,
                    subjectName: sub.subjectName,
                    dayOfWeek: sub.dayOfWeek,
                    startTime: sub.startTime,
                    endTime: sub.endTime,
                    teacher: sub.teacher,
                    certificate: sub.certificate,
                    year: sub.year,
                    semester: sub.semester,
                    isMain: sub.isMain,
                },
            });
        } else {
            await prisma.classSubject.create({
                data: {
                    id: GenerateUtils.getInstance().generateId(),
                    subjectId: sub.subjectId,
                    subjectName: sub.subjectName,
                    dayOfWeek: sub.dayOfWeek,
                    startTime: sub.startTime,
                    endTime: sub.endTime,
                    teacher: sub.teacher,
                    certificate: sub.certificate,
                    year: sub.year,
                    semester: sub.semester,
                    isMain: sub.isMain,
                },
            });
        }
    }
}

main()
    .then(async () => {
        console.log("Seeding completed.")
    })
    .finally(async () => {
        await prisma.$disconnect()
    })