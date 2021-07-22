import React from 'react'
import { StyleSheet, View, Text, TextInput } from 'react-native';

import { commonStyles, darkStyles, lightStyles } from "../styles/commonStyles";

export default function TextInputWithError(props) {
  const styles = { ...commonStyles, ...(props.isDark ? darkStyles : lightStyles) };

  return (
    <View style={{width: props.width, marginBottom: 20}}>
      <View style={[styles.inputView, props.ErrorText ? additionalStyles.errorBorder : null, props.center ? ({alignItems: "center"}) : null]}>
        <TextInput
          style={styles.textInput}
          autoCapitalize={props.autoCapitalize ? "sentences" : "none"}
          autoCorrect={props.autoCapitalize}
          placeholder={props.placeholder}
          placeholderTextColor="#003f5c"
          secureTextEntry={props.secureTextEntry}
          value={props.value}
          onChangeText={(text) => props.setData(text)}
        />
      </View>
      {props.ErrorText ? (<Text style={[styles.errorText, {alignSelf: "center"}]}>{props.ErrorText}</Text>) : (<View />)}     
    </View>
  )
}

const additionalStyles = StyleSheet.create({
  errorBorder: {
    borderWidth: 3,
    borderColor: "red",
  }
});
