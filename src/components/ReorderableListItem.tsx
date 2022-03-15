import React, {useEffect} from 'react';
import {ViewProps} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  useSharedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';

import {ItemOffset} from 'types/misc';

interface ReorderableListItemProps extends Animated.AnimateProps<ViewProps> {
  index: number;
  itemOffsets: Animated.SharedValue<ItemOffset>[];
  draggedIndex: Animated.SharedValue<number>;
  currentIndex: Animated.SharedValue<number>;
  draggedItemY: Animated.SharedValue<number>;
  draggedItemScale: Animated.SharedValue<number>;
  children: React.ReactNode;
}

const ReorderableListItem: React.FC<ReorderableListItemProps> = ({
  index,
  itemOffsets,
  draggedIndex,
  currentIndex,
  draggedItemScale,
  draggedItemY,
  children,
  ...rest
}) => {
  const translateY = useSharedValue(0);
  const itemIndex = useSharedValue(-1);

  useEffect(() => {
    itemIndex.value = index;
  });

  useAnimatedReaction(
    () => currentIndex.value,
    () => {
      if (
        itemIndex.value !== draggedIndex.value &&
        currentIndex.value >= 0 &&
        draggedIndex.value >= 0
      ) {
        const moveDown = currentIndex.value > draggedIndex.value;
        const startMove = Math.min(draggedIndex.value, currentIndex.value);
        const endMove = Math.max(draggedIndex.value, currentIndex.value);
        let newValue = 0;

        if (itemIndex.value >= startMove && itemIndex.value <= endMove) {
          const draggedHeight = itemOffsets[draggedIndex.value].value.length;
          newValue = moveDown ? -draggedHeight : draggedHeight;
        }

        if (newValue !== translateY.value) {
          translateY.value = withTiming(newValue, {
            duration: 100,
            easing: Easing.out(Easing.ease),
          });
        }
      }
    },
  );

  // TODO: improve
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateY: translateY.value},
      {
        translateY:
          itemIndex.value === draggedIndex.value ? draggedItemY.value : 0,
      },
      {
        scale:
          itemIndex.value === draggedIndex.value ? draggedItemScale.value : 1,
      },
    ],
    zIndex: itemIndex.value === draggedIndex.value ? 999 : undefined,
    elevation: itemIndex.value === draggedIndex.value ? 999 : undefined,
  }));

  return (
    <Animated.View {...rest} style={[rest.style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

export default ReorderableListItem;
