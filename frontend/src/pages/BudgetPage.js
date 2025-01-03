import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux'

import SessionExpired from "../components/SessionExpired";
import LoadingScreen from "./loaders/LoadingScreen";
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';

const Budget = () => {

    //Component state declaration
    const [budgetState, setBudgetState] = useState([]);
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isArchive, setIsArchive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');

    //Component router
    const navigate = useNavigate();

    //Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const formatDateTime = (dateString) => {
        if (dateString === null) {
            return ''
        }  else {
            const date = new Date(dateString);
            const options = { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
            return date.toLocaleDateString('en-AU', options).toUpperCase().replace(' ', '-').replace(' ', '-');
        }
    };

    const handleSearchDateChange = (e) => {
        setSearchDate(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filterBudgets = () => {
        return budgetState.filter(budget => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
            // Check each field for the search term
            return (
                budget.budget_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                budget.project.project_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                budget.budget_area.toString().includes(lowerCaseSearchTerm) ||
                budget.budget_level.toString().includes(lowerCaseSearchTerm) ||
                budget.budget_subarea.toLowerCase().includes(lowerCaseSearchTerm) 
                // || (budget.order && budget.order.order_ref.toLowerCase().includes(lowerCaseSearchTerm))
            );
        });
    };

    const filterBySelectedDate = (budgets) => {
        if (!searchDate) return budgets;
    
        const selected = new Date(searchDate);
        return budgets.filter(budget => {
            const budgetDate = new Date(budget.budget_issue_date);
            return (
                budgetDate.getFullYear() === selected.getFullYear() &&
                budgetDate.getMonth() === selected.getMonth() &&
                budgetDate.getDate() === selected.getDate()
            );
        });
    };
    
    const handleAddClick = () => {
        navigate('/EmpirePMS/budget/create');
    }

    const handleTableClick = (id) => {

        navigate(`/EmpirePMS/budget/${id}`);
    }
    
    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchBudget = async () => {
            setIsLoadingState(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/budget`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch budgets');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                setBudgetState(data);
                setErrorState(null);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsLoadingState(false);
                    setErrorState(error.message);
                }
            }
        };

        fetchBudget();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);
    
    //Display DOM
    const budgetTable = budgetState.length > 0 ? (
        <div className="container text-sm overflow-x-auto">
            <table className="table table-bordered table-hover shadow-md w-full">
                <thead className="thead-dark text-center">
                    <tr className="table-primary">
                        <th scope="col">Budget Name</th>
                        <th scope="col">Project</th>
                        <th scope="col">Budget Area</th>
                        <th scope="col">Budget Level</th>
                        <th scope="col">Budget Subarea</th>
                        <th scope="col" className="hidden sm:table-cell">Total Budget</th>
                    </tr>
                </thead>
                <tbody className="text-xs sm:text-base">
                    {filterBySelectedDate(filterBudgets().filter(budget => budget.budget_isarchived === isArchive)).map(budget => (
                        <tr key={budget._id} onClick={() => handleTableClick(budget._id)} className="cursor-pointer text-center text-sm">
                            <td>{budget.budget_name}</td>
                            <td>{budget.project.project_name}</td>
                            <td>{budget.project.area_obj_ref.find(area => area._id === budget.budget_area)?.areas.area_name}</td>
                            <td>{budget.project.area_obj_ref.find(area => area._id === budget.budget_area)?.areas.levels.find(level => level._id === budget.budget_area_level)?.level_name}</td>
                            <td>{budget.project.area_obj_ref.find(area => area._id === budget.budget_area)?.areas.levels.find(level => level._id === budget.budget_area_level)?.subareas.find(subarea => subarea._id === budget.budget_area_subarea).subarea_name}</td>
                            <td className="hidden sm:table-cell">{}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div>Budget API fetched successfully, but it might be empty...</div>
    );
    
    
    if (isLoadingState) { return (<LoadingScreen />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
            <div className="container mt-5"><div className="card">
                    <div className="card-header bg-dark text-white">
                        <h1 className='mx-auto uppercase font-bold text-md sm:text-xl'>BUDGETS</h1>
                    </div>
                    <div className="card-body">
                        <div className="row mb-1">
                            <div className="col-md-6 mb-1">
                                <input
                                    type="text"
                                    className="form-control text-xs sm:text-base"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="col-12 col-md-6 d-flex justify-content-md-end mb-2">
                                <button className="btn btn-primary w-full md:w-auto" onClick={handleAddClick}>
                                    <div className="flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5 mr-1"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <span className="text-xs sm:text-sm">NEW BUDGET</span>
                                    </div>
                                </button>
                            </div>
                            <div className="col-md-6 d-flex justify-content-start">
                                <input
                                    type="date"
                                    className="form-control text-xs sm:text-base"
                                    value={searchDate}
                                    onChange={handleSearchDateChange}
                                />
                            </div>
                        </div>
                        <div className="row mb-3">
                        <div className="col-md-6">
                            <button 
                                className={`${!isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white text-xs sm:text-base' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 text-xs sm:text-base'}`} 
                                onClick={() => setIsArchive(false)}
                            >
                                Current
                            </button>
                            <button 
                                className={`${isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white text-xs sm:text-base' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 text-xs sm:text-base'}`} 
                                onClick={() => setIsArchive(true)}
                            >
                                Archived
                            </button>
                        </div>
                            {budgetTable}
                        </div>
                    </div>
                </div>
            </div> ) : ( <UnauthenticatedSkeleton /> )
     );
}
 
export default Budget;