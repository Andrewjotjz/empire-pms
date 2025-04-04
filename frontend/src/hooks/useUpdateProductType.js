//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const useUpdateProductType = () => {
    //Component's hook state declaration
    const [isUpdating, setIsLoadingState] = useState(false);
    const [updateError, setErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const updateProductType = async (productTypeState, typeId) => {
        setIsLoadingState(true)
        setErrorState(null)

        const putProductType = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type/${typeId}`, {
                    credentials: 'include', method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    },
                    body: JSON.stringify(productTypeState)
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error(`Failed to EDIT product type id: ${typeId}`)
                }

                if (res.ok) {
                    // navigate client to home page
                    navigate(`/EmpirePMS/product-type`);

                    alert(`Product type updated successfully!`);
                
                    // update loading state
                    setIsLoadingState(false)

                }
            } catch (error) {
                // Check if the error is due to a duplicate name
                if (error.response?.status === 400 && error.response.data?.error) {
                  setErrorState(error.response.data.error); // Set the error message
                  setIsLoadingState(false);
                } else {
                  setErrorState(error.message); // Generic fallback error
                  setIsLoadingState(false);
                }
              }
        }
        putProductType();
    }

    return { updateProductType, isUpdating, updateError };
}