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
  animationDuration: number;
  itemOffsets: Animated.SharedValue<ItemOffset>[];
  draggedIndex: Animated.SharedValue<number>;
  currentIndex: Animated.SharedValue<number>;
  draggedItemY: Animated.SharedValue<number>;
  draggedItemScale: Animated.SharedValue<number>;
  children: React.ReactNode;
}

const ReorderableListItem: React.FC<ReorderableListItemProps> = ({
  index,
  animationDuration,
  itemOffsets,
  draggedIndex,
  currentIndex,
  draggedItemScale,
  draggedItemY,
  ...rest
}) => {
  const itemTranslateY = useSharedValue(0);
  const itemIndex = useSharedValue(-1);

  useEffect(() => {
    itemIndex.value = index;
  }, [itemIndex, index]);

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

        if (newValue !== itemTranslateY.value) {
          itemTranslateY.value = withTiming(newValue, {
            duration: animationDuration,
            easing: Easing.out(Easing.ease),
          });
        }
      }
    },
  );

  const animatedStyle = useAnimatedStyle(() => {
    let scale = 1;
    let zIndex = 0;

    if (itemIndex.value === draggedIndex.value) {
      itemTranslateY.value = draggedItemY.value;
      scale = draggedItemScale.value;
      zIndex = 999;
    }

    return {
      transform: [{translateY: itemTranslateY.value}, {scale}],
      zIndex,
    };
  });

  return <Animated.View {...rest} style={[rest.style, animatedStyle]} />;
};

export default ReorderableListItem;
