import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  ListRenderItemInfo,
  Text,
  SafeAreaView,
  Button,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import ReorderableList, {
  useDragHandler,
  ReorderableListReorderEvent,
  ReorderableAnimation,
} from 'react-native-reorderable-list';

interface CardInfo {
  id: string;
  height: number;
}

const newList = Array(20)
  .fill(null)
  .map((_, i) => ({
    id: i.toString(),
    height: Math.floor(Math.random() * 100),
  }));

const list: CardInfo[] = Array(100)
  .fill(null)
  .map((_, i) => ({
    id: i.toString(),
    height: Math.floor(Math.random() * 100),
  }));

const Card: React.FC<CardInfo> = ({id, height}) => {
  const handleDrag = useDragHandler();
  const [number, setNumber] = useState(0);

  return (
    <ReorderableAnimation>
      <Pressable
        style={[styles.card, {height}]}
        onPress={() => setNumber(number + 1)}
        onLongPress={handleDrag}>
        <Text style={styles.text}>
          {id}-{number}
        </Text>
      </Pressable>
    </ReorderableAnimation>
  );
};

const App = () => {
  const [data, setData] = useState(list);

  const renderItem = ({item}: ListRenderItemInfo<CardInfo>) => (
    <Card {...item} />
  );

  const handleReorder = ({fromIndex, toIndex}: ReorderableListReorderEvent) => {
    const newData = [...data];
    newData.splice(toIndex, 0, newData.splice(fromIndex, 1)[0]);
    setData(newData);
  };

  return (
    <SafeAreaView style={styles.fill}>
      <GestureHandlerRootView style={styles.fill}>
        <ReorderableList
          data={data}
          onReorder={handleReorder}
          renderItem={renderItem}
          containerStyle={styles.fill}
          keyExtractor={(item) => item.id}
        />
      </GestureHandlerRootView>
      <Button title="Test" onPress={() => setData(newList)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderRadius: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  text: {
    fontSize: 20,
  },
  button: {
    height: 60,
    backgroundColor: 'lightblue',
  },
});

export default App;
