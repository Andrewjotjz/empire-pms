
// Import modules
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateProject } from '../../hooks/useUpdateProject';
import SessionExpired from '../../components/SessionExpired';
import LoadingScreen from "../loaders/LoadingScreen";
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

const UpdateAlias = () => {
    // Component router
    const navigate = useNavigate();
    const {id} = useParams();

    // Component state declaration
    const [aliasState, setAliasState] = useState({
      alias_name: ''
    });
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);

    // Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const handleChange = (e) => {
        const { value } = e.target;
        setAliasState({alias_name: value});
    };

    const updateAlias = async () => {
      setIsLoadingState(true);
      try {
          const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/alias/${id}`, { credentials: 'include',
              credentials: 'include', method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
              },
              body: JSON.stringify({...aliasState})
          });
          if (!res.ok) {
              throw new Error('Failed to fetch');
          }
          const data = await res.json();

          if (data.tokenError) {
              throw new Error(data.tokenError);
          }
          
          navigate(`/EmpirePMS/alias/${id}/edit`)
          alert(`Alias updated successfully!`);      
          setIsLoadingState(false)

      } catch (error) {
          if (error.name === 'AbortError') {
              // do nothing
          } else {
              setIsLoadingState(false);
              setErrorState(error.message);
          }
      }
    };
       
    const handleSubmit = (e) => {
      e.preventDefault();

      if (aliasState.alias_name === '') {      
        alert(`Unable to proceed. Alias name must not be empty!`);
        return;
      }


      if (aliasState.alias_name !== '') {
        const userConfirmed = window.confirm(
            'Are you sure you want to update this alias name?'
        );
        if (userConfirmed) {
          updateAlias();
        }
        if (!userConfirmed) {
            return;
        }
      }
    };
    
    // fetch single alias
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchAlias = async () => {
            setIsLoadingState(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/alias/${id}`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                setAliasState(data);
                setErrorState(null);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsLoadingState(false);
                    setErrorState(error.message);
                }
            }
        };

        fetchAlias();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);

    
    if (isLoadingState) {
      return <LoadingScreen />;
    }
    
    if (errorState) {
      if (errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
          return <div><SessionExpired /></div>;
      }
      return <div>Error: {errorState}</div>;
    }
    
      return (
        localUser && Object.keys(localUser).length > 0 ? (
          <div className="container mx-auto mt-4 sm:mt-10 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-800 px-6 py-2">
                <h1 className=" text-xs sm:text-xl font-bold text-white">EDIT ALIAS</h1>
              </div>
              <form  onKeyDown={(e) => { if (e.key === 'Enter') {e.preventDefault();} }} onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-2 sm:space-y-6 text-xs sm:text-base">
                {/* PROJECT NAME */}
                <div className='w-full'>
                <label htmlFor="alias_name" className="block text-sm font-medium text-gray-700">* Alias Name</label>
                <input
                    type="text"
                    id="alias_name"
                    name="alias_name"
                    value={aliasState.alias_name}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
                </div>
                  
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    UPDATE ALIAS
                  </button>
                </div>
              </form>
              </div>
            </div>
        ) : ( <UnauthenticatedSkeleton /> )
      );
    };

export default UpdateAlias;

