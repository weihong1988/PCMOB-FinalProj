import React from 'react'
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";

export default function PhotoPickerWithError(props) {
  const styles = { ...commonStyles, ...(props.isDark ? darkStyles : lightStyles) };
  const borderColor = props.isDark ? "lightgray" : "black";

  return (
    <View style={additionalStyles.container}>
      <View style={[additionalStyles.container, {flexDirection:"row", marginBottom: 0}]}>
        <View style={{width: 200, height: 200, borderWidth: 3, borderColor: props.ErrorText ? "red" : borderColor, alignItems: 'center', justifyContent: 'center',}} >
          {props.imageData ? (
            <Image source={{ uri: 'data:image/jpeg;base64,' + props.imageData }} style={{ width: 190, height: 190 }} borderRadius={props.postPic ? 0 : 200} resizeMode="contain" />
          ) : (
            props.origImageURL ? (
              <Image source={{ uri: props.origImageURL }} style={{ width: 190, height: 190 }} borderRadius={props.postPic ? 0 : 200} resizeMode="contain" />
            ) : (
              <View style={{justifyContent: "center", alignItems: "center"}}>
                <MaterialCommunityIcons name={props.postPic ? "image" : "face"} size={72} color={borderColor} />
                <Text style={{color: borderColor, fontSize: 20}}>{props.postPic ? "Post Image" : "Profile Pic"}</Text>
              </View>
            )            
          )} 
        </View>
        <View style={{justifyContent: "space-between", height: 200}}>
          <TouchableOpacity style={additionalStyles.iconButton} onPress={props.LaunchCamera}>
              <MaterialCommunityIcons name="camera-plus" size={72} color={borderColor} />
          </TouchableOpacity>
          <TouchableOpacity style={additionalStyles.iconButton} onPress={props.LaunchGallery}>
            <MaterialCommunityIcons name="image-search" size={72} color={borderColor} />
          </TouchableOpacity>
        </View>
      </View>
      {props.ErrorText ? (<Text style={styles.errorText}>{props.ErrorText}</Text>) : (<View />)}     
    </View>
  )
}

const additionalStyles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  iconButton: {
    alignSelf: 'center',
    marginLeft: '10%',
    borderRadius: 10,
  },
});
