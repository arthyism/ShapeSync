import { useState, useRef, useEffect } from "react";
import { Text, View, StyleSheet, PanResponder, LayoutAnimation } from "react-native";
import { Calendar } from "react-native-calendars";
import { format } from 'date-fns';
import { Link } from "expo-router";

export default function BasicCalendar() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const currentMonthRef = useRef(currentMonth);

  // Keep ref updated with current value
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
  
  function handleDatePress(date: any) {
    setSelectedDate(date.dateString);
    // return (
    //   <Link href={"/"}>miimi</Link>
    // );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Text>Selected date: {selectedDate}</Text>
      <View style={styles.calender}>
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
            textDisabledColor: '#dd99ee',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffff',
  },
  calender: {
    marginTop: 40,
  },
});