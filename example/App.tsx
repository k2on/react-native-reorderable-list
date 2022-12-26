/* eslint-disable no-restricted-imports */
import React, {useState} from 'react';
import {StyleSheet, ListRenderItemInfo, SafeAreaView} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import ReorderableList, {
  ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import PlaylistItem from './src/components/PlaylistItem';
import PlaylistItemSeparator from './src/components/PlaylistItemSeparator';

const list = Array(20)
  .fill(null)
  .map((_, i) => ({id: i.toString()}));

const App = () => {
  const [data, setData] = useState(list);

  const renderItem = ({item}: ListRenderItemInfo<any>) => <PlaylistItem />;

  const handleReorder = ({fromIndex, toIndex}: ReorderableListReorderEvent) => {
    const newData = [...data];
    newData.splice(toIndex, 0, newData.splice(fromIndex, 1)[0]);
    setData(newData);
  };

  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <ReorderableList
          data={data}
          onReorder={handleReorder}
          renderItem={renderItem}
          containerStyle={styles.fill}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={PlaylistItemSeparator}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

export default App;
