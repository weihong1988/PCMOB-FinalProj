import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Switch, Animated, TouchableWithoutFeedback, Image } from "react-native";
import { commonStyles } from "../styles/commonStyles";

import { Button } from 'react-native-paper';
import { Text, Title, Subheading, Paragraph, Headline, Caption } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';
import { changeModeAction } from '../redux/ducks/accountPref';

export default function AccountScreen({ navigation }) {
  const isDark = useSelector(state => state.account.isDark);
  const [isDarkMode, setIsDarkMode] = useState(isDark);

  const username = useSelector(state => state.account.username);
  const nickname = useSelector(state => state.account.nickname);
  const profilePic = useSelector(state => state.account.profilePicture);
  const createdAt = useSelector(state => state.account.createdAt);

  const dispatch = useDispatch();

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
    <View style={commonStyles.centeredContainer}>
      <Headline style={{marginTop: 20, marginBottom: 20}}> Hello {nickname}!</Headline>
      <View style={{width: 320, height: 320, alignItems: "center", justifyContent: "center"}}>
        {profilePic == "" ? (<View />) : (
          <TouchableOpacity onPress={changePicSize}>
            <Animated.Image source={{ uri: profilePic }} style={{width: picSize.interpolate(sizeInterpolation), height: picSize.interpolate(sizeInterpolation), borderRadius: 200, marginBottom: 20}} />
          </TouchableOpacity>
        )}
      </View>
      <View style={{alignItems: "flex-start", marginBottom: 40}}>
        <Title>Username: 
          <Subheading>{"  " + username}</Subheading>
        </Title>
        <Title>Member Since: 
          <Subheading>{"  " + createdAt}</Subheading>
        </Title>
      </View>
      
      <View style={{flexDirection: "row", alignItems: "center", marginBottom: 40}}>
        <Text style={[ {marginRight: 10}]}>Dark Mode?</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={changeMode}
          value={isDarkMode}
        />
      </View>

      <Button mode="contained" onPress={signOut}>Log out</Button>
    </View>
  );
}
