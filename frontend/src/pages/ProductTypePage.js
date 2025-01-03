// import modules
import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import SessionExpired from "../components/SessionExpired";
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton";
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';


const ProductType = () => {
    // state
    const localUser = JSON.parse(localStorage.getItem('localUser'))
    const [isArchive, setIsArchive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [productTypeState, setProductTypeState] = useState([]);
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);

    // router
    const navigate = useNavigate();
    
    // functions and variables
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    const handleAddClick = () => {
        navigate('/EmpirePMS/product-type/create');
    };
    const handleEditClick = (typeId) => {
        navigate(`/EmpirePMS/product-type/${typeId}/edit`)
    }
    // Filter the data using searchTerm
    const filterProductType = () => {
        return productTypeState.filter(producttype => {

            const lowerCaseSearchTerm = searchTerm.toLowerCase();

            return (
                producttype.type_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                producttype.type_categories.some(category => category.category_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                producttype.type_categories.some(category => category.subcategories.some(subcategory => subcategory.subcategory_name.toLowerCase().includes(lowerCaseSearchTerm)))
            )
        })
    }
    // Transform the data into the required format for the table
    const formatData = (rawData) => {
        return rawData.map(type => ({
        id: type._id,
        name: type.type_name,
        unit: type.type_unit,
        children: type.type_categories.map(category => ({
            id: category._id,
            name: category.category_name,
            unit: category.category_unit,
            children: category.subcategories.map(subcategory => ({
            id: subcategory._id,
            name: subcategory.subcategory_name,
            unit: subcategory.subcategory_unit
            }))
        }))
        }));
    };
    const formattedData = formatData(filterProductType().filter(type => type.type_isarchived === isArchive));

    // useEffect
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProductTypes = async () => {
            setIsLoadingState(true); // Set loading state to true at the beginning
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                setProductTypeState(data);
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

        fetchProductTypes();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);

    // components
    const TreeTableRow = ({ node, level }) => {
        const [isExpanded, setIsExpanded] = useState(false);
      
        const hasChildren = node.children && node.children.length > 0;
      
        return (
          <>
            <tr>
              <td className="font-medium">
                <div style={{ paddingLeft: `${level * 20}px` }} className="flex items-center">
                  {hasChildren && (
                    <button
                      className="w-4 sm:w-6 h-6 p-0 mr-0 sm:mr-2 text-gray-500"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 sm:size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 sm:size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      )}
                    </button>
                  )}
                  {/* empty box for indentation */}
                  {!hasChildren && <div className="w-4 sm:w-6 h-6 mr-0 sm:mr-2" />}
                  <label className='border-l-2 pl-2 border-gray-300'>{node.name} <span className='hidden sm:inline-block text-xs italic text-gray-400'>{node.unit}</span></label>
                  {/* edit button */}
                  { level === 0 && (
                    <button className='ml-1 text-gray-400 hover:text-gray-600' onClick={() => handleEditClick(node.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
            {isExpanded &&
              node.children?.map((child) => (
                <TreeTableRow key={child.id} node={child} level={level + 1} />
              ))}
          </>
        );
    };

    const TreeTable = ({ data }) => {
        return (
          <table className="min-w-full table-auto text-xs sm:text-base">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Product Type</th>
              </tr>
            </thead>
            <tbody>
              {data.map((node) => (
                <TreeTableRow key={node.id} node={node} level={0} />
              ))}
            </tbody>
          </table>
        );
    };

    if (isLoadingState) { return (<EmployeePageSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }     

    return ( 
        localUser && Object.keys(localUser).length > 0 ? (
            <div className="container mt-3 sm:mt-5">
                <div className="card">
                    <div className="card-header bg-dark text-white">
                        <h1 className='mx-auto uppercase font-bold text-sm sm:text-xl'>PRODUCT TYPES</h1>
                    </div>
                    <div className="card-body">
                        <div  className="flex flex-col md:flex-row mb-3 gap-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    className="form-control text-xs sm:text-base"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button className="btn btn-primary flex items-center" onClick={handleAddClick}>
                                    <div className='flex items-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <label className='text-xs sm:text-base'>CREATE PRODUCT TYPE</label>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div>
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
                            <div className="border rounded-md overflow-auto">
                                <TreeTable data={formattedData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div> ) : ( <UnauthenticatedSkeleton /> )
     );
}
 
export default ProductType;