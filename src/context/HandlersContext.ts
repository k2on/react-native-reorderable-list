import React from 'react';

export interface Handlers {
  start: () => void;
  release: () => void;
  end: () => void;
}

export type SetHandlersFunc = (index: number, handlers: Handlers) => number;

export type RemoveHandlersFunc = (index: number, handlerRef: number) => void;

interface HandlersContextData {
  setHandlers: SetHandlersFunc;
  removeHandlers: RemoveHandlersFunc;
}

const HandlersContext = React.createContext<HandlersContextData | undefined>(
  undefined,
);

export default HandlersContext;
