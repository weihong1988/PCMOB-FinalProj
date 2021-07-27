import React, { useEffect, useState } from "react";
import { Text, View, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';

import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";

import { API, API_GETALLPOSTS, API_IMAGE_URL } from "../constants/API";
import axios from "axios";

export default function BrowseAllScreen({ navigation, route }) {
  const token = useSelector(state => state.auth.token);

  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...isDark ? darkStyles : lightStyles };

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
      if (error.response.data.error = "Invalid token") {
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
      <Card style={[styles.card, {borderBottomWidth: 3, borderColor: isDark ? "lightgrey" : "black"}]}>
        <Card.Title
          title={item.createdUserObject.nickname}
          titleStyle={styles.text}
          subtitle={"Posted on: " + new Date(item.createdAt * 1000).toDateString()}
          subtitleStyle={{color: isDark ? "lightgrey" : "grey"}}
          left={(props) => <Avatar.Image {...props} source={{uri: API_IMAGE_URL + item.createdUserObject.profilePic}} />}
        />

        <Card.Content>
          <Title style={styles.text}>{item.title}</Title>
        </Card.Content>

        <Card.Cover source={{ uri: API_IMAGE_URL + item.image }} />

        {item.description ? (
          <Card.Content>
            <Paragraph style={styles.text}>{item.description}</Paragraph>
          </Card.Content>
        ) : null}

        <Card.Actions>
          <Button  onPress={() => navigation.navigate("BrowseDetails", {post_id: item.id, created_user: null})}>Details</Button>
        </Card.Actions>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
    { isLoading ? (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <ActivityIndicator size="large" color="#0000ff" />
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
  