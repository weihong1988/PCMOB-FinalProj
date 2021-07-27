import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Dimensions, Image} from "react-native";
import { Searchbar } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '../redux/ducks/blogAuth';

import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";

import { API, API_MYPOSTS, API_IMAGE_URL } from "../constants/API";
import axios from "axios";

export default function SearchScreen({ navigation, route }) {
  const token = useSelector(state => state.auth.token);

  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...isDark ? darkStyles : lightStyles };

  const [searchQuery, setSearchQuery] = React.useState('');

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search"
        onChangeText={(data) => {setSearchQuery(data)}}
        value={searchQuery}
        style={{width: "90%", marginVertical: 10, alignSelf: "center"}}
      />

      <Text>Search Screen</Text>
    </View>
  );
}
  