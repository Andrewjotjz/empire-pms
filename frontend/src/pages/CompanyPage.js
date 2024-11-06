//import modules
import { useEffect, useState } from "react";
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';

const Company = () => {

    const localUser = JSON.parse(localStorage.getItem('localUser'))
  
    return ( 
        localUser && Object.keys(localUser).length > 0 ? (
        <div className="company">
            <h1>Company</h1>
        </div> ) : ( <UnauthenticatedSkeleton /> )
     );
}
 
export default Company;