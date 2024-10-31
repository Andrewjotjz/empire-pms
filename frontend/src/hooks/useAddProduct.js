//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
 

export const useAddProduct = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const addProduct = async (productState) => {
        setIsLoadingState(true)
        setErrorState(null)

        const postProduct = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product/create`, {
                    credentials: 'include', method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    },
                    body: JSON.stringify(productState)
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to POST new product details')
                }
                if (res.ok) {                
                    alert(`Product added to supplier!`);
                
                    // update loading state
                    setIsLoadingState(false)

                    return data.newProduct._id

                }
            } catch (error) {
                setErrorState(error.message);
                setIsLoadingState(false);
            }
        }
        return postProduct();
    }

    return { addProduct, isLoadingState, errorState };
}