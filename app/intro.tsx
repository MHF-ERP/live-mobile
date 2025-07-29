import { Audio } from "expo-av";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

export default function IntroScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    "Tajawal-Bold": require("../assets/fonts/Tajawal-Bold.ttf"),
    "Tajawal-Regular": require("../assets/fonts/Tajawal-Regular.ttf"),
  });

  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnimSub = useRef(new Animated.Value(0)).current;

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function playSound() {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/intro.wav")
      );
      soundRef.current = sound;
      await sound.playAsync();
    }

    if (fontsLoaded && isMounted) {
      playSound();

      Animated.sequence([
        Animated.timing(fadeAnim1, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim2, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim3, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimSub, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          router.replace("/home");
        }, 1000);
      });
    }

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.Text
        style={{
          fontFamily: "Tajawal-Bold",
          color: "#FF3B3B",
          fontSize: 64,
          opacity: fadeAnim1,
        }}
      >
        حياتك
      </Animated.Text>

      <Animated.Text
        style={{
          fontFamily: "Tajawal-Regular",
          color: "#AAAAAA",
          fontSize: 40,
          opacity: fadeAnim2,
        }}
      >
        مش
      </Animated.Text>

      <Animated.Text
        style={{
          fontFamily: "Tajawal-Bold",
          color: "#FF3B3B",
          fontSize: 64,
          opacity: fadeAnim3,
        }}
      >
        حياتك
      </Animated.Text>

      <Animated.Text
        style={{
          marginTop: 30,
          fontFamily: "Tajawal-Regular",
          color: "#888888",
          fontSize: 18,
          opacity: fadeAnimSub,
        }}
      >
        لو سبتها تمشي لوحدها...
      </Animated.Text>
      <View
        style={{
          alignItems: "center",
          marginBottom: 0,
          position: "absolute",
          bottom: 20,
        }}
      >
        <Animated.View style={{ opacity: fadeAnimSub }}>
          <Text
            style={{
              fontFamily: "Tajawal-Regular",
              color: "#444",
              fontSize: 14,
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            from
          </Text>
          <Text
            style={{
              fontFamily: "Tajawal-Bold",
              color: "#444444",
              fontSize: 20,
              textAlign: "center",
            }}
          >
            SAILENTRA
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
