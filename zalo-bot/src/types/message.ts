// Bot response messages
const BOT_RESPONSES = {
  // Chào hỏi
  greeting: {
    text: "Xin chào! 👋\n\nTôi là Study Optimizer Bot, trợ lý học tập của bạn.\n\nGửi /help để xem danh sách lệnh có sẵn.",
    alternatives: ["Chào bạn! Rất vui được hỗ trợ bạn hôm nay. 😊", "Hi! Tôi có thể giúp gì cho bạn?"],
  },

  //  "• /schedule - Xem lịch tuần\n" +
  // "  Ví dụ: /schedule hoặc /lịch học\n\n" +
  // Trợ giúp
  help: {
    text:
      "📚 **DANH SÁCH LỆNH**\n\n" +
      "**Cơ bản:**\n" +
      "• /hello - Chào hỏi\n" +
      "  Ví dụ: /hello hoặc /hi\n\n" +
      "• /help - Hiển thị trợ giúp\n" +
      "  Ví dụ: /help\n\n" +
      "• /info - Thông tin bot\n" +
      "  Ví dụ: /info\n\n" +
      "• /menu - Menu lệnh\n" +
      "  Ví dụ: /menu\n\n" +
      "**Đăng ký:**\n" +
      "• /register - Đăng ký nhận thông báo\n" +
      "  Ví dụ: /register hoặc /đăng ký\n\n" +
      "• /unregister - Hủy đăng ký\n" +
      "  Ví dụ: /unregister\n\n" +
      "• /notify [true|false] - Bật/Tắt thông báo\n" +
      "  Ví dụ: /notify true hoặc /notify false\n\n" +
      "**Lịch học:**\n" +
      "• /today - Xem lịch hôm nay\n" +
      "  Ví dụ: /today\n\n" +
      "• /class [Mã môn] - Chi tiết lớp học\n" +
      "  Ví dụ: /class MA004\n" +
      "  Hoặc: /class (xem tất cả)\n\n" +
      "**Bài tập:**\n" +
      "• /assignments - Danh sách bài tập\n" +
      "  Ví dụ: /assignments\n\n" +
      "• /upcoming_assignments - Bài tập sắp tới\n" +
      "  Ví dụ: /upcoming_assignments\n\n" +
      "• /add_assignment Tên | Mô tả | Hạn nộp - Thêm bài tập\n" +
      "  Ví dụ: /add_assignment Làm bài tập Toán | Bài tập về nhà chương 1 | 2024-09-15\n\n" +
      "• /status_assignment - Cập nhật trạng thái\n" +
      "  Ví dụ: /status_assignment BaiTap1 completed(true|false)\n\n" +
      "• /remove_assignment Mã bài tập - Xóa bài tập\n" +
      "  Ví dụ: /remove_assignment 12345\n\n" +
      "**Tài liệu:**\n" +
      "• /docs [Mã môn] - Truy cập tài liệu\n" +
      "  Ví dụ: /docs MA004\n\n" +
      "💡 Gửi /menu để xem menu tương tác",
  },

  // Thông tin bot
  info: {
    text:
      "ℹ️ **STUDY OPTIMIZER BOT**\n\n" +
      "🎯 **Mục đích:** Hỗ trợ quản lý lịch học và bài tập\n\n" +
      "✨ **Tính năng:**\n" +
      "• Thông báo lịch học hàng ngày\n" +
      "• Quản lý bài tập\n" +
      "• Truy cập tài liệu học tập\n" +
      "• Theo dõi tiến độ học tập\n\n" +
      "📧 Hỗ trợ: Liên hệ admin nếu cần trợ giúp\n" +
      "🔖 Phiên bản thử nghiệm: 1.0.0"
  },

  // Đăng ký
  register: {
    success:
      "✅ **ĐĂNG KÝ THÀNH CÔNG!**\n\n" +
      "Bạn đã đăng ký nhận thông báo lịch học từ Study Optimizer.\n\n" +
      "📅 Bạn sẽ nhận thông báo:\n" +
      "• Mỗi sáng trước khi bắt đầu ngày học\n" +
      "• Nhắc nhở về bài tập sắp đến hạn\n" +
      "• Cập nhật lịch học khi có thay đổi\n\n" +
      "💡 Gửi /notify false để tạm tắt thông báo.",

    alreadyRegistered:
      "ℹ️ Bạn đã đăng ký trước đó rồi.\n\n" + "Bạn đang nhận thông báo lịch học hàng ngày.\n" + "Gửi /unregister nếu muốn hủy đăng ký.",
  },

  // Hủy đăng ký
  unregister: {
    success:
      "✅ **HỦY ĐĂNG KÝ THÀNH CÔNG**\n\n" +
      "Bạn đã hủy đăng ký khỏi Study Optimizer.\n\n" +
      "❌ Bạn sẽ không còn nhận:\n" +
      "• Thông báo lịch học hàng ngày\n" +
      "• Nhắc nhở về bài tập\n\n" +
      "💡 Gửi /register bất cứ lúc nào để đăng ký lại.",

    notRegistered: "ℹ️ Bạn chưa đăng ký nhận thông báo.\n\n" + "Gửi /register để bắt đầu nhận thông báo lịch học.",
  },

  // Lịch học tuần
  schedule: {
    template:
      "📅 **LỊCH HỌC TUẦN NÀY**\n\n" + "{scheduleData}\n\n" + "💡 Gửi /today để xem lịch hôm nay\n" + "💡 Gửi /class [Mã môn] để xem chi tiết",

    empty: "📅 **LỊCH HỌC TUẦN NÀY**\n\n" + "Bạn chưa có lịch học nào được đăng ký.\n\n" + "💡 Liên hệ admin để thêm lịch học.",
  },

  // Chi tiết lớp học
  class: {
    template:
      "📖 **CHI TIẾT LỚP HỌC**\n\n" +
      "**Mã môn:** {classCode}\n" +
      "**Tên môn:** {className}\n" +
      "**Giảng viên:** {teacher}\n" +
      "**Thời gian:** {schedule}\n" +
      "**Phòng:** {room}\n" +
      "**Ghi chú:** {notes}\n\n" +
      "💡 Gửi /docs {classCode} để xem tài liệu",

    notFound: "❌ Không tìm thấy lớp học với mã: {classCode}\n\n" + "💡 Gửi /class để xem tất cả lớp học\n" + "💡 Gửi /schedule để xem lịch tuần",

    list: "📖 **DANH SÁCH LỚP HỌC**\n\n" + "{classList}\n\n" + "💡 Gửi /class [Mã môn] để xem chi tiết",
  },

  // Lịch hôm nay
  today: {
    template: "📅 **LỊCH HỌC HÔM NAY** ({date})\n\n" + "{todaySchedule}\n\n" + "💡 Chúc bạn một ngày học tập hiệu quả!",

    empty:
      "📅 **LỊCH HỌC HÔM NAY** ({date})\n\n" +
      "🎉 Bạn không có lịch học hôm nay!\n\n" +
      "💡 Tận dụng thời gian để:\n" +
      "• Ôn tập bài cũ\n" +
      "• Làm bài tập\n" +
      "• Nghỉ ngơi",
  },

  // Bật/Tắt thông báo
  notify: {
    enabled: "🔔 **THÔNG BÁO ĐÃ BẬT**\n\n" + "Bạn sẽ nhận thông báo lịch học hàng ngày.",

    disabled: "🔕 **THÔNG BÁO ĐÃ TẮT**\n\n" + "Bạn sẽ không nhận thông báo cho đến khi bật lại.\n\n" + "💡 Gửi /notify true để bật lại.",

    invalidParam: "❌ Tham số không hợp lệ.\n\n" + "✅ Sử dụng: /notify true hoặc /notify false",
  },

  // Menu
  menu: {
    text: "📋 **MENU LỆNH**\n\n" + "Chọn một lệnh bên dưới hoặc gửi /help để xem hướng dẫn chi tiết.",

    buttons: [
      { text: "📅 Lịch học", command: "/schedule" },
      { text: "📝 Bài tập", command: "/assignments" },
      { text: "📚 Tài liệu", command: "/docs" },
      { text: "⚙️ Cài đặt", command: "/notify" },
    ],
  },

  // Danh sách bài tập
  assignments: {
    template:
      "📝 **DANH SÁCH BÀI TẬP**\n\n" +
      "{assignmentsList}\n\n" +
      "💡 Gửi /status_assignment [tên] [trạng thái] để cập nhật\n" +
      "💡 Gửi /upcoming_assignments để xem bài sắp tới",

    empty: "📝 **DANH SÁCH BÀI TẬP**\n\n" + "Bạn chưa có bài tập nào được giao.\n\n" + "🎉 Tận hưởng thời gian rảnh!",
  },

  // Cập nhật trạng thái bài tập
  statusAssignment: {
    success:
      "✅ **CẬP NHẬT THÀNH CÔNG**\n\n" + "Bài tập: {assignmentName}\n" + "Trạng thái mới: {status}\n\n" + "💡 Gửi /assignments để xem tất cả bài tập",

    notFound: "❌ Không tìm thấy bài tập: {assignmentName}\n\n" + "💡 Gửi /assignments để xem danh sách",

    invalidStatus: "❌ Trạng thái không hợp lệ.\n\n" + "✅ Sử dụng một trong các trạng thái:\n" + "• Done\n" + "• In Progress\n" + "• Not Started",

    invalidFormat:
      "❌ Sai cú pháp.\n\n" +
      "✅ Cú pháp đúng:\n" +
      "/status_assignment [tên bài tập] [trạng thái]\n\n" +
      "📌 Ví dụ:\n" +
      "/status_assignment BaiTap1 Done",
  },

  // Bài tập sắp tới
  upcomingAssignments: {
    template: "⏰ **BÀI TẬP SẮP TỚI**\n\n" + "{upcomingList}\n\n" + "💡 Lên kế hoạch hoàn thành sớm nhé!",

    empty: "⏰ **BÀI TẬP SẮP TỚI**\n\n" + "🎉 Bạn không có bài tập nào sắp đến hạn!\n\n" + "💡 Gửi /assignments để xem tất cả bài tập",
  },

  // Tài liệu
  docs: {
    template:
      "📚 **TÀI LIỆU HỌC TẬP**\n\n" +
      "**Môn học:** {className}\n" +
      "**Mã môn:** {classCode}\n\n" +
      "📄 **Danh sách tài liệu:**\n" +
      "{docsList}\n\n" +
      "💡 Click vào link để tải tài liệu",

    notFound: "❌ Không tìm thấy tài liệu cho mã môn: {classCode}\n\n" + "💡 Gửi /class để xem danh sách môn học",

    noCode:
      "ℹ️ **HƯỚNG DẪN SỬ DỤNG**\n\n" +
      "✅ Cú pháp: /docs [Mã môn học]\n\n" +
      "📌 Ví dụ:\n" +
      "/docs MA004.F13.LT.CNTT\n\n" +
      "💡 Gửi /class để xem danh sách mã môn",
  },

  // Lỗi chung
  error: {
    general: "❌ Đã xảy ra lỗi. Vui lòng thử lại sau.\n\n" + "💡 Gửi /help nếu cần trợ giúp.",

    unknownCommand: "❓ Lệnh không xác định.\n\n" + "💡 Gửi /help để xem danh sách lệnh\n" + "💡 Gửi /menu để xem menu",

    permissionDenied: "🔒 Bạn không có quyền thực hiện lệnh này.\n\n" + "💡 Liên hệ admin để được hỗ trợ.",
  },
}

// Export cho TypeScript
export default BOT_RESPONSES
