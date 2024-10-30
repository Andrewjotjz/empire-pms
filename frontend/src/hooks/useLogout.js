//import modules and files
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'
import { clearLocalUser } from '../redux/localUserSlice'

export const useLogout = () => {
  ///Component's hook state declaration
  const [, setError] = useState(null);
  const dispatch = useDispatch()
  
  //Component's hook router
  const navigate = useNavigate();

  //Component's function and variables
  const logout = () => {
    // remove user from local storage
    localStorage.removeItem('localUser')

    const abortCont = new AbortController();
    fetch(`${process.env.REACT_APP_API_BASE_URL}/employee/logout`, { signal: abortCont.signal, credentials: 'include' })
    .then(res => {
      if (!res.ok) { // error coming back from server
        throw Error('could not fetch the data for that resource: "/api/employee". Please check your database connection.');
      }
      //dispatch to clear local user
      dispatch(clearLocalUser())
      //clear error state
      setError(null);
      // navigate user to login page
      navigate('/EmpirePMS/login')
      return res.json(); //! this json message not being used. In backend, check logout() API for json message.
    })
    .catch(err => {
      if (err.name === 'AbortError') {
      } else {
        // auto catches network / connection error
        setError(err.message);
      }
    })
  }

  return { logout }
}
