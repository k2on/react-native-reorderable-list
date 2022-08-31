import DragContext from '@library/context/DragContext';
import useLibraryContext from '@library/hooks/useLibraryContext';

const useDragHandler = () => {
  const dragHandler = useLibraryContext(DragContext);
  return dragHandler;
};

export default useDragHandler;
