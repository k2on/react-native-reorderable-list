/* eslint-disable no-restricted-imports */
import React, {useState} from 'react';
import {
  StyleSheet,
  ListRenderItemInfo,
  SafeAreaView,
  Text,
  Platform,
  StatusBar,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ReorderableList, {
  ReorderableListReorderEvent,
} from 'react-native-reorderable-list';

import PlaylistItem from './screens/Playlist/PlaylistItem';
import PlaylistItemSeparator from './screens/Playlist/PlaylistItemSeparator';
import playlistData from './screens/Playlist/data.json';

const App = () => {
  const [data, setData] = useState(playlistData);

  const renderItem = ({item}: ListRenderItemInfo<any>) => (
    <PlaylistItem {...item} />
  );

  const handleReorder = ({fromIndex, toIndex}: ReorderableListReorderEvent) => {
    const newData = [...data];
    newData.splice(toIndex, 0, newData.splice(fromIndex, 1)[0]);
    setData(newData);
  };

  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <Text style={styles.title}>Playlist</Text>
        <ReorderableList
          data={data}
          onReorder={handleReorder}
          renderItem={renderItem}
          containerStyle={styles.fill}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={PlaylistItemSeparator}
          safeAreaTopInset={Platform.OS === 'ios' ? StatusBar.currentHeight : 0}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  title: {
    color: 'black',
    fontSize: 32,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fill: {
    flex: 1,
  },
});

export default App;
