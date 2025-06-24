import React from "react";
import { View, Text, StyleSheet } from "react-native";

type TempCardProps = {
  title: string;
  value: number;
};

const TempCard: React.FC<TempCardProps> = ({ title, value }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: "rgba(238, 238, 238, 0.37)",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 8,
    alignItems: "center",
    width: 160
  },
  title: {
    fontSize: 18,
    color: "#333",
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
});

export default TempCard;
