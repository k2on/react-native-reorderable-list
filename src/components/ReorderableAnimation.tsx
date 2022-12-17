import React from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import useAnimatedDrag from '@library/hooks/useAnimatedDrag';
import {ReorderableAnimationProps} from '@library/types/props';

const scaleDefaultOptions = {
  enabled: true,
  valueDragEnd: 1,
  valueDragStart: 1.025,
  easingDragStart: Easing.in(Easing.ease),
  easingDragEnd: Easing.out(Easing.ease),
  duration: 200,
};

const opacityDefaultOptions = {
  enabled: true,
  valueDragEnd: 1,
  valueDragStart: 0.75,
  easingDragStart: Easing.in(Easing.ease),
  easingDragEnd: Easing.out(Easing.ease),
  duration: 200,
};

const ReorderableAnimation: React.FC<ReorderableAnimationProps> = ({
  scaleOptions = scaleDefaultOptions,
  opacityOptions = opacityDefaultOptions,
  ...rest
}) => {
  const scale = useSharedValue(
    scaleOptions.enabled ? scaleOptions.valueDragEnd : 1,
  );
  const opacity = useSharedValue(
    opacityOptions.enabled ? opacityOptions.valueDragEnd : 1,
  );

  useAnimatedDrag({
    onStart: () => {
      'worklet';

      if (scaleOptions.enabled) {
        scale.value = withTiming(scaleOptions.valueDragStart, {
          easing: scaleOptions.easingDragStart,
          duration: scaleOptions.duration,
        });
      }

      if (opacityOptions.enabled) {
        opacity.value = withTiming(opacityOptions.valueDragStart, {
          easing: opacityOptions.easingDragStart,
          duration: opacityOptions.duration,
        });
      }
    },
    onRelease: () => {
      'worklet';

      if (scaleOptions.enabled) {
        scale.value = withTiming(scaleOptions.valueDragStart, {
          easing: scaleOptions.easingDragEnd,
          duration: scaleOptions.duration,
        });
      }

      if (opacityOptions.enabled) {
        opacity.value = withTiming(opacityOptions.valueDragStart, {
          easing: opacityOptions.easingDragEnd,
          duration: opacityOptions.duration,
        });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View {...rest} style={[animatedStyle, rest.style]} />;
};

export default ReorderableAnimation;
