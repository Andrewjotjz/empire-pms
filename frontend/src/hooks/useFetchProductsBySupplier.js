//import modules and files
import { useState } from 'react'
import { useDispatch } from 'react-redux';
import { setProductState } from '../redux/productSlice';

export const useFetchProductsBySupplier = () => {
    //Component's hook state declaration
    const [isFetchProductsLoadingState, setIsFetchProductsLoadingState] = useState(false);
    const [fetchProductsErrorState, setFetchProductsErrorState] = useState(null);

    //Hook declaration
    const dispatch = useDispatch();

    //Component's function
    const fetchProductsBySupplier = async (id) => {
        setIsFetchProductsLoadingState(true)
        setFetchProductsErrorState(null)

        const getProducts = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier/${id}/products`, {
                    credentials: 'include', method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to GET products by supplier')
                }
                if (res.ok) {
                    //store data to productState
                    dispatch(setProductState(data))
                    setIsFetchProductsLoadingState(false)
                }
            } catch (error) {
                setFetchProductsErrorState(error.message);
                setIsFetchProductsLoadingState(false);
            }
        }
        getProducts();
    }

    return { fetchProductsBySupplier, isFetchProductsLoadingState, fetchProductsErrorState };
}
