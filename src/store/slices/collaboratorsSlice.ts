



import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Collaborator } from '../../types';

interface CollaboratorsState {
    collaborators: Collaborator[];
}

const initialState: CollaboratorsState = {
    collaborators: [],
};

const collaboratorsSlice = createSlice({
    name: 'collaborators',
    initialState,
    reducers: {
        setCollaborators: (state, action: PayloadAction<Collaborator[]>) => {
            state.collaborators = [...action.payload].sort((a,b) => a.nome.localeCompare(b.nome));
        },
        addCollaborator: (state, action: PayloadAction<Collaborator>) => {
            state.collaborators.push(action.payload);
            state.collaborators.sort((a,b) => a.nome.localeCompare(b.nome));
        },
        updateCollaborator: (state, action: PayloadAction<Collaborator>) => {
            const index = state.collaborators.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.collaborators[index] = action.payload;
                state.collaborators.sort((a,b) => a.nome.localeCompare(b.nome));
            }
        },
        deleteCollaboratorReducer: (state, action: PayloadAction<string>) => { // Renamed
            state.collaborators = state.collaborators.filter(c => c.id !== action.payload);
        },
        restoreCollaborator: (state, action: PayloadAction<Collaborator>) => {
            if (!state.collaborators.some(c => c.id === action.payload.id)) {
                state.collaborators.push(action.payload);
                state.collaborators.sort((a,b) => a.nome.localeCompare(b.nome));
            }
        },
        clearCollaborators: (state) => {
            state.collaborators = [];
        },
    },
});

export const { setCollaborators, addCollaborator, updateCollaborator, deleteCollaboratorReducer, restoreCollaborator, clearCollaborators } = collaboratorsSlice.actions;
export default collaboratorsSlice.reducer;
