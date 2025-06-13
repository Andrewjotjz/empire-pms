import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
 

export const useUpdateProductPrice = () => {
    // Component's hook state declaration
    const [isUpdatePriceLoadingState, setUpdatePriceLoadingState] = useState(false);
    const [updatePriceErrorState, setUpdatePriceErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    // Component's function
    const updatePrice = async (priceId, newProductPriceState) => {
        setUpdatePriceLoadingState(true);
        setUpdatePriceErrorState(null);

        const putProductPrice = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/productprice/${priceId}`, {
                    credentials: 'include', method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    },
                    body: JSON.stringify(newProductPriceState)
                });

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                if (!res.ok) {
                    throw new Error('Failed to PUT product price.');
                }
                if (res.ok) {
                    // navigate back to product price details
                    navigate(-1);

                    alert(`Price updated successfully!`);

                    // update loading state
                    setUpdatePriceLoadingState(false);

                }
            } catch (error) {
                setUpdatePriceErrorState(error.message);
                setUpdatePriceLoadingState(false);
            }
        };

        return putProductPrice();
    };

    return { updatePrice, isUpdatePriceLoadingState, updatePriceErrorState };
};
