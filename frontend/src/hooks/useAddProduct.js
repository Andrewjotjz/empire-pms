//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

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
                const res = await fetch(`https://empire-pms.vercel.app/api/product/create`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
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
                    // push toast to notify successful login
                    toast.success(`Product added to supplier`, {
                        position: "bottom-right"
                    });
                
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