import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from 'react-native-paper';
import { commonStyles } from "../styles/commonStyles";
import { color } from 'react-native-reanimated';

export default function CameraScreen({ route, navigation }) {
  const returnScreen = route.params.returnScreen;
  const { colors } = useTheme();

  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);

  const [location, setLocation] = useState(null);

  const cameraRef = useRef(null)

  async function showCamera() {
    const {status} = await Camera.requestPermissionsAsync();
    setHasPermission(status === 'granted');

    if (hasPermission === false) {
      Alert.alert("Error: No access to Camera given")
    }
  }

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getLastKnownPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {showCamera()}, []); 

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => {setCameraType(cameraType === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back);}}>
          <MaterialCommunityIcons name="autorenew" size={24} style={{ color: colors.primary, marginRight: 15 }} />
        </TouchableOpacity>
      ),
    });
  });

  async function takePicture() {
    const photo = await cameraRef.current.takePictureAsync({ exif: true });

    photo.exif.GPSProcessingMethod = "GPS";
    photo.exif.GPSLatitude = location.coords.latitude;
    photo.exif.GPSLongitude = location.coords.longitude;

    photo.exif.GPSLatitudeRef = location.coords.latitude > 0 ? "N" : "S";
    photo.exif.GPSLongitudeRef = location.coords.latitude > 0 ? "E" : "W";

    navigation.navigate({ name: returnScreen, params: { imageURI: photo.uri, exif: photo.exif }, merge: true, });
  }

  return (
    <View style={commonStyles.centeredContainer}>
      <Camera style={additionalStyles.camera} type={cameraType} ref={cameraRef} ratio={"1:1"} />    
      <View style={additionalStyles.innerView}>
        <View style={additionalStyles.buttonView}>
          <TouchableOpacity
            style={[additionalStyles.circleButton, {backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.placeholder}]}
            onPress={() => {takePicture()}}>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

  const additionalStyles = StyleSheet.create({
    camera: {
      width: "100%",
      aspectRatio: 1,
    },
    circle: {
      height: 50,
      width: 50,
      borderRadius: 50,
    },
    circleButton: {
      width: 70,
      height: 70,
      bottom: 0,
      borderRadius: 50,
    },
    buttonView: {
      alignSelf: 'center',
      flex: 1,
      alignItems: 'center'
    },
    innerView: {
      position: 'absolute',
      bottom: 0,
      flexDirection: 'row',
      padding: 20,
      justifyContent: 'space-between',

    }
  })
