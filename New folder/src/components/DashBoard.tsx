import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ImageBackground, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import TempCard from "./TempCard";
import GaugeCard from "./GaugeCard";
import { ref, onValue } from "firebase/database";
import db from "../DB/firebaseConfig";
import Last5DaysChart from "./Last5DaysChart";

const { height, width } = Dimensions.get('window');


const DashBoard = () => {
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [waterLevel, setWaterLevel] = useState(0);

  const last5DaysLabels: string[] = ["Jun 19", "Jun 20", "Jun 21", "Jun 22", "Jun 23"];
  const last5DaysData: number[] = [450, 470, 430, 480, 500];

  useEffect(() => {
    const tempRef = ref(db, '/current/temp');
    const humRef = ref(db, '/current/humidity');
    const weightRef = ref(db, '/current/real_weight');

    onValue(tempRef, snapshot => {
      const val = snapshot.val();
      if (val !== null) setTemperature(val);
    });

    onValue(humRef, snapshot => {
      const val = snapshot.val();
      if (val !== null) setHumidity(val);
    });

    onValue(weightRef, snapshot => {
      const val = snapshot.val();
      if (val !== null) {
        // Assume full bottle is 1000g
        const percentage = ((val / 1000) * 100).toFixed(1);
        setWaterLevel(Number(percentage));
      }
    });
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/bottlebg.png")}
      style={styles.background}
      resizeMode="cover"
      blurRadius={10}
    >
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.namecontainer}>
          <View style={styles.dp}></View>
          <View style={styles.namecopm}>
            <Text style={styles.namecontainer_name}>Hello Anjalika,</Text>
            <Text style={styles.namecontainer_greeting}>Good Morning</Text>
          </View>
        </View>

        <View style={styles.center_container}>
          <View style={styles.temp_and_hu}>
            <TempCard title="Temperature" value={temperature} />
            <TempCard title="Humidity" value={humidity} />
          </View>
          <View style={styles.waterLevel}>
            <GaugeCard percentage={waterLevel} label="Water Level" />
          </View>
          <View style={styles.chart}>
             <Last5DaysChart dataPoints={last5DaysData} labels={last5DaysLabels} />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(29, 28, 28, 0.7)",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff"
  },
 namecontainer: {
    marginTop: 60,
    // backgroundColor: "rgba(202, 7, 7, 0.7)",
    height: height * 0.12,
    width: width * 0.9,
    display: "flex",        
    flexDirection: "row",
    alignItems: "center"
  },
  dp: {
    height: 50,
    width: 50,
    backgroundColor: "#fff",
    borderRadius: 50,
    marginRight: 20
  },
  namecopm: {

  },
  namecontainer_name: {
    fontSize: 25,
    color: "#fff",
    fontWeight: "bold"
  },
  namecontainer_greeting: {
    fontSize: 18,
    color: "#fff",
  },
  center_container: {
    padding: 0,
    margin: 0,
    width: '100%',
    flex : 1
  },
  temp_and_hu: {
    display: "flex",
    flexDirection: "row",
    gap: 20,
    width: width * 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10
  },
  waterLevel: {
    padding : 20
  },
  chart: {
    justifyContent: "center",
    alignItems:"center",
    backgroundColor: "rgba(221, 221, 221, 0.52)",
    width: width * 0.9,
    height: 200,
    borderRadius: 25,
    marginLeft: width * 0.05
  }
});


export default DashBoard;
