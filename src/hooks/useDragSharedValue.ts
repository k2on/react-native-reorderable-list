import {useContext} from 'react';

import ReorderableCellContext from '@library/context/ReorderableCellContext';
import DraggedContext from '@library/context/DraggedContext';

const useDragSharedValue = () => {
  const {index} = useContext(DraggedContext);
  const {dragged} = useContext(ReorderableCellContext);

  return dragged[index];
};

export default useDragSharedValue;
