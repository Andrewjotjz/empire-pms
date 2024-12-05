import React, { useState, useEffect } from 'react';
import { useAddProject } from '../../hooks/useAddProject'; 
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";
import LoadingScreen from "../loaders/LoadingScreen";
import SessionExpired from '../../components/SessionExpired';

const ProjectForm = () => {
  // State
  const [projectState, setProjectState] = useState({
    project_name: '',
    project_address: '',
    project_isarchived: false,
    suppliers: [],
    area_obj_ref: []
  });
  const [supplierState, setSupplierState] = useState([]);
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Custom hook
  const { addProject, isLoadingState: addProjectLoading, errorState: addProjectError } = useAddProject();

  // Functions and Variables
  const localUser = JSON.parse(localStorage.getItem('localUser'))

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProjectState(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addArea = () => {
    setProjectState(prevData => ({
      ...prevData,
      area_obj_ref: [...prevData.area_obj_ref, { areas: { area_name: '', levels: [] } }]
    }));
  };

  const removeArea = (areaIndex) => {
    setProjectState(prevData => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.filter((_, index) => index !== areaIndex)
    }));
  };

  // const addLevel = (areaIndex) => {
  //   setProjectState(prevData => {
  //     const newData = { ...prevData };
  //     newData.area_obj_ref[areaIndex].areas.levels.push({ level_name: '', subareas: [] });
  //     return newData;
  //   });
  // };
  const addLevel = (areaIndex) => {
    setProjectState(prevData => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.map((areaObj, index) => {
        if (index === areaIndex) {
          return {
            ...areaObj,
            areas: {
              ...areaObj.areas,
              levels: [...areaObj.areas.levels, { level_name: '', subareas: [] }],
            },
          };
        }
        return areaObj;
      }),
    }));
  };
  
  const removeLevel = (areaIndex, levelIndex) => {
    setProjectState(prevData => {
      const newData = { ...prevData };
      newData.area_obj_ref[areaIndex].areas.levels = newData.area_obj_ref[areaIndex].areas.levels.filter((_, index) => index !== levelIndex);
      return newData;
    });
  };

  // const addSubarea = (areaIndex, levelIndex) => {
  //   setProjectState(prevData => {
  //     const newData = { ...prevData };
  //     newData.area_obj_ref[areaIndex].areas.levels[levelIndex].subareas.push({ subarea_name: '' });
  //     return newData;
  //   });
  // };
  const addSubarea = (areaIndex, levelIndex) => {
    setProjectState(prevData => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.map((area, aIndex) =>
        aIndex === areaIndex
          ? {
              ...area,
              areas: {
                ...area.areas,
                levels: area.areas.levels.map((level, lIndex) =>
                  lIndex === levelIndex
                    ? {
                        ...level,
                        subareas: [...level.subareas, { subarea_name: '' }]
                      }
                    : level
                )
              }
            }
          : area
      )
    }));
  };
  

  const removeSubarea = (areaIndex, levelIndex, subareaIndex) => {
    setProjectState(prevData => {
      const newData = { ...prevData };
      newData.area_obj_ref[areaIndex].areas.levels[levelIndex].subareas = newData.area_obj_ref[areaIndex].areas.levels[levelIndex].subareas.filter((_, index) => index !== subareaIndex);
      return newData;
    });
  };

  const handleAreaChange = (areaIndex, value) => {
    setProjectState(prevData => {
      const newData = { ...prevData };
      newData.area_obj_ref[areaIndex].areas.area_name = value;
      return newData;
    });
  };

  const handleLevelChange = (areaIndex, levelIndex, value) => {
    setProjectState(prevData => {
      const newData = { ...prevData };
      newData.area_obj_ref[areaIndex].areas.levels[levelIndex].level_name = value;
      return newData;
    });
  };

  const handleSubareaChange = (areaIndex, levelIndex, subareaIndex, value) => {
    setProjectState(prevData => {
      const newData = { ...prevData };
      newData.area_obj_ref[areaIndex].areas.levels[levelIndex].subareas[subareaIndex].subarea_name = value;
      return newData;
    });
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setProjectState((prevState) => {
        const updatedSupplier = checked
            ? [...prevState.suppliers, value]
            : prevState.suppliers.filter(projectId => projectId !== value);
        return { ...prevState, suppliers: updatedSupplier };
    });
};

  const handleSubmit = (e) => {
    e.preventDefault();
    addProject(projectState);
  };

  // useEffect
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchAllSuppliers = async () => {
        setIsLoadingState(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier`, { signal , credentials: 'include',
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
            setSupplierState(data);
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

    fetchAllSuppliers();

    return () => {
        abortController.abort(); // Cleanup
    };
}, []);

if (isLoadingState) {
  return <LoadingScreen />;
}

if (errorState) {
  if (errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
      return <div><SessionExpired /></div>;
  }
  return <div>Error: {errorState}</div>;
}

  return (
    localUser && Object.keys(localUser).length > 0 ? (
      <div className="container mx-auto mt-4 sm:mt-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-800 px-6 py-2">
            <h1 className=" text-xs sm:text-xl font-bold text-white">NEW PROJECT</h1>
          </div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-2 sm:space-y-6 text-xs sm:text-base">
            {/* PROJECT NAME */}
            <div className='flex gap-x-2'>
              <div className='w-full'>
                <label htmlFor="project_name" className="block text-sm font-medium text-gray-700">* Project Name</label>
                <input
                  type="text"
                  id="project_name"
                  name="project_name"
                  value={projectState.project_name}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>
              {/* PROJECT ADDRESS */}
              <div className='w-full'>
                <label htmlFor="project_address" className="block text-sm font-medium text-gray-700">* Project Address</label>
                <input
                  type="text"
                  id="project_address"
                  name="project_address"
                  value={projectState.project_address}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>
            </div>
            {/* SUPPLIERS */}
            <div className="mb-0 sm:mb-3">
                <label className="block text-sm font-medium text-gray-700">Assign Suppliers:</label>
                <div>
                    <button
                        type="button"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {projectState.suppliers.length > 0 ? `x${projectState.suppliers.length} Suppliers Selected` : `Select Suppliers`}
                    </button>
                    {isDropdownOpen && (
                        <div className="relative z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto" onMouseLeave={() => setIsDropdownOpen(false)}>
                            <ul className="py-1">
                                {supplierState && supplierState.length > 0 && supplierState.map((supplier, index) => (
                                    <li key={index} className="flex items-center px-4 py-2 hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            id={`supplier-${supplier._id}`}
                                            value={supplier._id}
                                            checked={projectState.suppliers.includes(supplier._id)}
                                            onChange={handleCheckboxChange}
                                            className="mr-2"
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('You must select one or more supplier applied to this Project')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                        <label htmlFor={`supplier-${supplier._id}`} className="text-gray-900">{supplier.supplier_name}</label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <p className='hidden sm:inline-block text-xs italic text-gray-400 mt-2'>Assign one or more suppliers to this new Project</p>
            </div>
            {/* AREAS */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Areas</h3>
              {projectState.area_obj_ref.map((areaObj, areaIndex) => (
                <div key={areaIndex} className="border border-gray-200 p-4 rounded-md mb-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={areaObj.areas.area_name}
                      onChange={(e) => handleAreaChange(areaIndex, e.target.value)}
                      placeholder="Area Name"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    />
                    {/* REMOVE AREA */}
                    <button
                      type="button"
                      onClick={() => removeArea(areaIndex)}
                      className="px-2 py-1 text-sm rounded-md text-red-500  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 hover:bg-red-500 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                  </div>
                  {/* LEVELS */}
                  <div className="border-l-2 border-purple-300 mb-1 p-2 bg-purple-100 bg-opacity-50">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Levels</h4>
                    {areaObj.areas.levels.map((level, levelIndex) => (
                      <div key={levelIndex} className="ml-2 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3 mr-1">
                            <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
                          </svg>
                          <input
                            type="text"
                            value={level.level_name}
                            onChange={(e) => handleLevelChange(areaIndex, levelIndex, e.target.value)}
                            placeholder="Level Name"
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                          />
                          {/* REMOVE LEVEL */}
                          <button
                            type="button"
                            onClick={() => removeLevel(areaIndex, levelIndex)}
                            className="px-2 py-1 text-sm rounded-md text-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 hover:text-white"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                          </button>
                        </div>
                        {/* SUBAREAS */}
                        <div className="ml-6 border-l-2 border-pink-300 mb-4 p-2 bg-pink-100 bg-opacity-50">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Subareas</h5>
                          {level.subareas.map((subarea, subareaIndex) => (
                            <div key={subareaIndex} className="flex items-center justify-between mb-2">
                              {/* REMOVE SUBAREA */}
                              <button
                                type="button"
                                onClick={() => removeSubarea(areaIndex, levelIndex, subareaIndex)}
                                className="px-2 py-1 text-sm rounded-md text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 hover:bg-red-500 hover:text-white"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                  </svg>
                              </button>
                              <input
                                type="text"
                                value={subarea.subarea_name}
                                onChange={(e) => handleSubareaChange(areaIndex, levelIndex, subareaIndex, e.target.value)}
                                placeholder="Subarea Name"
                                className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                              />
                            </div>
                          ))}
                          {/* ADD SUBAREA */}
                          <button
                            type="button"
                            onClick={() => addSubarea(areaIndex, levelIndex)}
                            className="inline-flex items-center px-2 py-1 border border-transparent leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out text-xs sm:text-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 sm:size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Sub-area
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* ADD LEVEL */}
                    <button
                      type="button"
                      onClick={() => addLevel(areaIndex)}
                      className="inline-flex items-center px-3 py-2 border border-transparent leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out text-xs sm:text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 sm:size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Level
                    </button>
                  </div>
                </div>
              ))}
              {/* ADD AREA */}
              <button
                  type="button"
                  onClick={addArea}
                  className="inline-flex items-center px-4 py-3 border border-transparent leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out text-xs sm:text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 sm:size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Area
              </button>
            </div>

            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Project
              </button>
            </div>
          </form>
          </div>
        </div>
    ) : ( <UnauthenticatedSkeleton /> )
  );
};

export default ProjectForm;

