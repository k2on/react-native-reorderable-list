import {useContext} from 'react';

const useLibraryContext = <T>(context: React.Context<T | undefined>) => {
  const value = useContext(context);

  if (value !== undefined) {
    return value;
  }

  throw 'Please consume ReorderableList context within its provider.';
};

export default useLibraryContext;
