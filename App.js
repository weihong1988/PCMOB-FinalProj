import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import { MaterialCommunityIcons } from '@expo/vector-icons'; 

import BlogStack from "./components/BlogStack";
import SignInSignUpScreen from "./screens/SignInSignUpScreen";
import CameraScreen from "./screens/CameraScreen";
import AccountScreen from "./screens/AccountScreen";

import { useSelector, useDispatch, Provider } from 'react-redux';
import { commonStyles, darkStyles, lightStyles } from "./styles/commonStyles";

import store from "./redux/configureStore"

const Stack = createStackNavigator();
const LoggedInTab = createBottomTabNavigator();

function LoggedInStackComponent() {
  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...isDark ? darkStyles : lightStyles };

  return (
    <LoggedInTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Account')
            iconName = "account-cog";
          else
            iconName = "camera-burst"; 

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: isDark ? '#f4d47c' : 'darkblue',
        inactiveTintColor: 'gray',
        style: {
          paddingBottom: 5,
          backgroundColor: isDark ? '#181818' : 'white',
        }
      }}
      initialRouteName="AccountStack"
    >
      <LoggedInTab.Screen name="Blog" component={BlogStack} />
      <LoggedInTab.Screen name="Account" component={AccountScreen} options={{
        title: "Your Account",
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerLeft: null
      }} />
    </LoggedInTab.Navigator>
  );
}

export default function AppWrapper() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

function App() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  const token = useSelector(state => state.auth.token);

  const isDark = useSelector(state => state.account.isDark);
  const styles = { ...commonStyles, ...isDark ? darkStyles : lightStyles };

  function loadToken() {
    if (token != null) {
      setSignedIn(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadToken();
  }, []);

  return loading ? (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  ) : (
    <NavigationContainer>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Navigator mode="modal" initialRouteName={signedIn ? "LoggedInStack" : "SignInSignUp"} animationEnabled={false}>
        <Stack.Screen component={LoggedInStackComponent} name="LoggedInStack" options={{headerShown: false}} />
        <Stack.Screen component={SignInSignUpScreen} name="SignInSignUp" options={{headerShown: false}} />
        <Stack.Screen component={CameraScreen} name="Camera" options={{
          title: "Take a photo",
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTintColor: styles.headerTint
        }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
