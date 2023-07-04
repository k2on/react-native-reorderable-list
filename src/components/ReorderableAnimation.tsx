import React from 'react';

import Animated, {Easing} from 'react-native-reanimated';

import useReorderableAnimation from '../hooks/useReorderableAnimation';
import type {ReorderableAnimationProps} from '../types/props';

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
  const {animatedStyle} = useReorderableAnimation({
    scaleOptions,
    opacityOptions,
  });

  return <Animated.View {...rest} style={[animatedStyle, rest.style]} />;
};

export default ReorderableAnimation;
