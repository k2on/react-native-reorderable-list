import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import useAnimatedDrag from '@library/hooks/useAnimatedDrag';
import {ReorderableAnimationOptions} from '@library/types/props';

interface UseReorderableAnimationArgs {
  scaleOptions: ReorderableAnimationOptions;
  opacityOptions: ReorderableAnimationOptions;
}

const useReorderableAnimation = ({
  scaleOptions,
  opacityOptions,
}: UseReorderableAnimationArgs) => {
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
        scale.value = withTiming(scaleOptions.valueDragEnd, {
          easing: scaleOptions.easingDragEnd,
          duration: scaleOptions.duration,
        });
      }

      if (opacityOptions.enabled) {
        opacity.value = withTiming(opacityOptions.valueDragEnd, {
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

  return {animatedStyle};
};

export default useReorderableAnimation;
