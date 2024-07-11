//import modules and files
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
    fetch('/api/employee/logout', { signal: abortCont.signal })
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
      // push toast to notify successful login
      toast.info(`Session ended. Please login.`, {
        position: "top-right"
      });
      return res.json();
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
