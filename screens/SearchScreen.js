import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Dimensions, Image} from "react-native";
import { Searchbar, Badge, Chip, Card } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';

import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";

import { API, API_POPULARSEARCH, API_IMAGE_URL } from "../constants/API";
import axios from "axios";

export default function SearchScreen({ navigation, route }) {
  const token = useSelector(state => state.auth.token);

  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...isDark ? darkStyles : lightStyles };

  const [searchQuery, setSearchQuery] = React.useState("");
  const [popularSearch, setPopularSearch] = React.useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const removeListener = navigation.addListener("focus", () => {
      getPopularSearches();
    });

    getPopularSearches();

    return removeListener;
  }, []);

  async function getPopularSearches() {
    setIsLoading(true);

    try {
      const response = await axios.get(API + API_POPULARSEARCH, {
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
          <Chip icon="tag" style={{zIndex: 0}}>{data.tag}</Chip>
        </View>
      )
    }) 
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search"
        onChangeText={(data) => {setSearchQuery(data)}}
        value={searchQuery}
        style={{width: "90%", marginVertical: 10, alignSelf: "center"}}
      />

      <View>
        {isLoading ? (<ActivityIndicator size="large" color="#0000ff" />) : (
          <Card style={[styles.card, {width: "90%", alignSelf: "center", borderWidth: 2, borderColor: isDark ? "lightgrey" : "black", borderRadius: 20}]}>
          <Text style={[styles.text, {alignSelf: "center", textDecorationLine: "underline", marginTop: 5, fontSize: 16}]}>Trending Searches</Text>
            <View style={{flexDirection: "row", flexWrap: "wrap", margin: 10}}>
              {MapPopularSearches()}
            </View>
          </Card>
        )}
      </View>

      <Text>Search Screen</Text>
    </View>
  );
}
  