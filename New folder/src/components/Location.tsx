import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ref, onValue } from 'firebase/database';
import db from '../DB/firebaseConfig';  // your firebase config

const Location = () => {
  const [location, setLocation] = useState({
    latitude: 6.9271,
    longitude: 79.8612,
  });

  useEffect(() => {
    const latRef = ref(db, '/current/lat');
    const lngRef = ref(db, '/current/lng');

    let latValue:any = null;
    let lngValue:any = null;

    const unsubscribeLat = onValue(latRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) {
        latValue = val;
        if (lngValue !== null) {
          setLocation({ latitude: latValue, longitude: lngValue });
        }
      }
    });

    const unsubscribeLng = onValue(lngRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) {
        lngValue = val;
        if (latValue !== null) {
          setLocation({ latitude: latValue, longitude: lngValue });
        }
      }
    });

    return () => {
      unsubscribeLat();
      unsubscribeLng();
    };
  }, []);

  // Check if coordinates are valid numbers
  const isValidCoord = (coord:any) => typeof coord === 'number' && !isNaN(coord);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={
          isValidCoord(location.latitude) && isValidCoord(location.longitude)
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }
      >
        <Marker
          coordinate={location}
          title="Current Location"
          description="Loaded from Firebase"
        />
      </MapView>
    </View>
  );
};

export default Location;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
