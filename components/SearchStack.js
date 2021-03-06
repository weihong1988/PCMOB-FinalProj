import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import SearchScreen from "../screens/SearchScreen";
import ShowScreen from '../screens/DetailsScreen';

const SearchStack = createStackNavigator();

export default function SearchStackComponent() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="Search" component={SearchScreen} options={{ title: "Search All", headerLeft: null}} />
      <SearchStack.Screen name="SearchDetails" component={ShowScreen} options={{ title: "Details" }} />
    </SearchStack.Navigator>
  )
}