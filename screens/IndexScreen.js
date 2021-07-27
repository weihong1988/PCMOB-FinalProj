import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Dimensions, Image} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';

import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";

import { API, API_MYPOSTS, API_IMAGE_URL } from "../constants/API";
import axios from "axios";

export default function IndexScreen({ navigation, route }) {
  const token = useSelector(state => state.auth.token);

  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...isDark ? darkStyles : lightStyles };

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [postsArray, setPostsArray] = useState([]);
  
  const screenWidth = Dimensions.get("window").width - 2*2;
  const numColumns = 2;
  const tileSize = screenWidth / numColumns;

  const dispatch = useDispatch();

  // This is to set up the top right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("CreateEdit", { title: "Create Post", post_id: null })}>
          <MaterialCommunityIcons name="card-plus" size={48} style={{ color: styles.headerTint, marginRight: 20 }} />
        </TouchableOpacity>
      ),
    });
  });

  useEffect(() => {
    const removeListener = navigation.addListener("focus", () => {
      getMyPosts();
    });

    getMyPosts();

    return removeListener;
  }, []);

  async function getMyPosts() {
    setIsLoading(true);

    try {
      const response = await axios.get(API + API_MYPOSTS, {
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
    await getMyPosts();
    setRefreshing(false);
  }

  // The function to render each row in our FlatList
  function renderItem({ item }) {
    return (
      <TouchableOpacity onPress={() => navigation.navigate("Details", {post_id: item.id, created_user: item.createdUser})}>
        <Image source={{ uri: API_IMAGE_URL + item.image }} style={{ width: tileSize, height: tileSize, margin: 1, borderColor: "black", borderWidth: 1, }} />
      </TouchableOpacity>
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
            numColumns={numColumns}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
      )}
    </View>
  );
}
