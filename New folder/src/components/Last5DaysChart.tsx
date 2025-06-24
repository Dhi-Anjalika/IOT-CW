import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

interface Last5DaysChartProps {
  dataPoints: number[];  // <-- explicitly number array
  labels: string[];      // <-- explicitly string array
}

const Last5DaysChart: React.FC<Last5DaysChartProps> = ({ dataPoints, labels }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        data: dataPoints,
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View>
      <LineChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </View>
  );
};

export default Last5DaysChart;
