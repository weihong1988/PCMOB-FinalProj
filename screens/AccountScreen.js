import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, View, Switch, Animated, TouchableWithoutFeedback, Image } from "react-native";
import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";

import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';
import { changeModeAction } from '../redux/ducks/accountPref';

export default function AccountScreen({ navigation }) {
  const isDark = useSelector(state => state.account.isDark);

  const username = useSelector(state => state.account.username);
  const nickname = useSelector(state => state.account.nickname);
  const profilePic = useSelector(state => state.account.profilePicture);
  const createdAt = useSelector(state => state.account.createdAt);

  const dispatch = useDispatch();

  const [isDarkMode, setIsDarkMode] = useState(isDark);

  const styles = { ...commonStyles, ...(isDark ? darkStyles : lightStyles) };

  const picSize = new Animated.Value(0);
  const sizeInterpolation = {
    inputRange: [0, 0.5, 1],
    outputRange: [200, 300, 200]
  }

  function changePicSize() {
    Animated.loop(
        Animated.timing(picSize, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false
        }),
    ).start()
  }

  function changeMode() {
    setIsDarkMode(!isDarkMode);
    dispatch({...changeModeAction()})
  }

  function signOut() {
    dispatch({...logOutAction()})
    navigation.navigate("SignInSignUp");
  }

  return (
    <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
      <Text style={[styles.title, styles.text, {marginTop: 20, marginBottom: 20}]}> Hello {nickname}!</Text>
      <View style={{width: 320, height: 320, alignItems: "center", justifyContent: "center"}}>
        {profilePic == "" ? (<View />) : (
          <TouchableOpacity onPress={changePicSize}>
            <Animated.Image source={{ uri: profilePic }} style={{width: picSize.interpolate(sizeInterpolation), height: picSize.interpolate(sizeInterpolation), borderRadius: 200, marginBottom: 20}} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.text, {fontSize: 20, marginBottom: 20}]}>Username: {username}</Text>
      <Text style={[styles.text, {marginBottom: 20}]}>Member Since: {createdAt}</Text>
      <View style={{flexDirection: "row", marginTop: 20, alignItems: "center", marginBottom: 30}}>
        <Text style={[styles.text, {marginRight: 10}]}>Dark Mode?</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={changeMode}
          value={isDarkMode}
        />
      </View>

      <TouchableOpacity onPress={signOut} style={styles.button}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
