
// Import modules
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setProjectState } from '../../redux/projectSlice';
import { useUpdateProject } from '../../hooks/useUpdateProject';
import SessionExpired from '../../components/SessionExpired';
import ProjectDetailsSkeleton from '../loaders/ProjectDetailsSkeleton';
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

const UpdateProjectForm = () => {
    // Component router
    const location = useLocation();
    const retrieved_id = location.state;
    const navigate = useNavigate();

    // Component state declaration
    const projectState = useSelector((state) => state.projectReducer.projectState);
    const dispatch = useDispatch();
    const { update, isLoadingState, errorState } = useUpdateProject();

    // Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const handleBackClick = () => navigate(`/EmpirePMS/project/${retrieved_id}`);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        dispatch(setProjectState({
            ...projectState,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        update(projectState);
    };

    // Display DOM
    if (isLoadingState) {
        return <ProjectDetailsSkeleton />;
    }

    if (errorState) {
        if (errorState.includes("Session expired") || errorState.includes("jwt expired")) {
            return <div><SessionExpired /></div>;
        }
        return <div>Error: {errorState}</div>;
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        projectState && Object.keys(projectState).length > 0 ? (
        <div className="container mt-5"> 
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1>EDIT PROJECT: {projectState.project_name}</h1>
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
        </div>
                ) : (
                    <div><SessionExpired /></div>
                ) ) : ( <UnauthenticatedSkeleton /> )
    );
};

export default UpdateProjectForm;

