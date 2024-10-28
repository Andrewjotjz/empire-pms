//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

export const useUpdateProduct = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const updateProduct = async (productState, productPriceState, productId, productPriceId) => {
        setIsLoadingState(true)
        setErrorState(null)

        const putProduct = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product/${productId}`, {
                    credentials: 'include', method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({productState, productPriceState, productPriceId})
                })

                const promise = await res.json();

                if (promise.tokenError) {
                    throw new Error(promise.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to PUT product details')
                }
                if (res.ok) {
                    // navigate client to supplier page
                    navigate(-1)
                
                    // push toast to notify successful login
                    toast.success("Product updated successfully", {
                        position: "bottom-right"
                    });
                
                    // update loading state
                    setIsLoadingState(false)

                }
            } catch (error) {
                setErrorState(error.message);
                setIsLoadingState(false);
            }
        }
        putProduct();
    }

    return { updateProduct, isLoadingState, errorState };
}