// app/situation/[id].tsx
import { SITUATION } from "@/static/endPoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function SituationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [answered, setAnswered] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [situation, setSituation] = useState<any>();

  useEffect(() => {
    const fetch = async () => {
      const data = await AsyncStorage.getItem("answeredSituations");
      if (data) {
        setAnswered(JSON.parse(data));
      }
      const fetchSituation = async () => {
        const situationData = await getSituation(+id); // Fetching a specific situation, e.g., with ID 1
        setSituation(situationData.data);
      };
      setLoading(false);
      fetchSituation();
    };
    fetch();
  }, []);
  //
  const handleAnswer = async () => {
    if (!answered.includes(+id)) {
      const updated = [...answered, +id];
      await AsyncStorage.setItem("answeredSituations", JSON.stringify(updated));
      const data = await AsyncStorage.getItem("answeredSituations");
      console.log("Updated answered situations:", data);
    }
    router.replace("/home");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3B3B" />
      </View>
    );
  }
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3B3B" />
      </View>
    );
  }
  //
  return (
    <SafeAreaProvider style={styles.container}>
      <Text style={styles.title}>موقف رقم {id}</Text>
      <Text style={styles.description}>{situation?.title}</Text>
      {situation?.SituationOptions &&
        situation?.SituationOptions.length > 0 &&
        situation?.SituationOptions.map((choice: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={handleAnswer}
          >
            <Text style={styles.optionText}>{choice?.title}</Text>
          </TouchableOpacity>
        ))}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  title: {
    fontSize: 26,
    color: "#FF3B3B",
    fontFamily: "Tajawal-Bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#FFF",
    fontFamily: "Tajawal-Regular",
    marginBottom: 30,
  },
  option: {
    backgroundColor: "#FF3B3B",
    padding: 16,
    width: "100%",
    borderRadius: 10,
    marginBottom: 16,
  },
  optionText: {
    color: "#FFF",
    fontFamily: "Tajawal-Bold",
    textAlign: "center",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});

async function getSituation(id: number) {
  const response = await axios.get(SITUATION + "/" + id, {
    headers: { locale: "en", isLocalized: "false" },
  });
  return response.data;
}
