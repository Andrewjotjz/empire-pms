import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react"

const NewBudgetForm2 = () => {

  // State
  const [projectState, setProjectState] = useState([]);
  const [isFetchProjectLoading, setIsFetchProjectLoading] = useState(false);
  const [fetchProjectError, setFetchProjectError] = useState(null);

  const [productTypeState, setProductTypeState] = useState([]);
  const [isFetchProductTypeLoading, setIsFetchProductTypeLoading] = useState(false);
  const [fetchProductTypeError, setFetchProductTypeError] = useState(null);

  const [budget, setBudget] = useState({
    budget_name: '',
    project: null,
    entries: []
  });

  const [selectedProject, setSelectedProject] = useState(null);

  const [expandedSections, setExpandedSections] = useState({})

  // Functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBudget((prevBudget) => ({
      ...prevBudget,
      [name]: value,
    }));
  };

  // VERSION 1 : const handleProjectChange = (e) => {
  //   const targetProject = projectState.find(project => project._id === e.target.value);

  //   const test = targetProject.area_obj_ref.flatMap(areaObj => {
  //     const x = areaObj 
  //     console.log("x showing:", x)
  //   })

  //   console.log("test showing:", test)
  
  //   const transformedEntries = targetProject.area_obj_ref.flatMap(areaObj => {
  //     const area = areaObj.areas;
  
  //     return area.levels.map(level => ({
  //       area_info: {
  //         area_id: areaObj._id,
  //         area_name: area.area_name,
  //         level_id: level._id,
  //         level_name: level.level_name,
  //         subarea_id: null,
  //         subarea_name: ""
  //       },
  //       product_type_obj_ref: productTypeState.map(type => ({
  //         type_id: type._id,
  //         type_name: type.type_name,
  //         type_total_m2: 0,
  //         type_rate: 0,
  //         type_total_amount: 0,
  //         category_obj_ref: type.type_categories.map(category => ({
  //           category_id: category._id,
  //           category_name: category.category_name,
  //           category_total_m2: 0,
  //           category_rate: 0,
  //           category_total_amount: 0,
  //           subcategory_obj_ref: category.subcategories.map(subcategory => ({
  //             subcategory_id: subcategory._id,
  //             subcategory_name: subcategory.subcategory_name,
  //             subcategory_total_m2: 0,
  //             subcategory_rate: 0,
  //             subcategory_total_amount: 0
  //           }))
  //         }))
  //       }))
  //     }));
  //   });
  
  //   setBudget(prevBudget => ({
  //     ...prevBudget,
  //     project: e.target.value,
  //     entries: transformedEntries
  //   }));
  
  //   setSelectedProject(targetProject);
  // };



  // VERSION 2 : const handleProjectChange = (e) => {
  //   const targetProject = projectState.find(project => project._id === e.target.value);
  
  //   const transformedEntries = targetProject.area_obj_ref.map(areaObj => ({
  //     area_info: {
  //       area_id: areaObj._id,
  //       area_name: areaObj.areas.area_name,
  //       product_type_obj_ref: productTypeState.map(type => ({
  //         type_id: type._id,
  //         type_name: type.type_name,
  //         type_total_m2: 0,
  //         type_rate: 0,
  //         type_total_amount: 0,
  //         category_obj_ref: type.type_categories.map(category => ({
  //           category_id: category._id,
  //           category_name: category.category_name,
  //           category_total_m2: 0,
  //           category_rate: 0,
  //           category_total_amount: 0,
  //           subcategory_obj_ref: category.subcategories.map(subcategory => ({
  //             subcategory_id: subcategory._id,
  //             subcategory_name: subcategory.subcategory_name,
  //             subcategory_total_m2: 0,
  //             subcategory_rate: 0,
  //             subcategory_total_amount: 0
  //           }))
  //         }))
  //       })),
  //       level_info: areaObj.areas.levels.map(level => ({
  //         level_id: level._id,
  //         level_name: level.level_name,
  //         product_type_obj_ref: productTypeState.map(type => ({
  //           type_id: type._id,
  //           type_name: type.type_name,
  //           type_total_m2: 0,
  //           type_rate: 0,
  //           type_total_amount: 0,
  //           category_obj_ref: type.type_categories.map(category => ({
  //             category_id: category._id,
  //             category_name: category.category_name,
  //             category_total_m2: 0,
  //             category_rate: 0,
  //             category_total_amount: 0,
  //             subcategory_obj_ref: category.subcategories.map(subcategory => ({
  //               subcategory_id: subcategory._id,
  //               subcategory_name: subcategory.subcategory_name,
  //               subcategory_total_m2: 0,
  //               subcategory_rate: 0,
  //               subcategory_total_amount: 0
  //             }))
  //           }))
  //         })),
  //         subarea_info: level.subareas.map(subarea => ({
  //           subarea_id: subarea._id,
  //           subarea_name: subarea.subarea_name,
  //           product_type_obj_ref: productTypeState.map(type => ({
  //             type_id: type._id,
  //             type_name: type.type_name,
  //             type_total_m2: 0,
  //             type_rate: 0,
  //             type_total_amount: 0,
  //             category_obj_ref: type.type_categories.map(category => ({
  //               category_id: category._id,
  //               category_name: category.category_name,
  //               category_total_m2: 0,
  //               category_rate: 0,
  //               category_total_amount: 0,
  //               subcategory_obj_ref: category.subcategories.map(subcategory => ({
  //                 subcategory_id: subcategory._id,
  //                 subcategory_name: subcategory.subcategory_name,
  //                 subcategory_total_m2: 0,
  //                 subcategory_rate: 0,
  //                 subcategory_total_amount: 0
  //               }))
  //             }))
  //           }))
  //         }))
  //       }))
  //     }
  //   }));
  
  //   setBudget(prevBudget => ({
  //     ...prevBudget,
  //     project: e.target.value,
  //     entries: transformedEntries
  //   }));
  
  //   setSelectedProject(targetProject);
  // };

  const handleProjectChange = (e) => {
    const targetProject = projectState.find(project => project._id === e.target.value);
  
    // Create productType template once to avoid redundant mapping
    const productTypeTemplate = productTypeState.map(type => ({
      type_id: type._id,
      type_name: type.type_name,
      type_total_m2: 0,
      type_rate: 0,
      type_total_amount: 0,
      category_obj_ref: (type.type_categories ?? []).map(category => ({
        category_id: category._id,
        category_name: category.category_name,
        category_total_m2: 0,
        category_rate: 0,
        category_total_amount: 0,
        subcategory_obj_ref: (category.subcategories ?? []).map(subcategory => ({
          subcategory_id: subcategory._id,
          subcategory_name: subcategory.subcategory_name,
          subcategory_total_m2: 0,
          subcategory_rate: 0,
          subcategory_total_amount: 0
        }))
      }))
    }));
  
    const transformedEntries = targetProject.area_obj_ref.map(areaObj => ({
      area_info: {
        area_id: areaObj._id,
        area_name: areaObj.areas.area_name,
        product_type_obj_ref: productTypeTemplate, // Reuse productTypeTemplate
        level_info: (areaObj.areas.levels ?? []).map(level => ({
          level_id: level._id,
          level_name: level.level_name,
          product_type_obj_ref: productTypeTemplate, // Reuse productTypeTemplate
          subarea_info: (level.subareas ?? []).map(subarea => ({
            subarea_id: subarea._id,
            subarea_name: subarea.subarea_name,
            product_type_obj_ref: productTypeTemplate // Reuse productTypeTemplate
          }))
        }))
      }
    }));
  
    setBudget(prevBudget => ({
      ...prevBudget,
      project: e.target.value,
      entries: transformedEntries
    }));
  
    setSelectedProject(targetProject);
  };
  
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
    console.log("expandedSections", expandedSections)
  }

  // Fetch all projects
  useEffect(() => {
      const abortController = new AbortController();
      const signal = abortController.signal;
  
      const fetchProjects = async () => {
          setIsFetchProjectLoading(true); // Set loading state to true at the beginning
          try {
              const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, { signal , credentials: 'include',
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
              
              setIsFetchProjectLoading(false);
              setProjectState(data);
              setFetchProjectError(null);
          } catch (error) {
              if (error.name === 'AbortError') {
                  // do nothing
              } else {
                  setIsFetchProjectLoading(false);
                  setFetchProjectError(error.message);
              }
          }
      };
  
      fetchProjects();
  
      return () => {
          abortController.abort(); // Cleanup
      };
  }, []);
  // Fetch all product types
  useEffect(() => {
      const abortController = new AbortController();
      const signal = abortController.signal;
  
      const fetchTypes = async () => {
          setIsFetchProjectLoading(true); // Set loading state to true at the beginning
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
              
              setIsFetchProductTypeLoading(false);
              setProductTypeState(data);
              setFetchProductTypeError(null);
          } catch (error) {
              if (error.name === 'AbortError') {
                  // do nothing
              } else {
                  setIsFetchProductTypeLoading(false);
                  setFetchProductTypeError(error.message);
              }
          }
      };
  
      fetchTypes();
  
      return () => {
          abortController.abort(); // Cleanup
      };
  }, []);

  console.log("projectState", projectState)
  console.log("productTypeState", productTypeState)
  console.log("budget", budget)
  console.log("selectedProject", selectedProject)

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Create Budget</h2>
        </div>

        <div className="p-6">
          <form
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            onSubmit={(e) => {
              e.preventDefault()
              // Submit logic here
            }}
            className="space-y-6"
          >
            {/* Budget Name */}
            <div className="flex gap-x-4">
              <div className="w-full">
                <label htmlFor="budget_name" className="block text-sm font-medium text-gray-700">
                  Budget Name
                </label>
                <input
                  id="budget_name"
                  name="budget_name"
                  type="text"
                  value={budget.budget_name}
                  onChange={handleChange}
                  placeholder="Enter budget name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Project Selection */}
              <div className="w-full">
                <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                  Project
                </label>
                <select
                  id="project"
                  name="project"
                  value={budget.project}
                  onChange={handleProjectChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a project</option>
                  {projectState.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Areas Section */}
            {budget.entries && (
              <div className="mt-8 space-y-6">
                <div className="border-t border-gray-200 my-6"></div>
                <h3 className="text-lg font-medium mb-4">Project Areas</h3>

                {budget.entries.map((entry, entryIndex) => {
                  const area = entry.area_info
                  const areaId = `area-${entry.area_info.area_id}`
                  const isExpanded = expandedSections[areaId] !== false // Default to expanded

                  return (
                    <div
                      key={entryIndex}
                      className="border rounded-lg overflow-hidden border-l-4 border-l-blue-500 mb-4"
                    >
                      <div className="bg-red-100 py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown 
                                size={18}
                                className="text-gray-600 cursor-pointer hover:scale-125"
                                onClick={() => toggleSection(areaId)}
                              />
                            ) : (
                              <ChevronRight 
                                size={18}
                                className="text-gray-600 cursor-pointer hover:scale-125"
                                onClick={() => toggleSection(areaId)}
                              />
                            )}
                            <h4 className="font-medium cursor-pointer hover:scale-105" onClick={() => toggleSection(areaId)}>{area.area_name}</h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Area
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`relative ${isExpanded ? 'hidden': 'block'}`}>
                              <select className="px-2 py-1 w-18 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option>M2</option>
                                <option>LGTH</option>
                                <option>UNIT</option>
                                <option>EACH</option>
                              </select>
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                {}
                              </span>
                              <input
                                type="number"
                                name={`productType_total_m2_${areaId}`}
                                id={`productType_total_m2_${areaId}`}
                                placeholder="0.00"
                                aria-label={`Total m2 for ${area.product_type_obj_ref.type_name}`}
                                className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className={`relative ${isExpanded ? 'hidden': 'block'}`}>
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                $
                              </span>
                              <input
                                type="number"
                                name={`productType_rate_${areaId}`}
                                id={`productType_rate_${areaId}`}
                                placeholder="0.00"
                                aria-label={`Rate for ${area.product_type_obj_ref.type_name}`}
                                className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                $
                              </span>
                              <input
                                type="number"
                                name={`area_budget_${entry._id}`}
                                id={`area_budget_${entry._id}`}
                                placeholder="0.00"
                                aria-label={`Budget for ${area.area_name}`}
                                className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                min="0"
                                step="0.01"
                                disabled={isExpanded}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product Type section */}
                      {isExpanded && (
                        <div className="p-4">
                          {productTypeState.map((productType, typeIndex) => {
                            const typeId = `type-${productType._id}-${entry._id}`
                            const isTypeExpanded = expandedSections[typeId] !== false // Default to expanded

                            return (
                              <div key={typeIndex} className="mt-4">
                                <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md relative">
                                  {!isTypeExpanded && 
                                    <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-blue-600 bg-opacity-75 text-white text-xs flex items-center justify-center shadow-md">
                                      {productType.type_categories.length}
                                    </div>
                                  }
                                  <div className="flex items-center gap-2">
                                    {isTypeExpanded ? (
                                      <ChevronDown size={16} className="text-gray-600 cursor-pointer hover:scale-125" onClick={() => toggleSection(typeId)}/>
                                    ) : (
                                      <ChevronRight size={16} className="text-gray-600 cursor-pointer hover:scale-125" onClick={() => toggleSection(typeId)}/>
                                    )}
                                    <span className="font-medium cursor-pointer hover:scale-105" onClick={() => toggleSection(typeId)}>{productType.type_name}</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-200 text-indigo-800">
                                      Product Type
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <select className="px-2 py-1 w-18 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option>M2</option>
                                        <option>LGTH</option>
                                        <option>UNIT</option>
                                        <option>EACH</option>
                                      </select>
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        {}
                                      </span>
                                      <input
                                        type="number"
                                        name={`productType_total_m2_${productType._id}`}
                                        id={`productType_total_m2_${productType._id}`}
                                        placeholder="0.00"
                                        aria-label={`Total m2 for ${productType.type_name}`}
                                        className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                        min="0"
                                        step="0.01"
                                      />
                                    </div>
                                    <div className="relative">
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        $
                                      </span>
                                      <input
                                        type="number"
                                        name={`productType_rate_${productType._id}`}
                                        id={`productType_rate_${productType._id}`}
                                        placeholder="0.00"
                                        aria-label={`Rate for ${productType.type_name}`}
                                        className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                        min="0"
                                        step="0.01"
                                      />
                                    </div>
                                    <div className="relative">
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        $
                                      </span>
                                      <input
                                        type="number"
                                        name={`productType_total_amount_${productType._id}`}
                                        id={`productType_total_amount_${productType._id}`}
                                        placeholder="0.00"
                                        aria-label={`Total amount for ${productType.type_name}`}
                                        className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right disabled:bg-gray-50"
                                        min="0"
                                        step="0.01"
                                        disabled
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Category section */}
                                {isTypeExpanded && (
                                  <div className="pl-4 mt-3 space-y-4">
                                    {productType.type_categories.map((category, catIndex) => {
                                      const catId = `cat-${category._id}-${productType._id}`
                                      const isCatExpanded = expandedSections[catId] !== false // Default to expanded

                                      return (
                                        <div key={catIndex} className="border rounded-md overflow-hidden">
                                          <div className="flex items-center justify-between bg-white p-3 border-b relative">
                                            {!isCatExpanded && 
                                              <div className="absolute top-0 left-0 w-5 h-5 rounded-full bg-purple-600 bg-opacity-60 text-white text-xs flex items-center justify-center shadow-md">
                                                {category.subcategories.length}
                                              </div>
                                            }
                                            <div className="flex items-center gap-2">
                                              {isCatExpanded ? (
                                                <ChevronDown size={16} className="text-gray-600 cursor-pointer hover:scale-125" onClick={() => toggleSection(catId)}/>
                                              ) : (
                                                <ChevronRight size={16} className="text-gray-600 cursor-pointer hover:scale-125" onClick={() => toggleSection(catId)}/>
                                              )}
                                              <span className=" cursor-pointer hover:scale-105" onClick={() => toggleSection(catId)}>{category.category_name}</span>
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                Category
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="relative">
                                                <select className="px-2 py-1 w-18 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                  <option>M2</option>
                                                  <option>LGTH</option>
                                                  <option>UNIT</option>
                                                  <option>EACH</option>
                                                </select>
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                  {}
                                                </span>
                                                <input
                                                  type="number"
                                                  name={`category_total_m2_${category._id}`}
                                                  id={`category_total_m2_${category._id}`}
                                                  placeholder="0.00"
                                                  aria-label={`Total m2 for ${category.category_name}`}
                                                  className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                  min="0"
                                                  step="0.01"
                                                />
                                              </div>
                                              <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                  $
                                                </span>
                                                <input
                                                  type="number"
                                                  name={`category_budget_${category._id}`}
                                                  id={`category_budget_${category._id}`}
                                                  placeholder="0.00"
                                                  aria-label={`Budget for ${category.category_name}`}
                                                  className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                  min="0"
                                                  step="0.01"
                                                />
                                              </div>
                                              <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                  $
                                                </span>
                                                <input
                                                  type="number"
                                                  name={`category_total_amount_${category._id}`}
                                                  id={`category_total_amount_${category._id}`}
                                                  placeholder="0.00"
                                                  aria-label={`Total amount for ${category.category_name}`}
                                                  className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right disabled:bg-gray-50"
                                                  min="0"
                                                  step="0.01"
                                                  disabled
                                                />
                                              </div>
                                            </div>
                                          </div>

                                          {/* Subcategory section */}
                                          {isCatExpanded && (
                                            <div className="p-3 bg-gray-50">
                                              <label className="text-sm text-gray-500 mb-2 block">Subcategories</label>
                                              <div className="space-y-2">
                                                {category.subcategories.map((subcategory, subIndex) => (
                                                  <div
                                                    key={subIndex}
                                                    className="flex items-center gap-2 pl-2 py-2 px-3 bg-white rounded-md border border-gray-200 justify-between"
                                                  >
                                                    <div>
                                                      <span className="text-sm">{subcategory.subcategory_name}</span>
                                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 ml-2">
                                                          Subcategory
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <div className="relative">
                                                        <select className="px-2 py-1 w-18 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                          <option>M2</option>
                                                          <option>LGTH</option>
                                                          <option>UNIT</option>
                                                          <option>EACH</option>
                                                        </select>
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                          {}
                                                        </span>
                                                        <input
                                                          type="number"
                                                          name={`category_total_m2_${category._id}`}
                                                          id={`category_total_m2_${category._id}`}
                                                          placeholder="0.00"
                                                          aria-label={`Total m2 for ${category.category_name}`}
                                                          className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                          min="0"
                                                          step="0.01"
                                                        />
                                                      </div>
                                                      <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                          $
                                                        </span>
                                                        <input
                                                          type="number"
                                                          name={`subcategory_budget_${subcategory._id}`}
                                                          id={`subcategory_budget_${subcategory._id}`}
                                                          placeholder="0.00"
                                                          aria-label={`Budget for ${subcategory.category_name}`}
                                                          className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                          min="0"
                                                          step="0.01"
                                                        />
                                                      </div>
                                                      <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                          $
                                                        </span>
                                                        <input
                                                          type="number"
                                                          name={`category_total_amount_${category._id}`}
                                                          id={`category_total_amount_${category._id}`}
                                                          placeholder="0.00"
                                                          aria-label={`Total amount for ${category.category_name}`}
                                                          className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right disabled:bg-gray-50"
                                                          min="0"
                                                          step="0.01"
                                                          disabled
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Submit Budget
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
 
export default NewBudgetForm2;