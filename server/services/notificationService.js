// ===========================
// server/services/NotificationService.js
// ===========================

const Notification = require("../models/notification");
const { io } = require("../socket"); // Assuming you have socket.io setup

class NotificationService {
  // Create withdrawal notification
  static async createWithdrawalNotification(userId, transactionData) {
    try {
      const { amount, accountNumber, location, method, transactionId } =
        transactionData;

      // Determine severity based on amount
      let severity = "info";
      if (amount > 10000) severity = "warning";
      if (amount > 50000) severity = "error";

      const notification = new Notification({
        userId,
        type: "withdrawal",
        title: "Money Withdrawn",
        message: `$${amount.toLocaleString()} has been withdrawn from your account`,
        amount,
        transactionId,
        severity,
        metadata: {
          accountNumber: accountNumber || "Unknown",
          location: location || "Unknown location",
          method: method || "ATM",
          timestamp: new Date(),
        },
      });

      const savedNotification = await notification.save();

      // Send real-time notification via Socket.IO
      this.sendRealTimeNotification(userId, savedNotification);

      // Send email notification for large amounts
      if (amount > 5000) {
        this.sendEmailNotification(userId, savedNotification);
      }

      // Send SMS for very large amounts
      if (amount > 20000) {
        this.sendSMSNotification(userId, savedNotification);
      }

      return savedNotification;
    } catch (error) {
      console.error("Error creating withdrawal notification:", error);
      throw error;
    }
  }

  // Send real-time notification via Socket.IO
  static sendRealTimeNotification(userId, notification) {
    if (io) {
      io.to(`user_${userId}`).emit("new_notification", {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        amount: notification.amount,
        severity: notification.severity,
        timestamp: notification.createdAt,
        metadata: notification.metadata,
      });
    }
  }

  // Get user notifications
  static async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;

    const filter = { userId };
    if (unreadOnly) filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return {
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + notifications.length < totalCount,
      },
      unreadCount,
    };
  }

  // Mark notification as read
  static async markAsRead(userId, notificationId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  // Delete notification
  static async deleteNotification(userId, notificationId) {
    return await Notification.findOneAndDelete({ _id: notificationId, userId });
  }

  // Send email notification (implement with your email service)
  static async sendEmailNotification(userId, notification) {
    // Implement email sending logic here
    // Example: using nodemailer, sendgrid, etc.
    console.log(
      `Email notification sent to user ${userId}:`,
      notification.message
    );
  }

  // Send SMS notification (implement with your SMS service)
  static async sendSMSNotification(userId, notification) {
    // Implement SMS sending logic here
    // Example: using Twilio, AWS SNS, etc.
    console.log(
      `SMS notification sent to user ${userId}:`,
      notification.message
    );
  }
}

module.exports = NotificationService;
