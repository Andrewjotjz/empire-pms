import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
    // Router navigation hook
    const navigate = useNavigate();

    // Redirects user to Dashboard after a delay
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/EmpirePMS/dashboard');
        }, 10000);

        // Cleanup the timeout if the component unmounts before the timer is done
        return () => clearTimeout(timer);
    }, [navigate]);

    // Redirects user immediately when button is clicked
    const handleRedirect = () => {
        navigate('/EmpirePMS/dashboard');
    };

    // Display DOM
    return (
        <div className="container mt-5 text-center">
            <h1 className="display-4">404 - Page Not Found</h1>
            <p className="lead">Sorry, we couldn’t find the page you’re looking for.</p>
            <p className="lead">You will be redirected to the dashboard shortly.</p>
            <button className="btn btn-primary mt-3" onClick={handleRedirect}>
                Go to Dashboard
            </button>
        </div>
    );
};

export default NotFoundPage;
