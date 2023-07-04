import React from 'react';
import {StyleSheet, View} from 'react-native';

const ItemSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: 'lightgray',
  },
});

export default ItemSeparator;
