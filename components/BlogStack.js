import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import IndexScreen from '../screens/IndexScreen';
import CreateEditScreen from '../screens/CreateEditScreen';
import ShowScreen from '../screens/DetailsScreen';

import { useDispatch, useSelector } from 'react-redux';
import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";

const InnerStack = createStackNavigator();

export default function BlogStack() {
  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...isDark ? darkStyles : lightStyles };

  const headerOptions = {
    headerStyle: styles.header,
    headerTitleStyle: styles.headerTitle,
    headerTintColor: styles.headerTint
  }

  return (
    <InnerStack.Navigator>
      <InnerStack.Screen name="Index" component={IndexScreen} options={{ title: "My Posts", ...headerOptions, headerLeft: null}} />
      <InnerStack.Screen name="CreateEdit" component={CreateEditScreen} options={({ route }) => ({ title: route.params.title, ...headerOptions })} />
      <InnerStack.Screen name="Details" component={ShowScreen} options={headerOptions} />
    </InnerStack.Navigator>
  )
}