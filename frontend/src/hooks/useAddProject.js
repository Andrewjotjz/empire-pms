//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

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
                const res = await fetch(`/api/project/create`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(projectState)
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to POST new project details')
                }
                if (res.ok) {
                    // navigate client to dashboard page
                    navigate(`/EmpirePMS/project/`)
                
                    // push toast to notify successful login
                    toast.success(`Project created successfully!`, {
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
        postProject();
    }

    return { addProject, isLoadingState, errorState };
}