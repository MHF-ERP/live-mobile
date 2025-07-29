import { DAY, SITUATION } from "@/static/endPoints";
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

export default function SituationsScreen() {
  const [answered, setAnswered] = useState<number[]>([]);
  const [situation, setSituation] = useState<any[]>([]);
  const [day, setDay] = useState<{ id?: number } | null>(null);
  const [isFirstOpenToday, setIsFirstOpenToday] = useState<boolean | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const fetchAnswers = async () => {
      const data = await AsyncStorage.getItem("answeredSituations");
      if (data) {
        setAnswered(JSON.parse(data));
      }
    };

    const fetchDay = async () => {
      const dayData = await getDay();
      setDay(dayData.data);
    };

    fetchDay();
    fetchAnswers();
  }, []);

  useEffect(() => {
    const fetchSituation = async () => {
      if (!day?.id) return;
      const situationData = await getSituation(day.id);
      setSituation(situationData);
    };

    const checkFirstOpenToday = async () => {
      const lastOpen = await AsyncStorage.getItem("lastOpenDate");
      const today = new Date().toISOString().split("T")[0];

      if (lastOpen !== today && day) {
        await AsyncStorage.setItem("lastOpenDate", today);
        setIsFirstOpenToday(true);
      } else {
        console.log("فتح التطبيق مجددًا في نفس اليوم 📅");
        setIsFirstOpenToday(false);
      }
    };

    const runAll = async () => {
      await fetchSituation();
      await checkFirstOpenToday();
    };

    if (day?.id) {
      runAll();
    }
  }, [day]);

  const handlePress = (id: number) => {
    if (answered.includes(id)) return;
    router.push(`/situation/${id}`);
  };

  const renderItem = ({ item }: { item: { id: number; title: string } }) => {
    const isAnswered = answered.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.card, isAnswered ? styles.cardAnswered : styles.cardNew]}
        onPress={() => handlePress(item.id)}
        activeOpacity={isAnswered ? 1 : 0.8}
      >
        <View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {isAnswered && <Text style={styles.checkMark}>✅</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isFirstOpenToday === false ? (
        <View style={styles.notFirstTimeContainer}>
          <Text style={styles.notFirstTimeTitle}>جاهز تعيش حد تاني؟</Text>
          <Text style={styles.notFirstTimeDescription}>
            شوف مواقف ناس تانية وتعلم منها، جرب كل يوم تجربة مختلفة.
          </Text>
        </View>
      ) : (
        <FlatList
          data={situation}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FF3B3B",
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
  notFirstTimeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  notFirstTimeDescription: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
});

async function getSituation(id: number) {
  const response = await axios.get(SITUATION + "/" + id, {
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
