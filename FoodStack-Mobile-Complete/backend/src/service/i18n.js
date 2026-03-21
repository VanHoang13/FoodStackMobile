class I18nService {
  constructor() {
    this.defaultLocale = 'vi';
    this.supportedLocales = ['vi', 'en'];
    this.translations = {
      vi: {
        // Common
        'common.success': 'Thành công',
        'common.error': 'Lỗi',
        'common.loading': 'Đang tải...',
        'common.save': 'Lưu',
        'common.cancel': 'Hủy',
        'common.delete': 'Xóa',
        'common.edit': 'Sửa',
        'common.add': 'Thêm',
        'common.search': 'Tìm kiếm',
        'common.filter': 'Lọc',
        'common.sort': 'Sắp xếp',
        'common.refresh': 'Làm mới',
        'common.back': 'Quay lại',
        'common.next': 'Tiếp theo',
        'common.previous': 'Trước',
        'common.confirm': 'Xác nhận',
        'common.yes': 'Có',
        'common.no': 'Không',

        // Authentication
        'auth.login': 'Đăng nhập',
        'auth.logout': 'Đăng xuất',
        'auth.register': 'Đăng ký',
        'auth.email': 'Email',
        'auth.password': 'Mật khẩu',
        'auth.confirmPassword': 'Xác nhận mật khẩu',
        'auth.forgotPassword': 'Quên mật khẩu?',
        'auth.resetPassword': 'Đặt lại mật khẩu',
        'auth.changePassword': 'Đổi mật khẩu',
        'auth.currentPassword': 'Mật khẩu hiện tại',
        'auth.newPassword': 'Mật khẩu mới',
        'auth.loginSuccess': 'Đăng nhập thành công',
        'auth.loginFailed': 'Đăng nhập thất bại',
        'auth.invalidCredentials': 'Email hoặc mật khẩu không đúng',
        'auth.accountLocked': 'Tài khoản đã bị khóa',
        'auth.emailNotVerified': 'Email chưa được xác thực',
        'auth.passwordTooWeak': 'Mật khẩu quá yếu',
        'auth.passwordMismatch': 'Mật khẩu xác nhận không khớp',

        // Restaurant
        'restaurant.name': 'Tên nhà hàng',
        'restaurant.address': 'Địa chỉ',
        'restaurant.phone': 'Số điện thoại',
        'restaurant.email': 'Email',
        'restaurant.description': 'Mô tả',
        'restaurant.logo': 'Logo',
        'restaurant.banner': 'Banner',
        'restaurant.openingHours': 'Giờ mở cửa',
        'restaurant.closingHours': 'Giờ đóng cửa',
        'restaurant.cuisine': 'Loại ẩm thực',
        'restaurant.priceRange': 'Khoảng giá',
        'restaurant.rating': 'Đánh giá',
        'restaurant.reviews': 'Nhận xét',

        // Menu
        'menu.category': 'Danh mục',
        'menu.item': 'Món ăn',
        'menu.name': 'Tên món',
        'menu.description': 'Mô tả',
        'menu.price': 'Giá',
        'menu.image': 'Hình ảnh',
        'menu.available': 'Còn hàng',
        'menu.unavailable': 'Hết hàng',
        'menu.popular': 'Phổ biến',
        'menu.spicy': 'Cay',
        'menu.vegetarian': 'Chay',
        'menu.vegan': 'Thuần chay',
        'menu.glutenFree': 'Không gluten',
        'menu.customization': 'Tùy chọn',
        'menu.addToCart': 'Thêm vào giỏ',
        'menu.quantity': 'Số lượng',
        'menu.subtotal': 'Tạm tính',
        'menu.total': 'Tổng cộng',

        // Orders
        'order.number': 'Số đơn hàng',
        'order.status': 'Trạng thái',
        'order.pending': 'Chờ xử lý',
        'order.confirmed': 'Đã xác nhận',
        'order.preparing': 'Đang chuẩn bị',
        'order.ready': 'Sẵn sàng',
        'order.served': 'Đã phục vụ',
        'order.completed': 'Hoàn thành',
        'order.cancelled': 'Đã hủy',
        'order.items': 'Món đã đặt',
        'order.customerCount': 'Số khách',
        'order.table': 'Bàn',
        'order.notes': 'Ghi chú',
        'order.specialInstructions': 'Yêu cầu đặc biệt',
        'order.estimatedTime': 'Thời gian dự kiến',
        'order.actualTime': 'Thời gian thực tế',

        // Payments
        'payment.method': 'Phương thức thanh toán',
        'payment.cash': 'Tiền mặt',
        'payment.card': 'Thẻ',
        'payment.qr': 'QR Code',
        'payment.wallet': 'Ví điện tử',
        'payment.banking': 'Chuyển khoản',
        'payment.status': 'Trạng thái thanh toán',
        'payment.pending': 'Chờ thanh toán',
        'payment.processing': 'Đang xử lý',
        'payment.success': 'Thành công',
        'payment.failed': 'Thất bại',
        'payment.refunded': 'Đã hoàn tiền',
        'payment.amount': 'Số tiền',
        'payment.tax': 'Thuế',
        'payment.serviceCharge': 'Phí dịch vụ',
        'payment.discount': 'Giảm giá',
        'payment.tip': 'Tiền tip',

        // Tables & Areas
        'table.number': 'Số bàn',
        'table.capacity': 'Sức chứa',
        'table.status': 'Trạng thái bàn',
        'table.available': 'Trống',
        'table.occupied': 'Có khách',
        'table.reserved': 'Đã đặt',
        'table.cleaning': 'Đang dọn',
        'table.qrCode': 'Mã QR',
        'area.name': 'Tên khu vực',
        'area.mainHall': 'Sảnh chính',
        'area.vip': 'VIP',
        'area.outdoor': 'Ngoài trời',
        'area.rooftop': 'Sân thượng',
        'area.private': 'Riêng tư',

        // Reservations
        'reservation.date': 'Ngày đặt',
        'reservation.time': 'Giờ đặt',
        'reservation.partySize': 'Số người',
        'reservation.customerName': 'Tên khách hàng',
        'reservation.customerPhone': 'Số điện thoại',
        'reservation.customerEmail': 'Email khách hàng',
        'reservation.specialRequests': 'Yêu cầu đặc biệt',
        'reservation.status': 'Trạng thái đặt bàn',
        'reservation.confirmed': 'Đã xác nhận',
        'reservation.checkedIn': 'Đã check-in',
        'reservation.noShow': 'Không đến',

        // Service Requests
        'service.type': 'Loại yêu cầu',
        'service.callStaff': 'Gọi nhân viên',
        'service.water': 'Nước uống',
        'service.napkins': 'Khăn giấy',
        'service.utensils': 'Đồ ăn',
        'service.bill': 'Hóa đơn',
        'service.cleanTable': 'Dọn bàn',
        'service.complaint': 'Khiếu nại',
        'service.other': 'Khác',
        'service.priority': 'Độ ưu tiên',
        'service.low': 'Thấp',
        'service.normal': 'Bình thường',
        'service.high': 'Cao',
        'service.urgent': 'Khẩn cấp',

        // Feedback
        'feedback.rating': 'Đánh giá',
        'feedback.overall': 'Tổng thể',
        'feedback.foodQuality': 'Chất lượng món ăn',
        'feedback.service': 'Dịch vụ',
        'feedback.atmosphere': 'Không gian',
        'feedback.price': 'Giá cả',
        'feedback.cleanliness': 'Vệ sinh',
        'feedback.comment': 'Nhận xét',
        'feedback.anonymous': 'Ẩn danh',
        'feedback.wouldRecommend': 'Sẽ giới thiệu',
        'feedback.visitAgain': 'Sẽ quay lại',

        // Staff
        'staff.name': 'Tên nhân viên',
        'staff.role': 'Vai trò',
        'staff.manager': 'Quản lý',
        'staff.waiter': 'Phục vụ',
        'staff.chef': 'Đầu bếp',
        'staff.cashier': 'Thu ngân',
        'staff.cleaner': 'Dọn dẹp',
        'staff.status': 'Trạng thái',
        'staff.active': 'Hoạt động',
        'staff.inactive': 'Không hoạt động',
        'staff.onShift': 'Đang làm việc',
        'staff.offShift': 'Nghỉ việc',

        // Analytics
        'analytics.revenue': 'Doanh thu',
        'analytics.orders': 'Đơn hàng',
        'analytics.customers': 'Khách hàng',
        'analytics.averageOrderValue': 'Giá trị đơn hàng TB',
        'analytics.topSellingItems': 'Món bán chạy',
        'analytics.peakHours': 'Giờ cao điểm',
        'analytics.dailyRevenue': 'Doanh thu hàng ngày',
        'analytics.monthlyRevenue': 'Doanh thu hàng tháng',
        'analytics.yearlyRevenue': 'Doanh thu hàng năm',

        // Notifications
        'notification.newOrder': 'Đơn hàng mới',
        'notification.orderUpdate': 'Cập nhật đơn hàng',
        'notification.paymentReceived': 'Đã nhận thanh toán',
        'notification.reservationConfirmed': 'Đặt bàn đã xác nhận',
        'notification.serviceRequest': 'Yêu cầu phục vụ',
        'notification.feedbackReceived': 'Nhận được đánh giá',

        // Errors
        'error.networkError': 'Lỗi kết nối mạng',
        'error.serverError': 'Lỗi máy chủ',
        'error.notFound': 'Không tìm thấy',
        'error.unauthorized': 'Không có quyền truy cập',
        'error.forbidden': 'Bị cấm truy cập',
        'error.validationError': 'Dữ liệu không hợp lệ',
        'error.duplicateEntry': 'Dữ liệu đã tồn tại',
        'error.insufficientPermissions': 'Không đủ quyền hạn',

        // Success Messages
        'success.created': 'Tạo thành công',
        'success.updated': 'Cập nhật thành công',
        'success.deleted': 'Xóa thành công',
        'success.saved': 'Lưu thành công',
        'success.sent': 'Gửi thành công',
        'success.uploaded': 'Tải lên thành công',
      },
      en: {
        // Common
        'common.success': 'Success',
        'common.error': 'Error',
        'common.loading': 'Loading...',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.sort': 'Sort',
        'common.refresh': 'Refresh',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',
        'common.confirm': 'Confirm',
        'common.yes': 'Yes',
        'common.no': 'No',

        // Authentication
        'auth.login': 'Login',
        'auth.logout': 'Logout',
        'auth.register': 'Register',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Confirm Password',
        'auth.forgotPassword': 'Forgot Password?',
        'auth.resetPassword': 'Reset Password',
        'auth.changePassword': 'Change Password',
        'auth.currentPassword': 'Current Password',
        'auth.newPassword': 'New Password',
        'auth.loginSuccess': 'Login successful',
        'auth.loginFailed': 'Login failed',
        'auth.invalidCredentials': 'Invalid email or password',
        'auth.accountLocked': 'Account is locked',
        'auth.emailNotVerified': 'Email not verified',
        'auth.passwordTooWeak': 'Password is too weak',
        'auth.passwordMismatch': 'Passwords do not match',

        // Restaurant
        'restaurant.name': 'Restaurant Name',
        'restaurant.address': 'Address',
        'restaurant.phone': 'Phone Number',
        'restaurant.email': 'Email',
        'restaurant.description': 'Description',
        'restaurant.logo': 'Logo',
        'restaurant.banner': 'Banner',
        'restaurant.openingHours': 'Opening Hours',
        'restaurant.closingHours': 'Closing Hours',
        'restaurant.cuisine': 'Cuisine Type',
        'restaurant.priceRange': 'Price Range',
        'restaurant.rating': 'Rating',
        'restaurant.reviews': 'Reviews',

        // Add more English translations as needed...
      }
    };
  }

  // Get translation for a key
  t(key, locale = null, params = {}) {
    const currentLocale = locale || this.defaultLocale;
    const translation = this.translations[currentLocale]?.[key] || 
                       this.translations[this.defaultLocale]?.[key] || 
                       key;

    // Replace parameters in translation
    return this.interpolate(translation, params);
  }

  // Interpolate parameters into translation string
  interpolate(text, params) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  // Get all translations for a locale
  getTranslations(locale = null) {
    const currentLocale = locale || this.defaultLocale;
    return this.translations[currentLocale] || this.translations[this.defaultLocale];
  }

  // Check if locale is supported
  isLocaleSupported(locale) {
    return this.supportedLocales.includes(locale);
  }

  // Get supported locales
  getSupportedLocales() {
    return this.supportedLocales;
  }

  // Set default locale
  setDefaultLocale(locale) {
    if (this.isLocaleSupported(locale)) {
      this.defaultLocale = locale;
    }
  }

  // Add new translation
  addTranslation(locale, key, value) {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    this.translations[locale][key] = value;
  }

  // Add multiple translations
  addTranslations(locale, translations) {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    Object.assign(this.translations[locale], translations);
  }

  // Format currency
  formatCurrency(amount, locale = null) {
    const currentLocale = locale || this.defaultLocale;
    
    if (currentLocale === 'vi') {
      return `${amount.toLocaleString('vi-VN')}đ`;
    } else {
      return `$${amount.toLocaleString('en-US')}`;
    }
  }

  // Format date
  formatDate(date, locale = null) {
    const currentLocale = locale || this.defaultLocale;
    const dateObj = new Date(date);
    
    if (currentLocale === 'vi') {
      return dateObj.toLocaleDateString('vi-VN');
    } else {
      return dateObj.toLocaleDateString('en-US');
    }
  }

  // Format time
  formatTime(date, locale = null) {
    const currentLocale = locale || this.defaultLocale;
    const dateObj = new Date(date);
    
    return dateObj.toLocaleTimeString(currentLocale === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Format datetime
  formatDateTime(date, locale = null) {
    return `${this.formatDate(date, locale)} ${this.formatTime(date, locale)}`;
  }

  // Get relative time (e.g., "2 minutes ago")
  getRelativeTime(date, locale = null) {
    const currentLocale = locale || this.defaultLocale;
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));

    if (currentLocale === 'vi') {
      if (diffInMinutes < 1) return 'Vừa xong';
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} giờ trước`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    } else {
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  }

  // Pluralize text based on count
  pluralize(key, count, locale = null) {
    const currentLocale = locale || this.defaultLocale;
    
    if (currentLocale === 'vi') {
      // Vietnamese doesn't have plural forms like English
      return this.t(key, locale, { count });
    } else {
      // English pluralization
      const singularKey = `${key}.singular`;
      const pluralKey = `${key}.plural`;
      
      if (count === 1) {
        return this.t(singularKey, locale, { count });
      } else {
        return this.t(pluralKey, locale, { count });
      }
    }
  }
}

// Create singleton instance
const i18nService = new I18nService();

module.exports = { I18nService, i18nService };