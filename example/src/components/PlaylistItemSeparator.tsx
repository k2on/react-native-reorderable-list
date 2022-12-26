import React from 'react';
import {View, StyleSheet} from 'react-native';

const PlaylistItemSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  separator: {
    height: 1,
    marginLeft: 74,
    backgroundColor: 'lightgray',
  },
});

export default PlaylistItemSeparator;
