import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    localUserState: null
}

export const localUserSlice = createSlice({
    name: 'localUserSlice',
    initialState,
    reducers: {
        setLocalUser: (state,action) => {
            state.localUserState = action.payload
        },
        clearLocalUser: (state) => {
            state.localUserState = null
        }
    }
})

export const { setLocalUser, clearLocalUser } = localUserSlice.actions;

export default localUserSlice.reducer;