import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export default function GaugeCard({ percentage = 0, label = "Gauge" }) {
  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={200}
        width={15}
        fill={percentage}
        tintColor={percentage > 20 ? '#2ecc71' : '#e74c3c'}
        backgroundColor="#eee"
      >
        {() => (
          <Text style={styles.text}>
            {percentage}ml
          </Text>
        )}
      </AnimatedCircularProgress>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', margin: 20 },
  text: { fontSize: 35, fontWeight: 'bold', color: "rgba(238, 238, 238, 0.61)" },
  label: { marginTop: 10, fontSize: 18, color: '#7f8c8d' },
});
