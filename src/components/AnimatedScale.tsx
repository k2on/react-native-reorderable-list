import React from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import useAnimatedDrag from '@library/hooks/useAnimatedDrag';
import {ReorderableAnimatedScaleProps} from '@library/types/props';

const AnimatedScale: React.FC<ReorderableAnimatedScaleProps> = ({
  dragStartScale = 1.025,
  dragEndScale = 1,
  easingDragStart = Easing.in(Easing.ease),
  easingDragEnd = Easing.out(Easing.ease),
  animationDuration = 200,
  ...rest
}) => {
  const scale = useSharedValue(dragEndScale);

  useAnimatedDrag(
    {
      onStart: () => {
        'worklet';

        scale.value = withTiming(dragStartScale, {
          easing: easingDragStart,
          duration: animationDuration,
        });
      },
      onRelease: () => {
        'worklet';

        scale.value = withTiming(dragEndScale, {
          easing: easingDragEnd,
          duration: animationDuration,
        });
      },
    },
    [dragStartScale, dragEndScale, easingDragStart, easingDragEnd],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  return <Animated.View {...rest} style={[animatedStyle, rest.style]} />;
};

export default AnimatedScale;
