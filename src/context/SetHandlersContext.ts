import React from 'react';

export interface DragHandlers {
  start: () => void;
  release: () => void;
  end: () => void;
}

export type SetHandlersFunc = (index: number, handlers: DragHandlers) => number;

export type RemoveHanldersFunc = (index: number, handlerRef: number) => void;

interface SetHandlersContextData {
  setHandlers: SetHandlersFunc;
  removeHandlers: RemoveHanldersFunc;
}

const SetHandlersContext = React.createContext<SetHandlersContextData>(
  undefined as any,
);

export default SetHandlersContext;
