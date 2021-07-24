import React, { useState, useEffect, useRef } from "react";
import { ActivityIndicator, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import  MapView, { Marker } from 'react-native-maps';

import { API, API_COMMENT, API_ONEPOST, API_IMAGE_URL } from "../constants/API";
import axios from 'axios';

import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";
import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';

export default function ShowScreen({ navigation, route }) {
  const token = useSelector(state => state.auth.token);

  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...isDark ? darkStyles : lightStyles };

  var loggedInUserID = useSelector(state => state.account.user_id);

  const [post, setPost] = useState(null);
  const [ExifData, setExifData] = useState(null);

  const [Comment, setComment] = useState("");
  const [allUserComments, setAllUserComments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const postID = route.params.post_id;
  const createdUser = route.params.created_user;

  const markerRef = useRef(null);

  const screenWidth = Dimensions.get("window").width - 48;
  const dispatch = useDispatch();

  useEffect(() => {
    navigation.setOptions(loggedInUserID == createdUser ? (
      {
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate("CreateEdit", { title: "Edit Post", post_id: postID }) }>
            <MaterialCommunityIcons name="square-edit-outline" size={48} style={{ color: styles.headerTint, marginRight: 20 }} />
          </TouchableOpacity>
        ),
      }
    ) : null);
  });

  function capitalizeFirstLetter(string) {
    if (string)
      return string.charAt(0).toUpperCase() + string.slice(1);
    else
      return "";
  }

  async function getOnePost(id) {
    setIsLoading(true);

    try {
      const response = await axios.get(API + API_ONEPOST + "/" + id, {
        headers: { Authorization: `JWT ${token}` },
      })

      setPost(response.data);
      setExifData(JSON.parse(response.data.exif_tags));
      setAllUserComments(response.data.comments);

      console.log(response.data)

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

  async function addComment(id) {
    const PostID = id;

    if (Comment == "")
      return;

    setIsLoading(true);

    try {
      const response = await axios.post(API + API_COMMENT, {
        PostID,
        Comment,
      }, 
      {
        headers: { Authorization: `JWT ${token}` },
      });

      setComment("");
      setIsLoading(false);

      getOnePost(PostID);
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

  function MapComments() {
    return allUserComments.map((data) => {
      return (
        <View style={{flexDirection: "row", width: "100%", marginTop: 10, paddingVertical: 10, borderTopWidth: 1, borderColor: isDark ? "#f4d47c" : "#f55" }} key={data.id}>
          <Image source={{ uri: API_IMAGE_URL + data.createdUserObject.profilePic }} style={{ width: 50, height: 50 }} borderRadius={40} />
          <View style={{flexGrow: 1, marginLeft: 10}}>
            <Text style={[styles.text, {fontSize: 18, fontWeight: "bold"}]}>{data.createdUserObject.nickname}</Text>
            <Text style={styles.text}>{data.comment}</Text>
          </View>
        </View>
      )
    }) 
  }

  useEffect(() => {
    const removeListener = navigation.addListener("focus", () => {
      getOnePost(postID);
    });

    getOnePost(postID);
    
    return removeListener;
  }, [])
  
  return (
    <View style={styles.container}>
      { isLoading ? (
          <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <ScrollView style={{margin: 20}} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
            <View style={{flexDirection: "row", alignItems: "center", marginBottom: 10,}}>
              <Image source={{ uri: API_IMAGE_URL + post?.createdUserObject.profilePic }} style={{ width: 80, height: 80 }} borderRadius={40} />
              <View style={{marginLeft: 20, alignItems: "flex-start"}}>
                <Text style={[styles.title, styles.text]}>{post?.createdUserObject.nickname}</Text>
                <Text style={[styles.text, {fontSize: 16}]}>Posted on: {new Date(post.createdAt * 1000).toDateString() + ' ' + new Date(post.createdAt * 1000).toLocaleTimeString('en-US')}</Text>
              </View>           
            </View>

            <Text style={[styles.title, styles.text, {textDecorationLine: "underline", marginVertical: 5}]}>{post.title}</Text>
            <Image source={{ uri: API_IMAGE_URL + post.image }} style={{ width: screenWidth, height: screenWidth, marginVertical: 5 }} resizeMode="contain" />
            <View style={[styles.textContainerView, { marginVertical: 5}]}>
              <Text>{post.description}</Text>
            </View>

            {ExifData?.GPSLatitude && ExifData?.GPSLongitude ? (
              <View style={{width: "100%"}}>
                <Text style={[styles.text, {fontSize: 18, textDecorationLine: "underline", marginTop: 20, marginBottom: 5}]}>Geolocation Tags</Text>
                <MapView 
                  style={{width: "100%", height: 220, marginVertical: 5}} 
                  initialRegion={{
                    latitude: ExifData.GPSLatitude,
                    longitude: ExifData.GPSLongitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.0025,
                  }}
                  
                >
                  <Marker
                    
                    coordinate={{
                      latitude: ExifData.GPSLatitude,
                      longitude: ExifData.GPSLongitude
                    }}
                    title={"Image Location"}
                  />
                </MapView>
              </View>
            ) : (
              <View />
            )
            }
            
            <Text style={[styles.text, {fontSize: 18, textDecorationLine: "underline", marginTop: 20, marginBottom: 5}]}>EXIF Data</Text>
            <View style={[styles.textContainerView, { marginVertical: 5}]}>
              <Text>{
                `Camera: ${ExifData.Make ? (capitalizeFirstLetter(ExifData.Make) + " " + ExifData.Model) : "-"}\nTaken on: ${ExifData.DateTime ? ExifData.DateTime : "-"}\n\n` +
                `GPS Coords:  ${(ExifData.GPSLatitude && ExifData.GPSLongitude) ? (ExifData.GPSLatitude.toFixed(6) + ", " + ExifData.GPSLongitude?.toFixed(6)) : "-"}\n\n` +
                `Shutter Speed: ${ExifData.ExposureTime ? (ExifData.ExposureTime + "s") : "-"}\nF-stop: ${ExifData.FNumber ? ExifData.FNumber : "-"}\nISO: ${ExifData.ISOSpeedRatings ? ExifData.ISOSpeedRatings : "-"}\nFlash fired: ${ExifData.Flash != undefined ? ExifData.Flash : "-"}`}
              </Text>
            </View>


            <Text style={[styles.text, {fontSize: 18, textDecorationLine: "underline", marginTop: 20, marginBottom: 5}]}>User Comments</Text>
            <View style={{flexDirection: "row", width: "100%"}}>
              <Image source={{ uri: API_IMAGE_URL + post?.createdUserObject.profilePic }} style={{ width: 80, height: 80 }} borderRadius={40} />
              <View style={{flexGrow: 1, marginLeft: 10}}>
                <View style={[styles.inputView, {height: 80, marginBottom: 10}]}>
                  <TextInput
                    style={[styles.textInput, {height: 80}]}
                    multiline={true}
                    textAlignVertical="top"
                    autoCapitalize="sentences"
                    autoCorrect={true}
                    placeholder="Your Comments..."
                    placeholderTextColor="#003f5c"
                    value={Comment}
                    onChangeText={(text) => setComment(text)}
                  />
                </View>
                <TouchableOpacity onPress={() => addComment(postID)} style={[styles.button, {alignSelf: "flex-end"}]}>
                  <Text style={[styles.buttonText, {fontSize: 16, marginVertical: 5}]}>Comment</Text>
                </TouchableOpacity>
              </View>
            </View>

            {MapComments()}

          </ScrollView>
      )}
    </View>
  );
}
