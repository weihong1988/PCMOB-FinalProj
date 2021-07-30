import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import IndexScreen from '../screens/IndexScreen';
import CreateEditScreen from '../screens/CreateEditScreen';
import ShowScreen from '../screens/DetailsScreen';

const InnerStack = createStackNavigator();

export default function BlogStack() {
  return (
    <InnerStack.Navigator>
      <InnerStack.Screen name="Index" component={IndexScreen} options={{ title: "My Photos", headerLeft: null}} />
      <InnerStack.Screen name="CreateEdit" component={CreateEditScreen} options={({ route }) => ({ title: route.params.title })} />
      <InnerStack.Screen name="Details" component={ShowScreen} />
    </InnerStack.Navigator>
  )
}