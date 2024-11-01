//import modules
import UnauthenticatedSkeleton from '../pages/loaders/UnauthenticateSkeleton'

const Payment = () => {

    //Component variable
    const localUser = JSON.parse(localStorage.getItem('localUser'))
    
    return ( 
        localUser && Object.keys(localUser).length > 0 ? (
        <div className="payment">
            <h1>Payment</h1>
        </div> ) : ( <UnauthenticatedSkeleton /> )
     );
}
 
export default Payment;