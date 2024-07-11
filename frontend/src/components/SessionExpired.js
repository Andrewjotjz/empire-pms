//import modules and files
import { useLogout } from '../hooks/useLogout';

const SessionExpired = () => {
    const { logout } = useLogout();
    
    const handleClick = () => {
        logout();
    };

    return (
        <div className="session-expired">
        <div className="session-expired-container">
          <h1>Session Expired</h1>
          <p>Your session has expired. Please log in again to continue.</p>
          <button onClick={handleClick} className="session-expired-button">
            Go to Login
          </button>
        </div>
      </div>
    );
};
 
export default SessionExpired;