import React, {useState} from 'react';
import {
  ListRenderItemInfo,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
} from 'react-native-reorderable-list';

import playlistData from './data.json';
import PlaylistItem from './PlaylistItem';
import PlaylistItemSeparator from './PlaylistItemSeparator';

const Playlist = () => {
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
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      style={styles.list}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={PlaylistItemSeparator}
      safeAreaTopInset={Platform.OS === 'ios' ? StatusBar.currentHeight : 0}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default Playlist;
