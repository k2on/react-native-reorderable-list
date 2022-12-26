import React from 'react';
import {Pressable, Text, Image, View, StyleSheet} from 'react-native';

import {
  useDragHandler,
  ReorderableAnimation,
} from 'react-native-reorderable-list';

const PlaylistItem: React.FC = () => {
  const handleDrag = useDragHandler();

  return (
    <ReorderableAnimation>
      <Pressable style={styles.container} onLongPress={handleDrag}>
        <Image
          style={styles.image}
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/en/2/24/GnarlsBarkleyCrazyCover.JPG',
          }}
        />
        <View style={styles.right}>
          <Text style={styles.title}>Crazy</Text>
          <Text style={styles.author}>Gnarls Barkley</Text>
        </View>
      </Pressable>
    </ReorderableAnimation>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 4,
  },
  right: {
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
  },
  author: {
    fontSize: 14,
    color: 'gray',
  },
});

export default PlaylistItem;
