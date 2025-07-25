import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const [time, setTime] = useState(0); // секунди
  const [timerRunning, setTimerRunning] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const intervalRef = useRef(null);

  // Форматира време от секунди към mm:ss
  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Обработва избор на време в DateTimePicker
  const onTimeChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      const selectedMinutes = selectedDate.getMinutes();
      const selectedHours = selectedDate.getHours();
      const totalSeconds = selectedHours * 3600 + selectedMinutes * 60;
      setTime(totalSeconds);
    }
  };

  // Стартира или спира таймера
  const toggleTimer = () => {
    if (timerRunning) {
      clearInterval(intervalRef.current);
      setTimerRunning(false);
    } else {
      if (time === 0) {
        Alert.alert("Избери време за таймера!");
        return;
      }
      setTimerRunning(true);
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setTimerRunning(false);
            Alert.alert("Времето изтече!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Ресет на таймера
  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setTimerRunning(false);
    setTime(0);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={styles.container}
    >
      <Text style={styles.title}>Таймер</Text>

      <Pressable style={styles.timePickerButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.timePickerText}>Избери време: {formatTime(time)}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={new Date(0, 0, 0, 0, 0, 0)}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={onTimeChange}
        />
      )}

      <Text style={styles.timerDisplay}>{formatTime(time)}</Text>

      <View style={styles.buttonsRow}>
        <Pressable
          style={[styles.button, timerRunning && styles.buttonStop]}
          onPress={toggleTimer}
        >
          <Text style={styles.buttonText}>{timerRunning ? "Спри" : "Старт"}</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.buttonReset]} onPress={resetTimer}>
          <Text style={styles.buttonText}>Ресет</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    color: "white",
  },
  timePickerButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 20,
  },
  timePickerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: "bold",
    marginVertical: 40,
    color: "white",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonStop: {
    backgroundColor: "#d9534f",
  },
  buttonReset: {
    backgroundColor: "#f0ad4e",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
});
