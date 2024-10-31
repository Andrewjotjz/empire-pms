import { useState } from 'react';

export const useAddAlias = () => {
    // Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    // Component's function
    const addAlias = async (value) => {
        setIsLoadingState(true);
        setErrorState(null);

        const postAlias = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/alias/create`, {
                    credentials: 'include', method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    },
                    body: JSON.stringify({ alias_name: value })
                });

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                if (!res.ok) {
                    throw new Error('Failed to create new alias. Alias already existed in database. Otherwise, please check your network.');
                }
                if (res.ok) {
                    alert(`New alias created succesfully!`);

                    // update loading state
                    setIsLoadingState(false);

                    return data._id;
                }
            } catch (error) {
                setErrorState(error.message);
                setIsLoadingState(false);
                throw error; // rethrow the error to be handled by the caller
            }
        };

        return postAlias(); // return the promise from postAlias
    };

    return { addAlias, isLoadingState, errorState };
};
