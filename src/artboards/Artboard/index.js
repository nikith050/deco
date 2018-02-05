
import React, { Component } from 'react'
import {
  View,

} from 'react-native'



import styles from './styles.js'

export default class Artboard extends Component {
  render() {
    return (
      <View style={styles.Artboard} >
        <View style={styles.Rectangle}></View>
      </View>
    )
  }
}
