import React from 'react';
import {StyleSheet, Text, FlatList, View} from 'react-native';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';

import screens from '@screens/screens';

const Home = () => {
  const navigation = useNavigation<any>();

  return (
    <FlatList
      data={screens}
      renderItem={(x) => (
        <TouchableHighlight
          style={styles.item}
          onPress={() => navigation.navigate(x.item.name)}>
          <Text style={styles.text}>{x.item.name}</Text>
        </TouchableHighlight>
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: 'lightgray',
  },
});

export default Home;
