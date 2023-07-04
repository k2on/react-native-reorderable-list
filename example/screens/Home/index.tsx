import React from 'react';
import {FlatList, StyleSheet, Text} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {TouchableHighlight} from 'react-native-gesture-handler';

import ItemSeparator from './ItemSeparator';
import screens from '../screens';

const Home = () => {
  const navigation = useNavigation<any>();

  return (
    <FlatList
      data={screens}
      renderItem={x => (
        <TouchableHighlight
          style={styles.item}
          onPress={() => navigation.navigate(x.item.name)}>
          <Text style={styles.text}>{x.item.name}</Text>
        </TouchableHighlight>
      )}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  item: {
    padding: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: 'black',
  },
});

export default Home;
