import { PUSH } from "@/static/endPoints";
import axios from "axios";
import * as Notifications from "expo-notifications";

export async function registerForPushNotificationsAsync() {
  let token;

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      alert("Failed to get push token for push notification!");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;

    await axios.post(
      PUSH,
      {
        token: token,
      },
      {
        headers: {
          accept: "*/*",
          Locale: "en",
          isLocalized: "false",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Expo Push Token:", token);

    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
