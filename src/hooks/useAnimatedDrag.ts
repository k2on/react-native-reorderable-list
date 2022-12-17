import {DependencyList, useEffect} from 'react';
import {useAnimatedReaction} from 'react-native-reanimated';

import useLibraryContext from '@library/hooks/useLibraryContext';
import ReorderableCellContext from '@library/contexts/ReorderableCellContext';
import ReorderableListContext from '@library/contexts/ReorderableListContext';

interface UseAnimatedDragHandlers {
  onStart?: () => void;
  onRelease?: () => void;
  onEnd?: () => void;
}

const useAnimatedDrag = (
  {onStart, onRelease, onEnd}: UseAnimatedDragHandlers,
  deps: DependencyList,
) => {
  const {currentIndex} = useLibraryContext(ReorderableListContext);
  const {dragged, released, index} = useLibraryContext(ReorderableCellContext);

  useAnimatedReaction(
    () => dragged.value,
    (newValue) => {
      if (newValue && onStart) {
        onStart();
      }
    },
    deps,
  );

  useAnimatedReaction(
    () => released.value,
    (newValue) => {
      if (newValue) {
        released.value = false;

        if (onRelease) {
          onRelease();
        }
      }
    },
    deps,
  );

  useEffect(() => {
    if (currentIndex.value === index) {
      currentIndex.value = -1;

      if (onEnd) {
        onEnd();
      }
    }
  }, [currentIndex, index, onEnd]);
};

export default useAnimatedDrag;
