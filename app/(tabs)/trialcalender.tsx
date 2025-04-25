import { useState, useRef, useEffect } from "react";
import {Text, View, StyleSheet, PanResponder, LayoutAnimation, Image, 
  Modal, Pressable, Alert, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system';

// Add directory constant from working code
const DIRECTORY = FileSystem.documentDirectory + 'gym-progress/';

export default function BasicCalendar() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const currentMonthRef = useRef(currentMonth);

  // Check directory existence like in working code
  const checkDirectory = async () => {
    const dirInfo = await FileSystem.getInfoAsync(DIRECTORY);
    return dirInfo.exists;
  };

  useEffect(() => {
    currentMonthRef.current = currentMonth;
  }, [currentMonth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, { dx }) => {
        if (Math.abs(dx) > 40) {
          const workingDate = new Date(currentMonthRef.current + '-01');

          LayoutAnimation.configureNext({
            duration: 200,
            create: { type: 'linear', property: 'opacity' },
            update: { type: 'spring', springDamping: 0.8 },
            delete: { type: 'linear', property: 'opacity' }
          });

          workingDate.setMonth(workingDate.getMonth() + (dx > 0 ? -1 : 1));
          const newMonth = format(workingDate, 'yyyy-MM');
          setCurrentMonth(newMonth);
        }
      },
    })
  ).current;

  const handleDatePress = async (date: { dateString: string }) => {
    try {
      setLoading(true);
      const directoryExists = await checkDirectory();

      if (!directoryExists) {
        Alert.alert("No progress found", "You haven't saved any progress yet");
        return;
      }

      const uri = `${DIRECTORY}${date.dateString}.jpg`; // Use directory constant
      const fileInfo = await FileSystem.getInfoAsync(uri);

      if (fileInfo.exists) {
        setPreviewUri(uri);
        setSelectedDate(date.dateString);
      } else {
        Alert.alert("No image found", "No progress image for this date");
        setPreviewUri(null);
      }
    } catch (error) {
      console.error("Error checking image:", error);
      Alert.alert("Error", "Failed to check for image");
      setPreviewUri(null);
    } finally {
      setLoading(false); // Add loading state management
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Text style={styles.selectedDateText}>Selected date: {selectedDate}</Text>

      {loading && <ActivityIndicator size="large" />}

      <View style={styles.calendarContainer}>
        <Calendar
          key={currentMonth}
          current={currentMonth}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#ad615c' }
          }}
          onDayPress={handleDatePress}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#00adf5',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16
          }}
        />
      </View>

      <Modal visible={!!previewUri} transparent={true}>
        <View style={styles.modalContainer}>
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              style={styles.previewImage}
              resizeMode="contain"
              onError={() => {
                setPreviewUri(null);
                Alert.alert("Error", "Failed to load image");
              }}
            />
          )}
          <Pressable
            style={styles.closeButton}
            onPress={() => setPreviewUri(null)}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

// Add loader style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedDateText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '95%',
    height: '85%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  closeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '200',
  },
});