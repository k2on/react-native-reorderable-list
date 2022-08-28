import React, {useContext} from 'react';

export const DragContext = React.createContext<() => void>(undefined as any);

const useDragHandler = () => {
  const dragHandler = useContext(DragContext);
  return dragHandler;
};

export default useDragHandler;
