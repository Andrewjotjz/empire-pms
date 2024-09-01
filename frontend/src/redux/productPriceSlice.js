import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    productPriceState: null
}

export const productPriceSlice = createSlice({
    name: 'productPriceSlice',
    initialState,
    reducers: {
        setProductPrice: (state, action) => {
            state.productPriceState = action.payload
        },
        clearProductPrice: (state) => {
            state.productPriceState = null
        }
    }
})

export const { setProductPrice, clearProductPrice } = productPriceSlice.actions

export default productPriceSlice.reducer