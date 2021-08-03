import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import  MapView, { Marker } from 'react-native-maps';

import { ActivityIndicator, Chip, Button, HelperText, TextInput, Card } from 'react-native-paper';
import { Text, Title, Subheading, Paragraph, Headline, Caption } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

import { API, API_COMMENT, API_ONEPOST, API_IMAGE_URL } from "../constants/API";
import axios from 'axios';

import { commonStyles } from "../styles/commonStyles";
import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';

export default function ShowScreen({ navigation, route }) {
  const token = useSelector(state => state.auth.token);
  const { colors } = useTheme();

  var loggedInUserID = useSelector(state => state.account.user_id);

  const [post, setPost] = useState(null);
  const [ExifData, setExifData] = useState(null);

  const [Comment, setComment] = useState("");
  const [allUserComments, setAllUserComments] = useState([]);

  const [GoogleImageTags, setGoogleImageTags] = useState(null);

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
            <MaterialCommunityIcons name="square-edit-outline" size={48} style={{ color: colors.primary, marginRight: 20 }} />
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
      setGoogleImageTags(response.data.tags);

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

      if (error.response.data.error == "Invalid token") {
        dispatch({...logOutAction()})
        navigation.navigate("SignInSignUp");
      }
    }
  }

  function MapComments() {
    return allUserComments.map((data) => {
      return (
        <View style={{flexDirection: "row", width: "100%", marginTop: 10, paddingVertical: 10, borderTopWidth: 2, borderColor: colors.placeholder }} key={data.id}>
          <Image source={{ uri: API_IMAGE_URL + data.createdUserObject.profilePic }} style={{ width: 50, height: 50 }} borderRadius={40} />
          <View style={{flexGrow: 1, marginLeft: 10}}>
            <Title>{data.createdUserObject.nickname}</Title>
            <Text>{data.comment}</Text>
          </View>
        </View>
      )
    }) 
  }

  function MapImageTags(GoogleImageTags) {
    if (GoogleImageTags) {
      return GoogleImageTags.map((data, index) => {
        return (
          <Chip icon="tag" key={index} mode="outlined" style={{marginRight: 5, marginBottom: 10}}>{data.tag}</Chip>
        )
      }) 
    }
    else
      return null;
  }

  useEffect(() => {
    const removeListener = navigation.addListener("focus", () => {
      getOnePost(postID);
    });

    getOnePost(postID);
    
    return removeListener;
  }, [])
  
  return (
    <View style={commonStyles.container}>
      { isLoading ? (
          <View style={commonStyles.centeredContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <ScrollView style={{margin: 20}} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
            <View style={{flexDirection: "row", alignItems: "center", marginBottom: 10,}}>
              <Image source={{ uri: API_IMAGE_URL + post?.createdUserObject.profilePic }} style={{ width: 80, height: 80 }} borderRadius={40} />
              <View style={{marginLeft: 20, alignItems: "flex-start"}}>
                <Title style={{fontSize: 28, marginBottom: 10}}>{post?.createdUserObject.nickname}</Title>
                <Caption style={{fontSize: 14}}>Posted on: {new Date(post.createdAt * 1000).toDateString() + ' ' + new Date(post.createdAt * 1000).toLocaleTimeString('en-US')}</Caption>
              </View>           
            </View>

            <Headline style={{textDecorationLine: "underline", marginVertical: 5}}>{post.title}</Headline>
            <Image source={{ uri: API_IMAGE_URL + post.image }} style={{ width: screenWidth, height: screenWidth, marginVertical: 5 }} resizeMode="contain" />
            
            {post.description ? (<Paragraph>{post.description}</Paragraph>) : <View />}

            {GoogleImageTags ? (
              <View style={{flexDirection: "row", flexWrap: "wrap", marginVertical: 10}}>
                {MapImageTags(GoogleImageTags)}
              </View>
            ) : (<View />)}

            {ExifData?.GPSLatitude && ExifData?.GPSLongitude ? (
              <Card style={{width: "100%", marginBottom: 20, borderBottomWidth: 1, borderRightWidth: 1, borderColor: colors.placeholder}}>
                <Card.Title title="Geolocation Tags" titleStyle={{textDecorationLine: "underline"}}/>
                <Card.Content style={{marginBottom: 10}}>
                  <MapView 
                    style={{width: "100%", height: 220, marginVertical: 5}} 
                    initialRegion={{
                      latitude: ExifData.GPSLatitude,
                      longitude: ExifData.GPSLongitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.0025,
                    }}
                    onLayout={() => { markerRef.current.showCallout(); }}
                  >
                    <Marker
                      ref={markerRef}
                      coordinate={{
                        latitude: ExifData.GPSLatitude,
                        longitude: ExifData.GPSLongitude
                      }}
                      title={"Photograph Location"}
                    />
                  </MapView>
                </Card.Content>
              </Card>
            ) : (
              <View />
            )}
            
            <Card style={{width: "100%", borderBottomWidth: 1, borderRightWidth: 1, borderColor: colors.placeholder}}>
              <Card.Title title="EXIF Data" titleStyle={{textDecorationLine: "underline"}}/>
              <Card.Content style={{marginBottom: 10}}>
                <Text>{
                  `Camera: ${ExifData.Make ? (capitalizeFirstLetter(ExifData.Make) + " " + ExifData.Model) : "-"}\nTaken on: ${ExifData.DateTime ? ExifData.DateTime : "-"}\n\n` +
                  `GPS Coords:  ${(ExifData.GPSLatitude && ExifData.GPSLongitude) ? (ExifData.GPSLatitude.toFixed(6) + ", " + ExifData.GPSLongitude?.toFixed(6)) : "-"}\n\n` +
                  `Shutter Speed: ${ExifData.ExposureTime ? (ExifData.ExposureTime.toFixed(3) + " sec") : "-"}\nF-stop: ${ExifData.FNumber ? ExifData.FNumber : "-"}\nISO: ${ExifData.ISOSpeedRatings ? ExifData.ISOSpeedRatings : "-"}\nFlash fired: ${ExifData.Flash != undefined ? ExifData.Flash : "-"}`}
                </Text>
              </Card.Content>
            </Card>

            <Title style={[{ textDecorationLine: "underline", marginTop: 20, marginBottom: 5}]}>User Comments</Title>
            <View style={{flexDirection: "row", width: "100%", alignItems: "center", marginBottom: 20}}>
              <Image source={{ uri: API_IMAGE_URL + post?.createdUserObject.profilePic }} style={{ width: 80, height: 80 }} borderRadius={40} />
              <View style={{flexGrow: 1, marginLeft: 10}}>
                <TextInput 
                  mode="outlined" 
                  style={{width: "100%", height: 80}} 
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  label="Your Comments" 
                  autoCapitalize="sentences" 
                  autoCorrect={true}
                  right={<TextInput.Icon 
                    name="chat-plus" 
                    forceTextInputFocus={false}
                    onPress = {() => {
                      addComment(postID);
                    }}
                  />}
                  value={Comment} 
                  onChangeText={data => setComment(data)} 
                />
              </View>
            </View>

            {MapComments()}

          </ScrollView>
      )}
    </View>
  );
}
