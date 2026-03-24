const nodemailer = require('nodemailer');
const { logger } = require('../config/logger.config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Configure based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production email service (e.g., SendGrid, AWS SES)
        this.transporter = nodemailer.createTransport({
          service: 'SendGrid', // or 'gmail', 'outlook', etc.
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      } else {
        // Development - use Ethereal Email for testing
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
            pass: process.env.EMAIL_PASSWORD || 'ethereal.pass',
          },
        });
      }

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail(to, subject, html, attachments = []) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'FoodStack <noreply@foodstack.com>',
        to,
        subject,
        html,
        attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Welcome email for new restaurant registration
  async sendWelcomeEmail(userEmail, userName, restaurantName) {
    const subject = 'Chào mừng bạn đến với FoodStack!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ FoodStack</h1>
            <h2>Chào mừng ${userName}!</h2>
          </div>
          <div class="content">
            <p>Cảm ơn bạn đã đăng ký FoodStack cho nhà hàng <strong>${restaurantName}</strong>!</p>
            
            <p>Với FoodStack, bạn có thể:</p>
            <ul>
              <li>✅ Quản lý menu và đơn hàng dễ dàng</li>
              <li>✅ Nhận đơn hàng qua QR code</li>
              <li>✅ Theo dõi doanh thu real-time</li>
              <li>✅ Quản lý nhiều chi nhánh</li>
              <li>✅ Phân tích khách hàng chi tiết</li>
            </ul>

            <p>Hãy bắt đầu thiết lập nhà hàng của bạn ngay hôm nay!</p>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Bắt đầu ngay</a>

            <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
          </div>
          <div class="footer">
            <p>© 2024 FoodStack. Tất cả quyền được bảo lưu.</p>
            <p>Email: support@foodstack.com | Hotline: 1900-1234</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  // Email verification
  async sendEmailVerification(userEmail, userName, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const subject = 'Xác thực email FoodStack';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .code { background: #e9ecef; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Xác thực Email</h1>
          </div>
          <div class="content">
            <p>Xin chào ${userName},</p>
            <p>Vui lòng xác thực email của bạn để hoàn tất đăng ký FoodStack.</p>
            
            <div class="code">${verificationToken}</div>
            
            <p>Hoặc click vào nút bên dưới:</p>
            <a href="${verificationUrl}" class="button">Xác thực Email</a>
            
            <p><small>Mã xác thực có hiệu lực trong 24 giờ.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  // Password reset email
  async sendPasswordReset(userEmail, userName, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Đặt lại mật khẩu FoodStack';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Đặt lại mật khẩu</h1>
          </div>
          <div class="content">
            <p>Xin chào ${userName},</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            
            <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
            
            <div class="warning">
              <strong>⚠️ Lưu ý:</strong>
              <ul>
                <li>Link này có hiệu lực trong 1 giờ</li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này</li>
                <li>Không chia sẻ link này với bất kỳ ai</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  // Order confirmation email
  async sendOrderConfirmation(customerEmail, orderDetails) {
    const { orderNumber, items, total, restaurantName, tableNumber } = orderDetails;
    const subject = `Xác nhận đơn hàng #${orderNumber}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Đơn hàng đã được xác nhận</h1>
            <h2>Đơn #${orderNumber}</h2>
          </div>
          <div class="content">
            <div class="order-info">
              <h3>Thông tin đơn hàng</h3>
              <p><strong>Nhà hàng:</strong> ${restaurantName}</p>
              <p><strong>Bàn số:</strong> ${tableNumber}</p>
              <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
              
              <h4>Chi tiết đơn hàng:</h4>
              ${items.map(item => `
                <div class="item">
                  <span>${item.name} x${item.quantity}</span>
                  <span>${item.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
              `).join('')}
              
              <div class="item total">
                <span>Tổng cộng:</span>
                <span>${total.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            
            <p>Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đang được chuẩn bị.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(customerEmail, subject, html);
  }

  // Invoice email
  async sendInvoice(customerEmail, invoiceData) {
    const { invoiceNumber, orderDetails, paymentInfo } = invoiceData;
    const subject = `Hóa đơn #${invoiceNumber}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .invoice { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .total-section { background: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧾 Hóa đơn điện tử</h1>
            <h2>#${invoiceNumber}</h2>
          </div>
          <div class="content">
            <div class="invoice">
              <h3>Chi tiết thanh toán</h3>
              <div class="item">
                <span>Phương thức:</span>
                <span>${paymentInfo.method}</span>
              </div>
              <div class="item">
                <span>Trạng thái:</span>
                <span>Đã thanh toán</span>
              </div>
              <div class="item">
                <span>Thời gian:</span>
                <span>${new Date(paymentInfo.paidAt).toLocaleString('vi-VN')}</span>
              </div>
              
              <div class="total-section">
                <div class="item">
                  <span>Tổng tiền hàng:</span>
                  <span>${orderDetails.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div class="item">
                  <span>Thuế VAT:</span>
                  <span>${orderDetails.tax.toLocaleString('vi-VN')}đ</span>
                </div>
                <div class="item">
                  <span>Phí dịch vụ:</span>
                  <span>${orderDetails.serviceCharge.toLocaleString('vi-VN')}đ</span>
                </div>
                <div class="item" style="font-weight: bold; font-size: 18px;">
                  <span>Tổng thanh toán:</span>
                  <span>${orderDetails.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
            
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(customerEmail, subject, html);
  }

  // Subscription expiry warning
  async sendSubscriptionExpiryWarning(userEmail, userName, restaurantName, daysLeft) {
    const subject = `⚠️ Gói dịch vụ sắp hết hạn - ${restaurantName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #212529; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Thông báo quan trọng</h1>
            <h2>Gói dịch vụ sắp hết hạn</h2>
          </div>
          <div class="content">
            <p>Xin chào ${userName},</p>
            
            <div class="warning">
              <p><strong>Gói dịch vụ của nhà hàng "${restaurantName}" sẽ hết hạn trong ${daysLeft} ngày nữa.</strong></p>
            </div>
            
            <p>Để tránh gián đoạn dịch vụ, vui lòng gia hạn gói dịch vụ ngay hôm nay.</p>
            
            <p>Khi gói dịch vụ hết hạn, các tính năng sau sẽ bị tạm ngưng:</p>
            <ul>
              <li>Nhận đơn hàng mới</li>
              <li>Quản lý menu và bàn</li>
              <li>Báo cáo và phân tích</li>
              <li>Hỗ trợ khách hàng</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/subscription" class="button">Gia hạn ngay</a>
            
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  // Staff invitation email
  async sendStaffInvitation(staffEmail, staffName, restaurantName, tempPassword) {
    const subject = `Mời tham gia đội ngũ ${restaurantName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #17a2b8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .credentials { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Chào mừng bạn!</h1>
            <h2>Tham gia đội ngũ ${restaurantName}</h2>
          </div>
          <div class="content">
            <p>Xin chào ${staffName},</p>
            <p>Bạn đã được mời tham gia đội ngũ nhân viên của <strong>${restaurantName}</strong> trên hệ thống FoodStack.</p>
            
            <div class="credentials">
              <h4>Thông tin đăng nhập:</h4>
              <p><strong>Email:</strong> ${staffEmail}</p>
              <p><strong>Mật khẩu tạm thời:</strong> ${tempPassword}</p>
            </div>
            
            <p><strong>Lưu ý quan trọng:</strong> Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên.</p>
            
            <a href="${process.env.FRONTEND_URL}/login" class="button">Đăng nhập ngay</a>
            
            <p>Chào mừng bạn đến với FoodStack!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(staffEmail, subject, html);
  }
}

// Singleton instance
const emailService = new EmailService();

module.exports = { EmailService, emailService };