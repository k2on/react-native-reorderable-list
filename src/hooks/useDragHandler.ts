import ReorderableCellContext from '@library/contexts/ReorderableCellContext';
import useLibraryContext from '@library/hooks/useLibraryContext';

const useDragHandler = () => {
  const {dragHandler} = useLibraryContext(ReorderableCellContext);
  return dragHandler;
};

export default useDragHandler;
