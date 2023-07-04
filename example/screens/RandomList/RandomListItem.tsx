import React, {useState} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import {
  ReorderableAnimation,
  useDragHandler,
} from 'react-native-reorderable-list';

interface RandomListItemProps {
  id: string;
  height: number;
}

const RandomListItem: React.FC<RandomListItemProps> = ({id, height}) => {
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

const styles = StyleSheet.create({
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
});

export default RandomListItem;
