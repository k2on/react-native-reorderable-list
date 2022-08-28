import {useContext} from 'react';

import DragContext from '@library/context/DragContext';

const useDragHandler = () => {
  const dragHandler = useContext(DragContext);
  return dragHandler;
};

export default useDragHandler;
