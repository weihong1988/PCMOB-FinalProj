import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Keyboard, ScrollView } from 'react-native';
import { HelperText, TextInput, Button, Snackbar } from 'react-native-paper';
import { ActivityIndicator, Text, Title, Subheading, Paragraph, Headline, Caption } from 'react-native-paper';

import {SMS_API, SMS_USERNAME, SMS_PASSWORD } from "../secrets/keys";
import { API, API_LOGIN, API_VERIFYOTP } from '../constants/API';
import axios from 'axios';

import getLoggedInUser from "../components/LogInHelper";

import { commonStyles} from "../styles/commonStyles";
import { useDispatch, useSelector } from 'react-redux';

import { logInAction, logOutAction } from '../redux/ducks/blogAuth';

const totp = require("totp-generator");
const base64 = require("base-64");

export default function OTPVerifyScreen({ route, navigation }) {
  const username = route.params.username;
  const password = route.params.password;
  const phoneNo = route.params.phoneNo;

  const [OTPtext, setOTPtext] = useState("");
  const [OTPtextError, setOTPtextError] = useState("");
  const [OTPsent, setOTPsent] = useState(false);
  const [OTPsentMsgVisible, setOTPsentMsgVisible] = React.useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const dispatch = useDispatch();

  async function DoLogIn() {
    try {
      setLoading(true);
      setErrorText("");

      const response = await axios.post(API + API_LOGIN, {
        username,
        password,
      });

      dispatch({...logInAction(), payload: response.data.access_token})

      getLoggedInUser(dispatch, response.data.access_token);

      setOTPtext("");
      setLoading(false);

      navigation.navigate("LoggedInStack");
    }
    catch (error) {
      setLoading(false);
      console.log(error);

      if (error.response.data)
        setErrorText(error.response.data);
    }
  }

  async function GetOTP(phone) {
    const OTPtimestamp = Math.floor(Date.now() / 1000);
    const OTPtoken = totp(base64.encode(username), { period: 60 });
    const MsgString = `Your PCMOB-7 account verification code is ${OTPtoken}.`;

    try {
      setLoading(true);
      setOTPsent(true);
      setOTPsentMsgVisible(true);

      const SMSresponse = await axios.post(API + API_VERIFYOTP, {
        username,
        OTPtimestamp,
      });

      const response = await axios.get(SMS_API, {
        params: { 
          user: SMS_USERNAME,
          pwd: SMS_PASSWORD,
          option: "send",
          to: phone,
          msg: MsgString,
        }
      });

      setLoading(false);
    }
    catch (error) {
      setLoading(false);
      console.log(error);

      if (error.response.data)
        setErrorText(error.response.data);
    }
  }

  async function verifyOTP(OTPtext) {
    if (OTPtext == "") {
      setOTPtextError("Please enter a valid OTP");
    }
    else {
      setOTPtextError("");
      setLoading(true);

      try {
        const response = await axios.post(API + API_VERIFYOTP, {
          username,
          OTPtext,
        });

        //await DoLogIn();
      }
      catch (error) {
        setLoading(false);
        console.log(error);

        if (error.response.data)
          setErrorText(error.response.data);
      }
    }
  }

  return (
    <View style={[commonStyles.container, {paddingTop: 30}]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Headline style={[commonStyles.pageTitle, {marginBottom: 20}]}>Account Verification</Headline>

        <Text style={{width: "70%", marginTop: 20}}>A 6 digit verification code will be sent to your mobile number:</Text>
        <Title style={{marginBottom: 20}}>{phoneNo}</Title>
        <Text style={{width: "70%", marginBottom: 20}}>The verification code will be valid for 60 seconds.</Text>

        <View style={{flexDirection: "row", width: "70%", justifyContent: "center", alignItems: "center", marginBottom: 20}}>
          <View style={{flex: 1, marginRight: 15}}>
            <TextInput mode="outlined" style={commonStyles.textInput} label="Verification Code" error={OTPtextError ? true : false} keyboardType="number-pad" autoCapitalize="none" value={OTPtext} onChangeText={data => setOTPtext(data)} />
            <HelperText type="error" visible={OTPtextError ? true : false}>{OTPtextError}</HelperText>
          </View>

          <Button mode="contained" style={{marginBottom: 10}} disabled={OTPsent} onPress={() => {GetOTP(phoneNo);}}>Get OTP</Button>
        </View>

        <View style={{flexDirection: "row", justifyContent: 'center', marginTop: 20}}>
          <Button mode="contained" onPress={() => {verifyOTP(OTPtext)}}>Verify Account</Button>
          {loading ? <ActivityIndicator style={{ marginLeft: 20 }} size="small" /> : <View/>}
        </View>

        <Snackbar
          visible={OTPsentMsgVisible}
          onDismiss={() => {setOTPsentMsgVisible(false)}}
          action={{
            label: 'Dismiss',
            onPress: () => {setOTPsentMsgVisible(false)},
          }}
          duration={3000}
        >SMS OTP Sent</Snackbar>

        <Text style={{color: "red", marginTop: 10, fontSize: 18}}>{errorText}</Text>
      </ScrollView>
    </View>
  );
}
