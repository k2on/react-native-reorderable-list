export interface ItemOffset {
  length: number;
  offset: number;
}

export enum ReorderableListState {
  IDLE = 0,
  DRAGGING,
  RELEASING,
  AUTO_SCROLL,
}
