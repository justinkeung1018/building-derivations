export interface InputState {
  isEditing: boolean;
  edited: boolean; // Focus input when we try to edit from the second time onwards
  value: string;
  latex: string;
}

export interface ArgumentInputState {
  index: number;
  autofocus: boolean;
  conclusionInputState: InputState;
  ruleNameInputState: InputState;
  conclusionIndex: number | null;
  premiseIndices: number[];
}

export function getDefaultState(index: number, conclusionIndex: number | null): ArgumentInputState {
  return {
    index,
    autofocus: index !== 0, // Autofocus for newly generated inputs
    conclusionInputState: {
      isEditing: true,
      edited: false,
      value: "",
      latex: "",
    },
    ruleNameInputState: {
      isEditing: false,
      edited: false,
      value: "",
      latex: "",
    },
    conclusionIndex,
    premiseIndices: [],
  };
}
