import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Keyboard, ScrollView, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ActivityIndicator, Chip, Button, HelperText, TextInput } from 'react-native-paper';
import { Text, Title, Subheading, Paragraph, Headline, Caption } from 'react-native-paper';

import {GOOGLEAPI_URL, GOOGLEAPI_KEY} from "../secrets/keys";
import { API, API_CREATE, API_ONEPOST, API_IMAGE_URL } from "../constants/API";
import axios from 'axios';

import PhotoPickerWithError from "../components/PhotoPickerWithError";

import { commonStyles } from "../styles/commonStyles";
import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';

export default function CreateEditScreen({ route, navigation }) {
  const token = useSelector(state => state.auth.token);
  const postID = route.params.post_id;

  const nickname = useSelector(state => state.account.nickname);
  const profilePic = useSelector(state => state.account.profilePicture);

  const [origImageURL, setOrigImageURL] = useState("");

  const [postTitle, setPostTitle] = useState("");
  const [PostTitleError, setPostTitleError] = useState("");

  const [imageData, setImageData] = useState(null);
  const [imageDataError, setImageDataError] = useState("");

  const [Description, setDescription] = useState("");

  const [ExifData, setExifData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [GoogleImageTags, setGoogleImageTags] = useState(null);
  const [customImageTags, setCustomImageTags] = useState("");
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

      setPostTitle(response.data.title);
      setDescription(response.data.description);
      setOrigImageURL(API_IMAGE_URL + response.data.image);

      setIsLoading(false);
    } 
    catch (error) {
      setIsLoading(false);
      console.log(error);

      if (error.response.data.error == "Invalid token") {
        dispatch({...logOutAction()})
        navigation.navigate("SignInSignUp");
      }
    }
  }

  async function submitPost() {
    var ErrorFound = false;
    Keyboard.dismiss();

    if (postTitle == "") {
      setPostTitleError("Title cannot be blank");
      ErrorFound = true;
    }
    else
      setPostTitleError("");

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
          postTitle,
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

        if (error.response.data.error == "Invalid token") {
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

      if (error.response.data.error == "Invalid token") {
        dispatch({...logOutAction()})
        navigation.navigate("SignInSignUp");
      }
    }
  }

  async function editPost(id) {
    Keyboard.dismiss();

    if (postTitle == "") {
      setPostTitleError("Title cannot be blank");
      return;
    }
    else
      setPostTitleError("");

    setIsLoading(true);

    try {
      if (imageData == null) {
        const response = await axios.put(API + API_ONEPOST + "/" + id, {
          postTitle,
          Description,
        }, 
        {
          headers: { Authorization: `JWT ${token}` },
        });
      }
      else {
        const response = await axios.put(API + API_ONEPOST + "/" + id, {
          postTitle,
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

      if (error.response.data.error == "Invalid token") {
        dispatch({...logOutAction()})
        navigation.navigate("SignInSignUp");
      }
    }
  }

  function MapImageTags(ImageTags) {
    if (ImageTags) {
      return ImageTags.map((data, index) => {
        return (
          <Chip 
            icon="tag" 
            key={data.description} 
            mode="outlined" 
            onClose={() => setGoogleImageTags(GoogleImageTags.filter(d => d.description !== data.description))} 
            style={{marginRight: 5, marginBottom: 10}}
          >
            {data.description}
          </Chip>
        )
      }) 
    }
    else
      return null;
  }

  function AddCustomImageTag() {
    if (customImageTags) {
      let NewItem = {
        description: customImageTags,
        score: 1.0,
        topicality: 1.0,
      }

      GoogleImageTags.push(NewItem);
      setCustomImageTags("");
    }
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
      // const testdata = {
      //   responses: [{
      //     labelAnnotations: [{
      //       description: "Sky",
      //       mid: "/m/01bqvp",
      //       score: 0.9747512,
      //       topicality: 0.9747512,
      //     },
      //     {
      //       description: "Building",
      //       mid: "/m/0cgh4",
      //       score: 0.9708724,
      //       topicality: 0.9708724,
      //     },
      //     {
      //       description: "Skyscraper",
      //       mid: "/m/079cl",
      //       score: 0.96657646,
      //       topicality: 0.96657646,
      //     },
      //     {
      //       description: "Daytime",
      //       mid: "/m/02q7ylj",
      //       score: 0.9478813,
      //       topicality: 0.9478813,
      //     },
      //     {
      //       description: "Street light",
      //       mid: "/m/033rq4",
      //       score: 0.90216017,
      //       topicality: 0.90216017,
      //         },
      //       ],
      //     },
      //   ],
      // }

      const response = await axios.post(GOOGLEAPI_URL + GOOGLEAPI_KEY, {
        requests
      }, 
      {
        headers: { 
          Accept: "application/json",
          "Content-Type": "application/json"
        },
      });

      setIsGoogleUpload(false);
      setIsGoogleDone(true);

      //setGoogleImageTags(testdata.responses[0].labelAnnotations);
      setGoogleImageTags(response.data.responses[0].labelAnnotations);
    }
    catch (error) {
      setIsGoogleUpload(false);
      console.log(error);
    }
  }

  return (
    <View style={commonStyles.container}>
      {isLoading ? (
          <View style={commonStyles.centeredContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <ScrollView style={{marginHorizontal: 20, marginVertical: 10}} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
            <View style={{flexDirection: "row", alignItems: "center", marginBottom: 10,}}>
              {profilePic == "" ? (<View />) : (<Image source={{ uri: profilePic }} style={{ width: 80, height: 80 }} borderRadius={50} />)}
              <View style={{marginLeft: 10, alignItems: "flex-start"}}>
                <Title style={{fontSize: 28, marginBottom: 10}}>{nickname},</Title>
                <Subheading style={[{fontSize: 22}]}>{postID ? "Changed your mind?" : "What's on your mind?"}</Subheading>
              </View>
            </View>

            <TextInput mode="outlined" style={[commonStyles.titleInput, {width: "100%"}]} label="Title" error={PostTitleError ? true : false} autoCapitalize="sentences" value={postTitle} onChangeText={data => setPostTitle(data)} />
            <HelperText type="error" visible={PostTitleError ? true : false}>{PostTitleError}</HelperText>

            <PhotoPickerWithError postPic={true} imageData={imageData} origImageURL={origImageURL} LaunchGallery={LaunchGallery} LaunchCamera={LaunchCamera} ErrorText={imageDataError} />

            <View style={{flexDirection: "row", flexWrap: "wrap", width: "100%"}}>
              {MapImageTags(GoogleImageTags)}
            </View>

            <View style={{flexDirection: "row", width: "100%", justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
              <TextInput 
                mode="outlined" 
                style={[commonStyles.textInput, {width: "60%" }]} 
                label="Add Image Tags" 
                autoCapitalize="sentences" 
                value={customImageTags} 
                onChangeText={data => setCustomImageTags(data)} 
                right={<TextInput.Icon name="tag-plus" onPress={AddCustomImageTag} forceTextInputFocus={false} />}
              />

              { isGoogleUpload ? (<ActivityIndicator size="large" style={{marginRight: 20}} />) : (
                  <Button mode="contained" disabled={isGoogleDone ? true: false} onPress={() => imageData ? submitToGoogleAPI(imageData) : null}>Auto Tag</Button>
              )}
            </View>

            <TextInput 
              mode="outlined" 
              style={[commonStyles.descInput, {width: "100%"}]} 
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              label="Description (Optional)" 
              autoCapitalize="sentences" 
              autoCorrect={true}
              value={Description} 
              onChangeText={data => setDescription(data)} 
            />

            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: 20}}>
              <Button mode="contained" onPress={() => postID ? editPost(postID) : submitPost()}>{postID ? "Edit" : "Submit"}</Button>

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
