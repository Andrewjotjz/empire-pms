import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmployeePageSkeleton = () => {
    //Component router
    const navigate = useNavigate();

    //Component state declaration
    const [idle, setIdleState] = useState(false);

    //Component side effects
    useEffect(() => {
        const timer = setTimeout(() => {
            setIdleState(true);
        }, 10000);

        // Cleanup the timeout if the component unmounts before the timer is done
        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        navigate('/EmpirePMS/login');
    };

    //Display DOM
    return (
        <div className="container mt-5">
        {idle ? (
            <div>
                <h1 className="display-4">Oops! I'm sorry...</h1>
                <p className="lead">It seems like you're not authenticated or your session has expired. Please login again.</p>
                <p className="lead">If this problem still occurs, please contact it.admin@empirecbs.com for more support.</p>
                <button className="btn btn-primary" onClick={handleClick}>
                    Login Here
                </button>
            </div>
        ) : (
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1 className="skeleton skeleton-text"><span className="visually-hidden">Loading...</span></h1>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="skeleton skeleton-input"></div>
                        </div>
                        <div className="col-md-6 d-flex justify-content-end">
                            <div className="skeleton skeleton-button"></div>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="skeleton skeleton-button me-2"></div>
                            <div className="skeleton skeleton-button"></div>
                        </div>
                        <div className="col-md-12">
                            <div className="skeleton skeleton-table"></div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default EmployeePageSkeleton;
