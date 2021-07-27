import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import SearchScreen from "../screens/SearchScreen";

import { useDispatch, useSelector } from 'react-redux';
import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";

const SearchStack = createStackNavigator();

export default function SearchStackComponent() {
  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...isDark ? darkStyles : lightStyles };

  const headerOptions = {
    headerStyle: styles.header,
    headerTitleStyle: styles.headerTitle,
    headerTintColor: styles.headerTint
  }

  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="Search" component={SearchScreen} options={{ title: "Search All", ...headerOptions, headerLeft: null}} />
    </SearchStack.Navigator>
  )
}