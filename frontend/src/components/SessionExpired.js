//import modules and files
import { useLogout } from '../hooks/useLogout';
import 'bootstrap/dist/css/bootstrap.min.css';

const SessionExpired = () => {
    const { logout } = useLogout();
    
    const handleClick = () => {
        logout();
    };

    return (
      <div className="container text-center mt-5">
          <div className="jumbotron">
              <h1 className="display-4">Session Expired</h1>
              <p className="lead">Your session has expired. Please log in again to continue.</p>
              <button className="btn btn-primary" onClick={handleClick}>
                  Go to Login
              </button>
          </div>
      </div>
    );
};
 
export default SessionExpired;