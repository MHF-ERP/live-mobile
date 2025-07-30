import { DAY, SITUATIONS } from "@/static/endPoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function SituationsScreen() {
  const [answered, setAnswered] = useState<number[]>([]);
  const [situation, setSituation] = useState<any[]>([]);
  const [day, setDay] = useState<{ id?: number; title?: string } | null>(null);
  const [firstOpen, setFirstOpen] = useState<boolean | null>(null);
  const [isFirstOpenToday, setIsFirstOpenToday] = useState<boolean | null>(
    null
  );

  const router = useRouter();
  useEffect(() => {
    const clearAllData = async () => {
      try {
        await AsyncStorage.clear();
        console.log("All AsyncStorage data cleared");
      } catch (e) {
        console.error("Failed to clear AsyncStorage", e);
      }
    };
    clearAllData();
  }, []);
  useEffect(() => {
    const checkLastOpen = async () => {
      const lastOpen = await AsyncStorage.getItem("opened");
      if (lastOpen) {
        setFirstOpen(false);
      }
    };
    checkLastOpen();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [answersData, dayData] = await Promise.all([
          AsyncStorage.getItem("answeredSituations"),
          getDay(),
        ]);
        console.log("Fetched day data:", answersData);
        if (answersData) setAnswered(JSON.parse(answersData));
        if (dayData?.data) setDay(dayData.data);
      } catch (error) {
        console.error("Error fetching day or answers", error);
      }
    };
    //
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!day?.id) return;

      try {
        const situationData = await getSituations();
        if (situationData?.data) {
          setSituation(situationData.data);
        }

        const lastOpen = await AsyncStorage.getItem("lastOpenDate");
        const today = new Date().toISOString().split("T")[0];

        if (lastOpen !== today) {
          await AsyncStorage.setItem("lastOpenDate", today);
          setIsFirstOpenToday(true);
        } else {
          setIsFirstOpenToday(false);
        }
      } catch (error) {
        console.error("Error fetching situations", error);
      } finally {
      }
    };

    if (day?.id) {
      fetchData();
    }
  }, [day]);

  const handlePress = (id: number) => {
    if (answered.includes(id)) return;
    router.push(`/situation/${id}`);
  };

  const renderItem = ({ item }: { item: { id: number; title: string } }) => {
    console.log("Rendering item:", item);
    console.log("Answered situations:", answered);
    const isAnswered = answered.includes(item.id);
    return (
      <Animated.View entering={FadeIn}>
        <TouchableOpacity
          style={[
            styles.card,
            isAnswered ? styles.cardAnswered : styles.cardNew,
          ]}
          onPress={() => handlePress(item.id)}
          activeOpacity={isAnswered ? 1 : 0.8}
        >
          <View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {isAnswered && <Text style={styles.checkMark}>✅</Text>}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (firstOpen || firstOpen === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={styles.notFirstTimeContainer} entering={FadeIn}>
          <Text style={styles.notFirstTimeTitle}>جاهز تعيش حد تاني؟</Text>
          <Text style={styles.notFirstTimeDescription}>
            شوف مواقف ناس تانية وتعلم منها، جرب كل يوم تجربة مختلفة.
          </Text>
          <TouchableOpacity
            style={styles.option}
            onPress={async () => {
              setFirstOpen(false);
              await AsyncStorage.setItem("opened", "true");
            }}
          >
            <Text style={styles.optionText}>ابدأ الان</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (!day) {
    return (
      firstOpen === null || (
        <SafeAreaView style={styles.container}>
          <Animated.View style={styles.notFirstTimeContainer} entering={FadeIn}>
            <Text style={styles.notFirstTimeTitle}>خليك جاهز</Text>
            <Text style={styles.notFirstTimeDescription}>
              جاري تحضير قصة اليوم، نشوفك بعد قليل.
            </Text>
          </Animated.View>
        </SafeAreaView>
      )
    );
  }

  if (isFirstOpenToday || (situation && situation.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={styles.notFirstTimeContainer} entering={FadeIn}>
          <Text style={styles.notFirstTimeTitle}>حياة انهاردة</Text>
          <Text style={styles.notFirstTimeDescription}>{day?.title}</Text>
          <Text style={styles.notFirstTimeDescription2}>
            خليك متابع عشان نشوف هتعمل ايه في المواقف
          </Text>
          {situation && situation.length > 0 && (
            <TouchableOpacity
              style={styles.option}
              onPress={async () => {
                const today = new Date().toISOString().split("T")[0];
                setIsFirstOpenToday(false);
                await AsyncStorage.setItem("lastOpenDate", today);
              }}
            >
              <Text style={styles.optionText}>ابدأ الان</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={situation}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  option: {
    backgroundColor: "#FF3B3B",
    padding: 16,
    width: "100%",
    borderRadius: 10,
    marginTop: 16,
  },
  optionText: {
    color: "#FFF",
    fontFamily: "Tajawal-Bold",
    textAlign: "center",
    fontSize: 16,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardNew: {
    backgroundColor: "#FF3B3B",
  },
  cardAnswered: {
    backgroundColor: "#555",
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    textAlign: "center",
  },
  checkMark: {
    fontSize: 24,
    marginTop: 8,
    textAlign: "center",
  },
  notFirstTimeContainer: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  notFirstTimeDescription2: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  notFirstTimeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF3B3B",
    marginBottom: 12,
  },
  notFirstTimeDescription: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});

// API requests
async function getSituations() {
  const response = await axios.get(SITUATIONS, {
    headers: { locale: "en", isLocalized: "false" },
  });
  return response.data;
}

async function getDay() {
  const response = await axios.get(DAY, {
    headers: { locale: "en", isLocalized: "false" },
  });
  return response.data;
}
