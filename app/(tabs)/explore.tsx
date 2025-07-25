
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

export default function ExploreScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [timerDuration, setTimerDuration] = useState(0); // в секунди
  const inputRef = useRef(null);
  const flatListRef = useRef(null);

  // Автоматично изтриваме съобщения, чиито таймер е изтекъл
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((msgs) =>
        msgs.filter((msg) => {
          if (msg.timerDuration > 0) {
            const expiry = new Date(msg.timestamp.getTime() + msg.timerDuration * 1000);
            return new Date() <= expiry;
          }
          return true;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onTimeChange = (event, date) => {
    setShowTimePicker(false);
    if (date) {
      setSelectedTime(date);
    }
  };

  const addMessage = () => {
    if (inputText.trim() === "") return;
    const newMsg = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date(),
      selectedTime: selectedTime,
      timerDuration: timerDuration,
    };
    setMessages((prev) => [newMsg, ...prev]);
    setInputText("");
    inputRef.current?.blur();

    // Скролваме към най-новото съобщение
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  };

  const clearAllMessages = () => {
    if (messages.length === 0) return;
    Alert.alert(
      "Изчистване на чат",
      "Сигурни ли сте, че искате да изчистите всички съобщения?",
      [
        { text: "Отказ", style: "cancel" },
        {
          text: "Да",
          onPress: () => setMessages([]),
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    // Ако има таймер и е минало времето - не показваме
    if (item.timerDuration > 0) {
      const expiry = new Date(item.timestamp.getTime() + item.timerDuration * 1000);
      if (new Date() > expiry) {
        return null;
      }
    }

    // Изчисляване колко време остава (ако има таймер)
    const remainingSeconds = item.timerDuration > 0
      ? Math.max(
          0,
          Math.floor((item.timestamp.getTime() + item.timerDuration * 1000 - new Date().getTime()) / 1000)
        )
      : null;

    return (
      <Animated.View
        entering={FadeIn.delay(index * 100)}
        exiting={FadeOut}
        layout={Layout.springify()}
        style={[styles.messageBox, index === 0 ? styles.latestMessage : null]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          Време на съобщението: {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
        <Text style={styles.timestamp}>
          Избрано време: {item.selectedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
        {item.timerDuration > 0 && (
          <Text style={styles.timestamp}>
            Таймер: {item.timerDuration} сек. | Остатък: {remainingSeconds} сек.
          </Text>
        )}
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Text style={styles.title}>Добре дошъл в екрана "Още"</Text>

            <FlatList
              ref={flatListRef}
              data={messages.filter(Boolean)}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              style={{ width: "100%", marginBottom: 10 }}
              inverted
              keyboardShouldPersistTaps="handled"
            />

            <Pressable style={styles.clearButton} onPress={clearAllMessages}>
              <Text style={styles.clearButtonText}>Изчисти чата</Text>
            </Pressable>

            <View style={styles.pickersRow}>
              <Pressable
                style={styles.timePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timePickerText}>
                  Избери време: {selectedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </Pressable>

              <Pressable
                style={styles.timerButton}
                onPress={() => {
                  // Превключване на таймера 0 -> 10 -> 30 -> 60 -> 0 сек
                  const next = timerDuration === 0 ? 10 : timerDuration === 10 ? 30 : timerDuration === 30 ? 60 : 0;
                  setTimerDuration(next);
                }}
              >
                <Text style={styles.timerText}>
                  Таймер: {timerDuration === 0 ? "Изключен" : `${timerDuration} сек.`}
                </Text>
              </Pressable>
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={onTimeChange}
              />
            )}

            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Напиши съобщение..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={addMessage}
                returnKeyType="send"
              />
              <Pressable style={styles.sendButton} onPress={addMessage}>
                <Text style={{ color: "white", fontWeight: "bold" }}>Изпрати</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    color: "white",
  },
  messageBox: {
    backgroundColor: "#007aff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: "80%",
    alignSelf: "flex-start",
  },
  latestMessage: {
    backgroundColor: "#34C759",
  },
  messageText: {
    color: "white",
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    textAlign: "right",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
  },
  clearButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "white",
    height: 40,
  },
  sendButton: {
    backgroundColor: "#007aff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    marginLeft: 10,
    height: 40,
  },
  pickersRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timePickerButton: {
    backgroundColor: "#5856D6",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  timePickerText: {
    color: "white",
    fontWeight: "600",
  },
  timerButton: {
    backgroundColor: "#FF9500",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  timerText: {
    color: "white",
    fontWeight: "600",
  },
});
