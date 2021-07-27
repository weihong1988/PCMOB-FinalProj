import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import BrowseAllScreen from "../screens/BrowseAllScreen";
import ShowScreen from '../screens/DetailsScreen';

import { useDispatch, useSelector } from 'react-redux';
import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";

const BrowseStack = createStackNavigator();

export default function BrowseStackComponent() {
  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...isDark ? darkStyles : lightStyles };

  const headerOptions = {
    headerStyle: styles.header,
    headerTitleStyle: styles.headerTitle,
    headerTintColor: styles.headerTint
  }

  return (
    <BrowseStack.Navigator>
      <BrowseStack.Screen name="Browse" component={BrowseAllScreen} options={{ title: "Explore All", ...headerOptions, headerLeft: null }} />
      <BrowseStack.Screen name="BrowseDetails" component={ShowScreen} options={{ title: "Details", ...headerOptions }} />
    </BrowseStack.Navigator>
  )
}