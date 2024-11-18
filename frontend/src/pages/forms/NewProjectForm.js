
// Import modules
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddProject } from '../../hooks/useAddProject'; 
import SessionExpired from '../../components/SessionExpired';
import ProjectDetailsSkeleton from "../loaders/ProjectDetailsSkeleton";
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

const NewProjectForm = () => {
    // Component router
    const navigate = useNavigate();

    // Component hook
    const { addProject, isLoadingState, errorState } = useAddProject();

    // Component state
    const [projectState, setProjectState] = useState({
        project_name: '',
        project_address: ''
    });

    // Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const handleBackClick = () => navigate(`/EmpirePMS/project`);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setProjectState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        addProject(projectState);
    };

    // Display DOM
    if (isLoadingState) {
        return <ProjectDetailsSkeleton />;
    }

    if (errorState) {
        if (errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
            return <div><SessionExpired /></div>;
        }
        return <div>Error: {errorState}</div>;
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        <div className="container mt-5"> 
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1>NEW PROJECT</h1>
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="mb-3">
                            <label className="form-label">Project Name:</label>
                            <input 
                                type='text'
                                className="form-control placeholder-gray-400 placeholder-opacity-50" 
                                name="project_name" 
                                value={projectState.project_name} 
                                onChange={handleInputChange}
                                placeholder='Name'
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter project name')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Project Address:</label>
                            <input 
                                type='text'
                                className="form-control placeholder-gray-400 placeholder-opacity-50" 
                                name="project_address" 
                                value={projectState.project_address} 
                                onChange={handleInputChange} 
                                placeholder='Address'
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter project address')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>

                        <div className="d-flex justify-content-between mb-3">
                            <button type="button" onClick={handleBackClick} className="btn btn-secondary">CANCEL</button>
                            <button className="btn btn-primary" type="submit">ADD TO PROJECT</button>
                        </div>
                    </div>
                </form>
            </div>
        </div> ) : ( <UnauthenticatedSkeleton /> )
    );
};

export default NewProjectForm;

