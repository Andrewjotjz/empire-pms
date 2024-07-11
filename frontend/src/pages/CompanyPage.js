//import modules
import { useEffect, useState } from "react";
import { useCompanyContext } from '../hooks/useCompanyContext'

const Company = () => {
    const [, setError] = useState(null)
    const [, setIsLoading] = useState(null)
    const { dispatch } = useCompanyContext();

    useEffect(()=> {
        const abortCont = new AbortController();

          fetch('/api/company/', { signal: abortCont.signal })
          .then(res => {
            if (!res.ok) { // error coming back from server
              throw Error('could not fetch the data for that resource: "/api/company/". Please check your database connection.');
            } 
            return res.json();
          })
          .then(data => {
            setIsLoading(false);
            dispatch({type: 'SET_COMPANY_DETAILS', payload: data})
            setError(null);
          })
          .catch(err => {
            if (err.name === 'AbortError') {
            } else {
              // auto catches network / connection error
              setIsLoading(false);
              setError(err.msg);
            }
          })
    
        // abort the fetch
        return () => abortCont.abort();
    },[dispatch])
    
    return ( 
        <div className="company">
            <h1>Company</h1>
        </div>
     );
}
 
export default Company;