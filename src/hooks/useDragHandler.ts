import ReorderableCellContext from '../contexts/ReorderableCellContext';
import useLibraryContext from '../hooks/useLibraryContext';

const useDragHandler = () => {
  const {dragHandler} = useLibraryContext(ReorderableCellContext);
  return dragHandler;
};

export default useDragHandler;
