import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProjectPageSkeleton = () => {
    //Component router
    const navigate = useNavigate();

    //Component state declaration
    const [idle, setIdleState] = useState(false);

    //Component side effects
    useEffect(() => {
        const timer = setTimeout(() => {
            setIdleState(true);
        }, 20000);

        // Cleanup the timeout if the component unmounts before the timer is done
        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        navigate('/EmpirePMS/dashboard');
    };

    //Display DOM
    return (
        <div className="container mt-5">
        {idle ? (
            <div>
                <h1 className="display-4">Oops! I'm sorry...</h1>
                <p className="lead">It seems like something went wrong. Please try again.</p>
                <p className="lead">If this frequently occurs, please contact it.admin@empirecbs.com for more support.</p>
                <button className="btn btn-primary" onClick={handleClick}>
                    Go to Home
                </button>
            </div>
        ) : (
            <div className="container mt-5">
                <div className="card">
                    <div className="card-header bg-dark text-white">
                        <h1 className="skeleton skeleton-text"><span className="visually-hidden">EMPLOYEE ACCOUNT</span></h1>
                    </div>
                    <div className="card-body">
                        <div className="d-flex justify-content-between mb-3">
                            <div className="skeleton skeleton-button"></div>
                            <div className="skeleton skeleton-button"></div>
                            <div className="skeleton skeleton-select"></div>
                        </div>
                        <div className="d-flex mb-3">
                            <div className="skeleton skeleton-button me-2"></div>
                            <div className="skeleton skeleton-button"></div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label skeleton skeleton-text"></label>
                                <div className="skeleton skeleton-text"></div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label skeleton skeleton-text"></label>
                                <div className="skeleton skeleton-text"></div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label skeleton skeleton-text"></label>
                                <div className="skeleton skeleton-text"></div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label skeleton skeleton-text"></label>
                                <div className="skeleton skeleton-text"></div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label skeleton skeleton-text"></label>
                                <div className="skeleton skeleton-text"></div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label skeleton skeleton-text"></label>
                                <div className="skeleton skeleton-text"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default ProjectPageSkeleton;
