import React, { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { DarkTheme as PaperDarkTheme, DefaultTheme as PaperDefaultTheme, Provider as PaperProvider, } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

import BlogStack from "./components/BlogStack";
import SignInSignUpScreen from "./screens/SignInSignUpScreen";
import CameraScreen from "./screens/CameraScreen";
import AccountScreen from "./screens/AccountScreen";
import BrowseStackComponent from "./components/BrowseStack";
import SearchStackComponent from "./components/SearchStack";

import { useSelector, useDispatch, Provider } from 'react-redux';
import { commonStyles } from "./styles/commonStyles";

import store from "./redux/configureStore"

const Stack = createStackNavigator();
const LoggedInTab = createBottomTabNavigator();

const CombinedDefaultTheme = {
  ...PaperDefaultTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
  },
};

const CombinedDarkTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    ...NavigationDarkTheme.colors,
  },
};

function LoggedInStackComponent() {
  const { colors } = useTheme();

  return (
    <LoggedInTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Account')
            iconName = "account-cog";
          else if (route.name === 'BrowseStack')
            iconName = "apple-safari";
          else if (route.name === 'SearchStack')
            iconName = "feature-search-outline";
          else 
            iconName = "apps"; 

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        style: { paddingBottom: 5 }
      }}
      initialRouteName="AccountStack"
    >
      <LoggedInTab.Screen name="Blog" component={BlogStack} options={{title: "My Gallery"}}/>
      <LoggedInTab.Screen name="BrowseStack" component={BrowseStackComponent} options={{title: "Explore"}}/>
      <LoggedInTab.Screen name="SearchStack" component={SearchStackComponent} options={{title: "Search"}}/>
      <LoggedInTab.Screen name="Account" component={AccountScreen} options={{
        title: "My Account",
        headerStyle: commonStyles.header,
        headerTitleStyle: commonStyles.headerTitle,
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
    <View style={commonStyles.centeredContainer}>
      <ActivityIndicator />
    </View>
  ) : (
    <PaperProvider theme={isDark ? CombinedDarkTheme : CombinedDefaultTheme}>
      <NavigationContainer theme={isDark ? CombinedDarkTheme : CombinedDefaultTheme}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack.Navigator mode="modal" initialRouteName={signedIn ? "LoggedInStack" : "SignInSignUp"} animationEnabled={false}>
          <Stack.Screen component={LoggedInStackComponent} name="LoggedInStack" options={{headerShown: false}} />
          <Stack.Screen component={SignInSignUpScreen} name="SignInSignUp" options={{headerShown: false}} />
          <Stack.Screen component={CameraScreen} name="Camera" options={{ title: "Take a photo" }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
