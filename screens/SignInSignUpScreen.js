import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, UIManager, LayoutAnimation, ActivityIndicator, Keyboard, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { API, API_LOGIN, API_SIGNUP, API_WHOAMI, API_IMAGE_URL } from '../constants/API';
import axios from 'axios';

import TextInputWithError from "../components/TextInputWithError";
import PhotoPickerWithError from "../components/PhotoPickerWithError";

import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";
import { useDispatch, useSelector } from 'react-redux';

import { logInAction, logOutAction } from '../redux/ducks/blogAuth';
import { uploadUserIDAction, uploadUsernameAction, uploadNicknameAction, uploadProfilePicAction, uploadCreatedAtAction } from '../redux/ducks/accountPref';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
} //Needs to be manually enabled for android

export default function SignInSignUpScreen({ route, navigation }) {
  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...(isDark ? darkStyles : lightStyles) };

  const [isLogIn, setIsLogIn] = useState(true);

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = React.useState("");

  const [imageData, setImageData] = useState(null);
  const [ProfilePicError, setProfilePicError] = React.useState("");
 
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState("")

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
    })();
  }, []);

  async function ResizeAndSetImage(imageURI, doRotate)
  {
    const FormattedImage = await ImageManipulator.manipulateAsync(
      imageURI,
      [{resize: { width: 1000 }}, { rotate: doRotate ? 90 : 0 }],
      {compress: 0.9, base64: true}
    );

    setImageData(FormattedImage.base64);
  }

  const LaunchGallery = async () => {
    var galleryResponse = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (galleryResponse.cancelled) {
      return;
    }

    await ResizeAndSetImage(galleryResponse.localUri || galleryResponse.uri, false);
  };

  function LaunchCamera() {
    navigation.navigate("Camera", {returnScreen: "SignInSignUp"});
  }

  React.useEffect(() => {
    if (route.params?.imageURI) {
      ResizeAndSetImage(route.params.imageURI, true);
    }
  }, [route.params?.imageURI]);

  function switchSignInSignUp() {
    LayoutAnimation.configureNext({
      duration: 1200,
      create: { type: 'linear', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.3 }
    });

    setIsLogIn(!isLogIn);
  }

  async function getLoggedInUser(token) {
    try {
      setLoading(true);

      const response = await axios.get(API + API_WHOAMI, {
        headers: { Authorization: `JWT ${token}` },
      });

      dispatch({...uploadUserIDAction(), payload: response.data.user_id})
      dispatch({...uploadUsernameAction(), payload: response.data.username})
      dispatch({...uploadNicknameAction(), payload: response.data.nickname})
      dispatch({...uploadProfilePicAction(), payload: API_IMAGE_URL + response.data.profilePic})
      dispatch({...uploadCreatedAtAction(), payload: new Date(response.data.createdAt * 1000).toDateString()})

      setLoading(false);
    } 
    catch (error) {
      setLoading(false);

      if (error.response)
        console.log(error.response.data);

      dispatch({...logOutAction()})
      navigation.navigate("SignInSignUp")
    }
  }

  async function DoSignUp() {
    var ErrorFound = false;
    Keyboard.dismiss();

    if (username == "") {
      setUsernameError("Username cannot be blank");
      ErrorFound = true;
    }
    else
      setUsernameError("");

    if (password == "") {
      setPasswordError("Password cannot be blank");
      ErrorFound = true;
    }
    else
      setPasswordError("");

    if (password != confirmPassword) {
      setConfirmPasswordError("The passwords do not match");
      ErrorFound = true;
    }
    else
      setConfirmPasswordError("");

    if (nickname == "") {
      setNicknameError("Nickname cannot be blank");
      ErrorFound = true;
    }
    else
      setNicknameError("");

    if (imageData == null) {
      setProfilePicError("Profile Pic cannot be blank");
      ErrorFound = true;
    }
    else
    setProfilePicError("");

    if (!ErrorFound) {
      try {
        setLoading(true);
        setErrorText("");

        const response = await axios.post(API + API_SIGNUP, {
          username,
          password,
          nickname,
          imageData,
        });
        if (response.data.Error) {
          // We have an error message for if the user already exists
          setErrorText(response.data.Error);
          setLoading(false);
        } 
        else {
          setLoading(false);

          setConfirmPassword("");
          setNickname("");
          setImageData(null);

          DoLogIn();
        }
      }
      catch (error) {
        setLoading(false);
        console.log("Error signing up!");
        console.log(error.response);
        setErrorText(error.response.data.description);
      }
    }
  }

  async function DoLogIn() {
    var ErrorFound = false;
    Keyboard.dismiss();

    if (username == "") {
      setUsernameError("Username cannot be blank");
      ErrorFound = true;
    }
    else
      setUsernameError("");

    if (password == "") {
      setPasswordError("Password cannot be blank");
      ErrorFound = true;
    }
    else
      setPasswordError("");

    if (!ErrorFound) {
      try {
        setLoading(true);
        setErrorText("");

        const response = await axios.post(API + API_LOGIN, {
          username,
          password,
        });

        dispatch({...logInAction(), payload: response.data.access_token})
        setLoading(false);

        setUsername("");
        setPassword("");

        getLoggedInUser(response.data.access_token);

        navigation.navigate("LoggedInStack");
      }
      catch (error) {
        setLoading(false);

        if (error.response.status = 404) {
          setErrorText("User does not exist")
        }
        else {
          console.log("Error logging in!");
          console.log(error);
          setErrorText(error.response.data.description);
        }
      }
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[styles.headerTitle, additionalStyles.title]}>{isLogIn ? "Log In" : "Sign Up"}</Text>

        <TextInputWithError width="70%" center={true} isDark={isDark} placeholder="Username" secureTextEntry={false} autoCapitalize={false} value={username} setData={setUsername} ErrorText={usernameError}/>
        <TextInputWithError width="70%" center={true} isDark={isDark} placeholder="Password" secureTextEntry={true} autoCapitalize={false} value={password} setData={setPassword} ErrorText={passwordError}/>
      
        {isLogIn ? (<View />) : (
          <View style={{width: "100%", alignItems: 'center'}}>
            <TextInputWithError width="70%" center={true} isDark={isDark} placeholder="Confirm Password" secureTextEntry={true} autoCapitalize={false} value={confirmPassword} setData={setConfirmPassword} ErrorText={confirmPasswordError}/>
            <TextInputWithError width="70%" center={true} isDark={isDark} placeholder="Display Name" secureTextEntry={false} autoCapitalize={true} value={nickname} setData={setNickname} ErrorText={nicknameError}/>
            <PhotoPickerWithError postPic={false} isDark={isDark} imageData={imageData} LaunchGallery={LaunchGallery} LaunchCamera={LaunchCamera} ErrorText={ProfilePicError} />
          </View>
                    
        )}
        <View style={{flexDirection: "row", justifyContent: 'center'}}>
          <TouchableOpacity style={styles.button} onPress={isLogIn ? DoLogIn : DoSignUp}>
            <Text style={styles.buttonText}>{isLogIn ? "Log In" : "Sign Up"}</Text>
          </TouchableOpacity>
          {loading ? <ActivityIndicator style={{ marginLeft: 10 }} size="large" color="#0000ff"/> : <View/>}
        </View>

        <TouchableOpacity onPress={switchSignInSignUp}>
          <Text style={additionalStyles.switchText}>{isLogIn ? "No account? Sign up now" : "Already have an account? Log in here."}</Text>
        </TouchableOpacity>

        <Text style={styles.errorText}>{errorText}</Text>
      </ScrollView>
    </View>
  );
}

const additionalStyles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    fontSize: 40, 
    margin: 20
  },
  switchText: {
    fontWeight: '400',
    fontSize: 20, 
    marginTop: 20,
    color: "blue"
  },
});
