import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Modal,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { colors, typography, radius } from "../../theme";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const { width } = Dimensions.get("window");

export default function NotificationsScreen({ navigation }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notifications`);
      const data = response.notifications || response.data || [];
      setNotifications(data);

      // Count unread notifications
      const unread = data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // In a real app, we would show an error message to the user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationPress = (notification) => {
    // Navigate based on notification type
    if (notification.type === "job_application") {
      navigation.navigate("JobDetails", { jobId: notification.data?.jobId });
    } else if (notification.type === "group_message") {
      navigation.navigate("GroupChat", {
        groupId: notification.data?.groupId,
        groupName: notification.data?.groupName,
      });
    } else {
      // Default to notification details
      navigation.navigate("NotificationDetails", {
        notificationId: notification.id,
      });
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.centeredLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadBadge}>{unreadCount}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <Button
              title="Mark All Read"
              onPress={handleMarkAllAsRead}
              variant="outline"
              size="small"
            />
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleNotificationPress(item)}
            style={[
              styles.notificationItem,
              !item.read && styles.notificationUnread,
            ]}
          >
            <View style={styles.notificationContent}>
              <View style={styles.notificationIcon}>
                {/* Icon based on notification type */}
                {getNotificationIcon(item.type)}
              </View>
              <View style={styles.notificationDetails}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>
                  {/* Format time in a real app */}
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            </View>
            {!item.read && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        ListFooterComponent={<View style={styles.listFooter} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

// Helper function to get notification icon based on type
function getNotificationIcon(type) {
  // In a real implementation, we would use actual icons
  // For now, we'll return a colored circle
  const colorsMap = {
    job_application: colors.primary,
    group_message: colors.success,
    event_update: colors.warning,
    payment: colors.danger,
    system: colors.gray500,
  };

  const bgColor = colorsMap[type] || colors.gray300;

  return (
    <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
      <Text style={styles.iconText}>{getIconText(type)}</Text>
    </View>
  );
}

// Helper function to get icon text based on type
function getIconText(type) {
  const iconsMap = {
    job_application: "💼",
    group_message: "💬",
    event_update: "📅",
    payment: "💰",
    system: "⚙️",
  };

  return iconsMap[type] || "📢";
}

// Helper function to format time
function formatTime(timestamp) {
  // In a real app, we would use a proper date formatting library
  // For now, we'll return a simple string
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

  if (diffHours < 1) {
    return "Just now";
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    // We can adjust if needed
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.gray900,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: typography.xs,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  notificationItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  notificationUnread: {
    backgroundColor: colors.primaryLight,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: typography.sm,
    textAlign: "center",
  },
  notificationDetails: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.gray900,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: typography.sm,
    color: colors.gray600,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: typography.xs,
    color: colors.gray400,
  },
  notificationDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
    marginLeft: 12,
    marginTop: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.gray500,
  },
  listFooter: {
    height: 80,
  },
});
