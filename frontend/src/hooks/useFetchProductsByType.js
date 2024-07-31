//import modules and files
import { useState } from 'react'
import { useDispatch } from 'react-redux';
import { setAliases } from '../redux/aliasSlice';

export const useFetchProductsByType = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    //Hook declaration
    const dispatch = useDispatch();

    //Component's function
    const fetchProductsByType = async (productType) => {
        setIsLoadingState(true)
        setErrorState(null)

        const getProductsByType = async () => {
            try {
                const res = await fetch(`/api/product/type/${productType}`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to POST new employee details')
                }
                if (res.ok) {
                    //store filtered data to productState
                    dispatch(setAliases(data))
                }
            } catch (error) {
                setErrorState(error.message);
                setIsLoadingState(false);
            }
        }
        getProductsByType();
    }

    return { fetchProductsByType, isLoadingState, errorState };
}
