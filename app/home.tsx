import { DAY, SITUATIONS } from "@/static/endPoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// تعريف الأنواع
interface Situation {
  id: number;
  title: string;
  question?: string;
}

interface Day {
  id: number;
  title: string;
  status: "ACTIVE" | "FINISH";
}

interface UserAnswer {
  situationId: number;
  situationTitle: string;
  answer: string;
  answeredAt: string;
}

export default function SituationsScreen() {
  const [answered, setAnswered] = useState<number[]>([]);
  const [situation, setSituation] = useState<Situation[]>([]);
  const [day, setDay] = useState<Day | null>(null);
  const [firstOpen, setFirstOpen] = useState<boolean | null>(null);
  const [isFirstOpenToday, setIsFirstOpenToday] = useState<boolean | null>(
    null
  );
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  // باقي الكود كما هو...
  useEffect(() => {
    const clearAllData = async () => {
      try {
        console.log("AsyncStorage data management");
      } catch (e) {
        console.error("Failed to manage AsyncStorage", e);
      }
    };
    clearAllData();
  }, []);

  useEffect(() => {
    const checkFirstOpen = async () => {
      try {
        const lastOpen = await AsyncStorage.getItem("opened");
        setFirstOpen(!lastOpen);
      } catch (error) {
        console.error("Error checking first open:", error);
        setFirstOpen(true);
      }
    };
    checkFirstOpen();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [answersData, dayData, userAnswersData] = await Promise.all([
          AsyncStorage.getItem("answeredSituations"),
          getDay(),
          AsyncStorage.getItem("userAnswers"),
        ]);

        if (answersData) {
          setAnswered(JSON.parse(answersData));
        }

        if (dayData?.data) {
          setDay(dayData.data);
        }

        if (userAnswersData) {
          setUserAnswers(JSON.parse(userAnswersData));
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (firstOpen !== null) {
      fetchInitialData();
    }
  }, [firstOpen]);

  useEffect(() => {
    const fetchSituations = async () => {
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
        console.error("Error fetching situations:", error);
      }
    };

    if (day?.id) {
      fetchSituations();
    }
  }, [day]);

  const handlePress = (id: number) => {
    if (day?.status === "FINISH") return;
    if (answered.includes(id)) return;
    router.push(`/situation/${id}`);
  };

  const shareToSocialMedia = async (platform: string) => {
    try {
      const shareText = generateShareText();

      switch (platform) {
        case "general":
          await Share.share({
            message: shareText,
            title: "إجاباتي على مواقف اليوم",
          });
          break;
        case "whatsapp":
          const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
            shareText
          )}`;
          await Linking.openURL(whatsappUrl);
          break;
        case "facebook":
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            "https://yourapp.com"
          )}&quote=${encodeURIComponent(shareText)}`;
          await Linking.openURL(facebookUrl);
          break;
        case "instagram":
          await Share.share({
            message: shareText,
            title: "إجاباتي على مواقف اليوم",
          });
          break;
        case "snapchat":
          const snapchatUrl = `https://www.snapchat.com/add?text=${encodeURIComponent(
            shareText
          )}`;
          await Linking.openURL(snapchatUrl);
          break;
        case "threads":
          const threadsUrl = `https://threads.net/intent/post?text=${encodeURIComponent(
            shareText
          )}`;
          await Linking.openURL(threadsUrl);
          break;
        case "tiktok":
          await Share.share({
            message: shareText,
            title: "إجاباتي على مواقف اليوم",
          });
          break;
        default:
          await Share.share({
            message: shareText,
            title: "إجاباتي على مواقف اليوم",
          });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء المشاركة");
    }
  };

  const generateShareText = () => {
    const dayTitle = day?.title || "يوم جديد";
    let shareText = `🌟 إجاباتي على مواقف "${dayTitle}" 🌟\n\n`;

    userAnswers.forEach((answer, index) => {
      shareText += `${index + 1}. ${answer.situationTitle}\n`;
      shareText += `💭 إجابتي: ${answer.answer}\n\n`;
    });

    shareText += `🎯 شاركت في ${userAnswers.length} موقف اليوم\n`;
    shareText += `📱 جرب التطبيق بنفسك وشوف هتعمل إيه في المواقف دي!`;

    return shareText;
  };

  const showShareOptions = () => {
    Alert.alert(
      "مشاركة إجاباتك",
      "اختار المنصة اللي عايز تشارك عليها",
      [
        { text: "WhatsApp", onPress: () => shareToSocialMedia("whatsapp") },
        { text: "Facebook", onPress: () => shareToSocialMedia("facebook") },
        { text: "Instagram", onPress: () => shareToSocialMedia("instagram") },
        { text: "Snapchat", onPress: () => shareToSocialMedia("snapchat") },
        { text: "Threads", onPress: () => shareToSocialMedia("threads") },
        { text: "TikTok", onPress: () => shareToSocialMedia("tiktok") },
        { text: "عام", onPress: () => shareToSocialMedia("general") },
        { text: "إلغاء", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const renderFinishedItem = ({ item }: { item: UserAnswer }) => (
    <Animated.View entering={FadeIn} style={styles.finishedCard}>
      <Text style={styles.finishedCardTitle}>{item.situationTitle}</Text>
      <View style={styles.answerContainer}>
        <Text style={styles.answerLabel}>إجابتك:</Text>
        <Text style={styles.answerText}>{item.answer}</Text>
      </View>
      <Text style={styles.answeredTime}>
        تم الإجابة: {new Date(item.answeredAt).toLocaleString("ar-EG")}
      </Text>
    </Animated.View>
  );

  const renderActiveItem = ({ item }: { item: Situation }) => {
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

  // تحديد الستايل الديناميكي للكنتينر
  const containerStyle = [
    styles.container,
    {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  ];

  // شاشة التحميل
  if (loading || firstOpen === null) {
    return (
      <View style={containerStyle}>
        <StatusBar barStyle="light-content" backgroundColor="#111" />
        <Animated.View style={styles.notFirstTimeContainer} entering={FadeIn}>
          <Text style={styles.notFirstTimeTitle}>جاري التحميل...</Text>
          <Text style={styles.notFirstTimeDescription}>انتظر قليلاً</Text>
        </Animated.View>
      </View>
    );
  }

  // شاشة أول فتح
  if (firstOpen) {
    return (
      <View style={containerStyle}>
        <StatusBar barStyle="light-content" backgroundColor="#111" />
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
      </View>
    );
  }

  // لو مفيش يوم
  if (!day) {
    return (
      <View style={containerStyle}>
        <StatusBar barStyle="light-content" backgroundColor="#111" />
        <Animated.View style={styles.notFirstTimeContainer} entering={FadeIn}>
          <Text style={styles.notFirstTimeTitle}>خليك جاهز</Text>
          <Text style={styles.notFirstTimeDescription}>
            جاري تحضير قصة اليوم، نشوفك بعد قليل.
          </Text>
        </Animated.View>
      </View>
    );
  }

  // لو اليوم خلص وعنده إجابات
  if (day.status === "FINISH" && userAnswers.length > 0) {
    return (
      <View style={containerStyle}>
        <StatusBar barStyle="light-content" backgroundColor="#111" />
        <View style={styles.finishedHeader}>
          <Text style={styles.finishedTitle}>🎉 خلصت مواقف اليوم!</Text>
          <Text style={styles.finishedSubtitle}>{day.title}</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={showShareOptions}
          >
            <Text style={styles.shareButtonText}>📤 شارك إجاباتك</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={userAnswers}
          keyExtractor={(item) => item.situationId.toString()}
          renderItem={renderFinishedItem}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 20, 100) },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  // أول فتح اليوم
  if (isFirstOpenToday || (situation && situation.length === 0)) {
    return (
      <View style={containerStyle}>
        <StatusBar barStyle="light-content" backgroundColor="#111" />
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
      </View>
    );
  }

  // الشاشة الرئيسية للمواقف النشطة
  return (
    <View style={containerStyle}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <FlatList
        data={situation}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderActiveItem}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 20, 100) },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    marginTop: 8,
  },
  notFirstTimeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF3B3B",
    marginBottom: 12,
    textAlign: "center",
  },
  notFirstTimeDescription: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  finishedHeader: {
    padding: 24,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  finishedTitle: {
    fontSize: 24,
    fontFamily: "Tajawal-Bold",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 8,
  },
  finishedSubtitle: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shareButtonText: {
    color: "#fff",
    fontFamily: "Tajawal-Bold",
    fontSize: 16,
  },
  finishedCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  finishedCardTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    marginBottom: 12,
  },
  answerContainer: {
    backgroundColor: "#2a2a2a",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  answerLabel: {
    color: "#4CAF50",
    fontSize: 14,
    fontFamily: "Tajawal-Bold",
    marginBottom: 8,
  },
  answerText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
  },
  answeredTime: {
    color: "#999",
    fontSize: 12,
    textAlign: "left",
  },
});

// API requests
async function getSituations() {
  try {
    const response = await axios.get(SITUATIONS, {
      headers: { locale: "en", isLocalized: "false" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching situations:", error);
    throw error;
  }
}

async function getDay() {
  try {
    const response = await axios.get(DAY, {
      headers: { locale: "en", isLocalized: "false" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching day:", error);
    throw error;
  }
}
