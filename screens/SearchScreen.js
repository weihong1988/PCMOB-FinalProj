import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, FlatList, Dimensions, Image} from "react-native";

import { ActivityIndicator, Avatar, Badge, Chip, Button, HelperText, TextInput, Card, Searchbar } from 'react-native-paper';
import { Text, Title, Subheading, Paragraph, Headline, Caption } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';

import { commonStyles } from "../styles/commonStyles";

import { API, API_SEARCH, API_IMAGE_URL } from "../constants/API";
import axios from "axios";

export default function SearchScreen({ navigation, route }) {
  const token = useSelector(state => state.auth.token);
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [popularSearch, setPopularSearch] = React.useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [postsArray, setPostsArray] = useState([]);
  const [postsArrayValid, setPostsArrayValid] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const removeListener = navigation.addListener("focus", () => {
      getPopularSearches();
    });

    getPopularSearches();

    return removeListener;
  }, []);

  async function searchPosts(searchTerm) {
    setIsLoading(true);

    try {
      const response = await axios.post(API + API_SEARCH, {
        searchTerm
      }, {
        headers: { Authorization: `JWT ${token}` },
      });

      setPostsArray(response.data);
      setPostsArrayValid(true);

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

  async function getPopularSearches() {
    setIsLoading(true);

    try {
      const response = await axios.get(API + API_SEARCH, {
        headers: { Authorization: `JWT ${token}` },
      })

      setPopularSearch(response.data);
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

  function MapPopularSearches() {
    return popularSearch.map((data, index) => {
      return (
        <View key={index} style={{marginRight: 10, marginBottom: 10}}>
          <Badge style={{marginBottom: -10, zIndex: 1, alignSelf: "flex-start"}}>{data.total}</Badge>
          <Chip icon="tag" mode="outlined" style={{zIndex: 0}} onPress={() => {setSearchQuery(data.tag); searchPosts(data.tag);}}>{data.tag}</Chip>
        </View>
      )
    }) 
  }

  // The function to render each row in our FlatList
  function renderItem({ item }) {
    return (
      <Card style={{borderBottomWidth: 1, borderRightWidth: 1, borderColor: colors.placeholder, marginHorizontal: 20, marginVertical: 10}}>
        <Card.Title
          title={item.Blogpost.createdUserObject.nickname}
          subtitle={"Posted on: " + new Date(item.Blogpost.createdAt * 1000).toDateString()}
          left={(props) => <Avatar.Image {...props} source={{uri: API_IMAGE_URL + item.Blogpost.createdUserObject.profilePic}} />}
        />

        <Card.Content style={{marginBottom: 10}}>
          <Headline>{item.Blogpost.title}</Headline>
        </Card.Content>

        <Card.Cover source={{ uri: API_IMAGE_URL + item.Blogpost.image }} />

        {item.Blogpost.description ? (
          <Card.Content style={{marginTop: 10}}>
            <Paragraph>{item.Blogpost.description}</Paragraph>
          </Card.Content>
        ) : <View />}

        <Card.Actions>
          <Button onPress={() => navigation.navigate("SearchDetails", {post_id: item.Blogpost.id, created_user: null})}>Details</Button>
        </Card.Actions>
      </Card>
    );
  }

  return (
    <View style={commonStyles.container}>
      <Searchbar
        placeholder="Search"
        onChangeText={(data) => {
          setPostsArrayValid(false);
          setSearchQuery(data);
        }}
        value={searchQuery}
        style={{width: "90%", marginVertical: 10, alignSelf: "center"}}
        onIconPress={() => {searchPosts(searchQuery)}}
      />

      { postsArrayValid ? (
        postsArray.length > 0 ? (
          <FlatList
            data={postsArray}
            renderItem={renderItem}
            style={{ width: "100%" }}
            keyExtractor={(item) => item.Blogpost.id.toString()}
          />
        ) : (
          <Card style={{width: "90%", height: 100, alignSelf: "center", borderBottomWidth: 1, borderRightWidth: 1, borderColor: colors.placeholder, marginVertical: 20}}>
            <Title style={{alignSelf: "center", marginTop: 5}}>No Matches</Title>
          </Card>
        )
      ) : (
        <View>
          {isLoading ? (<ActivityIndicator size="large" />) : (
            <Card style={{width: "90%", alignSelf: "center", borderBottomWidth: 1, borderRightWidth: 1, borderColor: colors.placeholder, marginVertical: 20}}>
            <Title style={{alignSelf: "center", textDecorationLine: "underline", marginTop: 5}}>Trending Searches</Title>
              <View style={{flexDirection: "row", flexWrap: "wrap", margin: 10}}>
                {MapPopularSearches()}
              </View>
            </Card>
          )}
        </View>
      )}
    </View>
  );
}
  