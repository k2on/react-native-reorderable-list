import React from 'react';

const DragContext = React.createContext<(() => void) | undefined>(undefined);

export default DragContext;
