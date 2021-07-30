import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import BrowseAllScreen from "../screens/BrowseAllScreen";
import ShowScreen from '../screens/DetailsScreen';

const BrowseStack = createStackNavigator();

export default function BrowseStackComponent() {
  return (
    <BrowseStack.Navigator>
      <BrowseStack.Screen name="Browse" component={BrowseAllScreen} options={{ title: "Explore All", headerLeft: null }} />
      <BrowseStack.Screen name="BrowseDetails" component={ShowScreen} options={{ title: "Details" }} />
    </BrowseStack.Navigator>
  )
}