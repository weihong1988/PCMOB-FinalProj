import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";

import { useTheme } from 'react-native-paper';
import { Avatar, Button, Card, ActivityIndicator } from 'react-native-paper';
import { Text, Title, Subheading, Paragraph, Headline, Caption } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';

import { commonStyles } from "../styles/commonStyles";

import { API, API_GETALLPOSTS, API_IMAGE_URL } from "../constants/API";
import axios from "axios";

export default function BrowseAllScreen({ navigation, route }) {
  const token = useSelector(state => state.auth.token);
  const { colors } = useTheme();

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [postsArray, setPostsArray] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const removeListener = navigation.addListener("focus", () => {
      getAllPosts();
    });

    getAllPosts();

    return removeListener;
  }, []);

  async function getAllPosts() {
    setIsLoading(true);

    try {
      const response = await axios.get(API + API_GETALLPOSTS, {
        headers: { Authorization: `JWT ${token}` },
      })

      setPostsArray(response.data);
      setIsLoading(false);
    } 
    catch (error) {
      setIsLoading(false);

      console.log(error.response.data);
      if (error.response.data.error == "Invalid token") {
        dispatch({...logOutAction()})
        navigation.navigate("SignInSignUp");
      }
    }
  }

  async function onRefresh()
  {
    setRefreshing(true);
    await getAllPosts();
    setRefreshing(false);
  }

  // The function to render each row in our FlatList
  function renderItem({ item }) {
    return (
      <Card style={{borderBottomWidth: 1, borderRightWidth: 1, borderColor: colors.placeholder, marginHorizontal: 20, marginVertical: 10}}>
        <Card.Title
          title={item.createdUserObject.nickname}
          subtitle={"Posted on: " + new Date(item.createdAt * 1000).toDateString()}
          left={(props) => <Avatar.Image {...props} source={{uri: API_IMAGE_URL + item.createdUserObject.profilePic}} />}
        />

        <Card.Content style={{marginBottom: 10}}>
          <Headline>{item.title}</Headline>
        </Card.Content>

        <Card.Cover source={{ uri: API_IMAGE_URL + item.image }} />

        {item.description ? (
          <Card.Content style={{marginTop: 10}}>
            <Paragraph>{item.description}</Paragraph>
          </Card.Content>
        ) : <View />}

        <Card.Actions>
          <Button onPress={() => navigation.navigate("BrowseDetails", {post_id: item.id, created_user: null})}>Details</Button>
        </Card.Actions>
      </Card>
    );
  }

  return (
    <View style={commonStyles.container}>
    { isLoading ? (
        <View style={commonStyles.centeredContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={postsArray}
          renderItem={renderItem}
          style={{ width: "100%" }}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
    )}
  </View>
  );
}
  