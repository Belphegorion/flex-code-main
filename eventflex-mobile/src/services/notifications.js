import * as Notifications from "expo-notifications";
import { useAuth } from "../context/AuthContext";
import api from "./api";
import { useEffect, useState } from "react";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  try {
    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      alert("Permission for notifications was denied");
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Push token:", token);

    // Send token to backend
    // In a real app, we would get the user from context
    // For now, we'll just return the token
    return token;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
    return null;
  }
}

export async function handlePushNotification(notification) {
  // Handle incoming notifications
  // This would typically navigate to the relevant screen
  console.log("Received notification:", notification);

  // Example: if it's a job application update, navigate to applications screen
  // if (notification.data?.type === 'application_update') {
  //   navigation.navigate('Applications');
  // }
}

export function setupNotificationListener() {
  // Listen for incoming notifications
  const subscription = Notifications.addNotificationReceivedListener(
    handlePushNotification,
  );

  // Listen for notification responses (taps)
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener(
      handlePushNotification,
    );

  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
}

export default {
  registerForPushNotificationsAsync,
  handlePushNotification,
  setupNotificationListener,
};
