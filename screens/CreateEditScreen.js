import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, ScrollView, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Chip } from 'react-native-paper';

import {GOOGLEAPI_URL, GOOGLEAPI_KEY} from "../secrets/keys";
import { API, API_CREATE, API_ONEPOST, API_IMAGE_URL } from "../constants/API";
import axios from 'axios';

import TextInputWithError from "../components/TextInputWithError";
import PhotoPickerWithError from "../components/PhotoPickerWithError";

import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";
import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';

export default function CreateEditScreen({ route, navigation }) {
  const token = useSelector(state => state.auth.token);

  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...isDark ? darkStyles : lightStyles };

  const postID = route.params.post_id;

  const nickname = useSelector(state => state.account.nickname);
  const profilePic = useSelector(state => state.account.profilePicture);

  const [origImageURL, setOrigImageURL] = useState("");

  const [Title, setTitle] = useState("");
  const [TitleError, setTitleError] = React.useState("");

  const [imageData, setImageData] = useState(null);
  const [imageDataError, setImageDataError] = React.useState("");

  const [Description, setDescription] = useState("");

  const [ExifData, setExifData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [GoogleImageTags, setGoogleImageTags] = useState(null);
  const [isGoogleUpload, setIsGoogleUpload] = useState(false);
  const [isGoogleDone, setIsGoogleDone] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
    })();
  }, []);

  useEffect(() => {
    const removeListener = navigation.addListener("focus", () => {
      if (postID)
        getOnePost(postID);
    });

    if (postID)
      getOnePost(postID);

    return removeListener;
  }, [])

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
      exif: true,
    });

    if (galleryResponse.cancelled) {
      return;
    }

    await ResizeAndSetImage(galleryResponse.localUri || galleryResponse.uri, false);

    setExifData(galleryResponse.exif);
  };

  function LaunchCamera() {
    navigation.navigate("Camera", {returnScreen: "CreateEdit"});
  }

  React.useEffect(() => {
    if (route.params?.imageURI) {
      ResizeAndSetImage(route.params.imageURI, true);
    }
  }, [route.params?.imageURI]);

  React.useEffect(() => {
    if (route.params?.exif) {
      setExifData(route.params.exif)
    }
  }, [route.params?.exif]);

  async function getOnePost(id) {
    setIsLoading(true);

    try {
      const response = await axios.get(API + API_ONEPOST + "/" + id, {
        headers: { Authorization: `JWT ${token}` },
      })

      setTitle(response.data.title);
      setDescription(response.data.description);
      setOrigImageURL(API_IMAGE_URL + response.data.image);

      setIsLoading(false);
    } 
    catch (error) {
      setIsLoading(false);
      console.log(error);

      if (error.response.data.error = "Invalid token") {
        dispatch({...logOutAction()})
        navigation.navigate("SignInSignUp");
      }
    }
  }

  async function submitPost() {
    var ErrorFound = false;
    Keyboard.dismiss();

    if (Title == "") {
      setTitleError("Title cannot be blank");
      ErrorFound = true;
    }
    else
      setTitleError("");

    if (imageData == null) {
      setImageDataError("Post Image cannot be blank");
      ErrorFound = true;
    }
    else
      setImageDataError("");

    if (!ErrorFound) {
      setIsLoading(true);

      try {
        var response = await axios.post(API + API_CREATE, {
          Title,
          imageData,
          Description,
          ExifData,
          GoogleImageTags,
        }, 
        {
          headers: { Authorization: `JWT ${token}` },
        });

        setIsLoading(false);
        navigation.navigate('Index');
      }
      catch (error) {
        setIsLoading(false);
        console.log(error);

        if (error.response.data.error = "Invalid token") {
          dispatch({...logOutAction()})
          navigation.navigate("SignInSignUp");
        }
      }
    }
  }

  async function deletePost(id) {
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const response = await axios.delete(API + API_ONEPOST + "/" + id, { headers: { Authorization: `JWT ${token}` }, });

      setIsLoading(false);
      navigation.navigate('Index');
    }
    catch (error) {
      setIsLoading(false);
      console.log(error);

      if (error.response.data.error = "Invalid token") {
        dispatch({...logOutAction()})
        navigation.navigate("SignInSignUp");
      }
    }
  }

  async function editPost(id) {
    Keyboard.dismiss();

    if (Title == "") {
      setTitleError("Title cannot be blank");
      return;
    }
    else
      setTitleError("");

    setIsLoading(true);

    try {
      if (imageData == null) {
        const response = await axios.put(API + API_ONEPOST + "/" + id, {
          Title,
          Description,
        }, 
        {
          headers: { Authorization: `JWT ${token}` },
        });
      }
      else {
        const response = await axios.put(API + API_ONEPOST + "/" + id, {
          Title,
          imageData,
          Description,
          ExifData,
          GoogleImageTags,
        }, 
        {
          headers: { Authorization: `JWT ${token}` },
        });
      }

      setIsLoading(false);
      navigation.navigate('Index');
    }
    catch (error) {
      setIsLoading(false);
      console.log(error);

      if (error.response.data.error = "Invalid token") {
        dispatch({...logOutAction()})
        navigation.navigate("SignInSignUp");
      }
    }
  }

  function MapImageTags(GoogleImageTags) {
    if (GoogleImageTags) {
      return GoogleImageTags.map((data, index) => {
        return (
          <Chip icon="tag" key={index} style={{marginRight: 5, marginBottom: 10}}>{data.description}</Chip>
        )
      }) 
    }
    else
      return null;
  }

  async function submitToGoogleAPI(imageString) {
    const requests = [{
      features: [{ 
        type: "LABEL_DETECTION", maxResults: 5 
      },],
      image: {
        content: imageString
      }
    }];

    setIsGoogleUpload(true);

    try {
      // const response = await axios.post(GOOGLEAPI_URL + GOOGLEAPI_KEY, {
      //   requests
      // }, 
      // {
      //   headers: { 
      //     Accept: "application/json",
      //     "Content-Type": "application/json"
      //   },
      // });

      const testdata = {
        responses: [{
          labelAnnotations: [{
            description: "Sky",
            mid: "/m/01bqvp",
            score: 0.9747512,
            topicality: 0.9747512,
          },
          {
            description: "Building",
            mid: "/m/0cgh4",
            score: 0.9708724,
            topicality: 0.9708724,
          },
          {
            description: "Skyscraper",
            mid: "/m/079cl",
            score: 0.96657646,
            topicality: 0.96657646,
          },
          {
            description: "Daytime",
            mid: "/m/02q7ylj",
            score: 0.9478813,
            topicality: 0.9478813,
          },
          {
            description: "Street light",
            mid: "/m/033rq4",
            score: 0.90216017,
            topicality: 0.90216017,
              },
            ],
          },
        ],
      }

      setIsGoogleUpload(false);
      setIsGoogleDone(true);

      setGoogleImageTags(testdata.responses[0].labelAnnotations);
    }
    catch (error) {
      setIsGoogleUpload(false);
      console.log(error);
    }
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
          <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <ScrollView style={{margin: 20}} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
            <View style={{flexDirection: "row", alignItems: "center", alignSelf: "center", marginBottom: 30,}}>
              {profilePic == "" ? (<View />) : (<Image source={{ uri: profilePic }} style={{ width: 80, height: 80 }} borderRadius={50} />)}
              <View style={{marginLeft: 10, alignItems: "flex-start"}}>
                <Text style={[styles.title, styles.text, {fontSize: 28}]}>{nickname},</Text>
                <Text style={[styles.title, styles.text, {fontSize: 28}]}>{postID ? "Changed your mind?" : "What's on your mind?"}</Text>
              </View>
            </View>

            <Text style={[additionalStyles.label, styles.text]}>Post Title</Text>
            <TextInputWithError width="100%" center={false} isDark={isDark} placeholder="Title" secureTextEntry={false} autoCapitalize={true} value={Title} setData={setTitle} ErrorText={TitleError}/>
            
            <Text style={[additionalStyles.label, styles.text]}>Post Image</Text>
            <PhotoPickerWithError postPic={true} isDark={isDark} imageData={imageData} origImageURL={origImageURL} LaunchGallery={LaunchGallery} LaunchCamera={LaunchCamera} ErrorText={imageDataError} />

            <Text style={[additionalStyles.label, styles.text]}>Image Tags</Text>
            <View style={{flexDirection: "row", width: "100%", justifyContent: "space-between", marginBottom: 10}}>
              <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                {MapImageTags(GoogleImageTags)}
              </View>

              {isGoogleDone ? <View /> : (
                isGoogleUpload ? (<ActivityIndicator size="large" color="#0000ff" style={{marginRight: 20}} />) : (
                  <TouchableOpacity onPress={() => imageData ? submitToGoogleAPI(imageData) : null} style={styles.button}>
                    <Text style={styles.buttonText}>Auto Tag</Text>
                  </TouchableOpacity>
                )
              )}             
            </View>

            <Text style={[additionalStyles.label, styles.text]}>Post Description</Text>
            <View style={[styles.inputView, {height: 100, marginBottom: 20}]}>
              <TextInput
                style={[styles.textInput, {height: 100}]}
                multiline={true}
                textAlignVertical="top"
                autoCapitalize="sentences"
                autoCorrect={true}
                placeholder="Optional Description"
                placeholderTextColor="#003f5c"
                value={Description}
                onChangeText={(text) => setDescription(text)}
              />
            </View>

            <View style={{flexDirection: "row", justifyContent: "space-between", width: "100%"}}>
              <TouchableOpacity onPress={() => postID ? editPost(postID) : submitPost()} style={styles.button}>
                <Text style={styles.buttonText}>{postID ? "Edit" : "Submit"}</Text>
              </TouchableOpacity>

              {postID ? (
                <TouchableOpacity onPress={() => deletePost(postID)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={48} color="red" />
                </TouchableOpacity>
              ) : (
                <View />
              )}
            </View>
            
          </ScrollView>
      )}
    </View>
  )
}

const additionalStyles = StyleSheet.create({
  label: {
    fontSize: 18,
    marginBottom: 10,
  }
});