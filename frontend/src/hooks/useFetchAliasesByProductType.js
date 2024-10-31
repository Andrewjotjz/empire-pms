//import modules and files
import { useState } from 'react'
import { useDispatch } from 'react-redux';
import { setAliases } from '../redux/aliasSlice';

export const useFetchAliasesByProductType = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    //Hook declaration
    const dispatch = useDispatch();

    //Component's function
    const fetchAliasesByProductType = async (productType) => {
        setIsLoadingState(true)
        setErrorState(null)

        const getAliasesByProductType = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product/type/${productType}`, {
                    credentials: 'include', method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to GET aliases by product type')
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
        getAliasesByProductType();
    }

    return { fetchAliasesByProductType, isLoadingState, errorState };
}
