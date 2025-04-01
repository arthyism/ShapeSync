import { Calendar, toDateId } from "@marceloterreiro/flash-calendar";
import { useState, useRef, useEffect } from "react";
import { Text, View, StyleSheet, PanResponder,LayoutAnimation } from "react-native";

const today = toDateId(new Date());

export default function BasicCalendar() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonthId, setCurrentMonthId] = useState(today);
  const currentMonthIdRef = useRef(currentMonthId); // Add this ref

  // Keep ref updated with current value
  useEffect(() => {
    currentMonthIdRef.current = currentMonthId;
  }, [currentMonthId]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, { dx }) => {
        if (Math.abs(dx) > 40) {
          // Use ref instead of state directly
          const workingDate = new Date(currentMonthIdRef.current);
          if(dx>0){
            console.log("left")
          }else{
            console.log("right")
          }
          LayoutAnimation.configureNext({
            duration: 200,
            create: { type: 'linear', property: 'opacity' },
            update: { type: 'spring', springDamping: 0.8 },
            delete: { type: 'linear', property: 'opacity' }
          });
          workingDate.setMonth(
            workingDate.getMonth() + (dx > 0 ? -1 : 1)
          );
          
          setCurrentMonthId(toDateId(workingDate));
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Text>Selected date: {selectedDate}</Text>
      <Calendar
      calendarColorScheme="dark"
        key={currentMonthId}
        calendarActiveDateRanges={[
          { startId: selectedDate, endId: selectedDate }
        ]}
        calendarMonthId={currentMonthId}
        onCalendarDayPress={setSelectedDate}
      />
    </View>
  );
}
// Keep your existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ad615c',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  }
});