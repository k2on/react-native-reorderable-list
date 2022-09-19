import React from 'react';

interface ReorderableCellContextData {
  index: number;
  dragHandler: () => void;
}

const ReorderableCellContext = React.createContext<
  ReorderableCellContextData | undefined
>(undefined);

export default ReorderableCellContext;
