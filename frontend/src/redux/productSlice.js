import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    productState: null
}

export const productSlice = createSlice({
    name: 'productSlice',
    initialState,
    reducers: {
        setProductState: (state, action) => {
            state.productState = action.payload
        },
        clearProductState: (state) => {
            state.productState = null
        }
    }
})

export const { setProductState, clearProductState } = productSlice.actions

export default productSlice.reducer