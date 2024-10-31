//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
 

export const useAddProject = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const addProject = async (projectState) => {
        setIsLoadingState(true)
        setErrorState(null)

        const postProject = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/create`, {
                    credentials: 'include', method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    },
                    body: JSON.stringify(projectState)
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to POST new employee details')
                }
                if (res.ok) {
                    // navigate client to dashboard page
                    navigate(`/EmpirePMS/project/`)
                
                    alert(`Project added successfully!`);
                
                    // update loading state
                    setIsLoadingState(false)

                }
            } catch (error) {
                setErrorState(error.message);
                setIsLoadingState(false);
            }
        }
        postProject();
    }

    return { addProject, isLoadingState, errorState };
}