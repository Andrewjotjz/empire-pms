"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Building, Layers, Grid3X3, Package, Save } from "lucide-react"


export default function BudgetPlanner() {
  const [projectState, setProjectState] = useState([])
  const [isFetchProjectLoading, setIsFetchProjectLoading] = useState(false)
  const [fetchProjectError, setFetchProjectError] = useState(null)

  const [productTypeState, setProductTypeState] = useState([])
  const [isFetchProductTypeLoading, setIsFetchProductTypeLoading] = useState(false)
  const [fetchProductTypeError, setFetchProductTypeError] = useState(null)

  const [budget, setBudget] = useState({
    budget_name: "",
    project: null,
    entries: [], // Initialize as empty array as per the updated structure
  })

  const [selectedProject, setSelectedProject] = useState(null)
  const [expandedSections, setExpandedSections] = useState({})

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


  const handleChange = (e) => {
    const { name, value } = e.target
    setBudget((prevBudget) => ({
      ...prevBudget,
      [name]: value,
    }))
  }

  const handleProjectChange = (e) => {
    const targetProject = projectState.find((project) => project._id === e.target.value)

    // Create productType template once to avoid redundant mapping
    const productTypeTemplate = productTypeState.map((type) => ({
      type_id: type._id,
      type_name: type.type_name,
      type_total_m2: 0,
      type_rate: 0,
      type_total_amount: 0,
      category_obj_ref: (type.type_categories ?? []).map((category) => ({
        category_id: category._id,
        category_name: category.category_name,
        category_total_m2: 0,
        category_rate: 0,
        category_total_amount: 0,
        subcategory_obj_ref: (category.subcategories ?? []).map((subcategory) => ({
          subcategory_id: subcategory._id,
          subcategory_name: subcategory.subcategory_name,
          subcategory_total_m2: 0,
          subcategory_rate: 0,
          subcategory_total_amount: 0,
        })),
      })),
    }))

    const transformedEntries = targetProject.area_obj_ref.map((areaObj) => ({
      area_info: {
        area_id: areaObj._id,
        area_name: areaObj.areas.area_name,
        product_type_obj_ref: productTypeTemplate, // Reuse productTypeTemplate
        level_info: (areaObj.areas.levels ?? []).map((level) => ({
          level_id: level._id,
          level_name: level.level_name,
          product_type_obj_ref: productTypeTemplate, // Reuse productTypeTemplate
          subarea_info: (level.subareas ?? []).map((subarea) => ({
            subarea_id: subarea._id,
            subarea_name: subarea.subarea_name,
            product_type_obj_ref: productTypeTemplate, // Reuse productTypeTemplate
          })),
        })),
      },
    }))

    setBudget((prevBudget) => ({
      ...prevBudget,
      project: e.target.value,
      entries: transformedEntries,
    }))

    setSelectedProject(targetProject)
  }

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  // Calculate totals for a product type entry
  const calculateTotals = (m2, rate) => {
    const m2Value = Number.parseFloat(m2) || 0
    const rateValue = Number.parseFloat(rate) || 0
    return Math.round(m2Value * rateValue * 100) / 100
  }

  // Handle input changes for product type entries
  const handleProductTypeInput = (e, areaId, levelId, subareaId, typeId, categoryId, subcategoryId, field) => {
    const value = Number.parseFloat(e.target.value) || 0

    setBudget((prevBudget) => {
      const newBudget = JSON.parse(JSON.stringify(prevBudget)) // Deep clone to avoid reference issues
      const areaIndex = newBudget.entries.findIndex((entry) => entry.area_info.area_id === areaId)

      if (areaIndex === -1) return prevBudget

      // Determine which part of the hierarchy to update
      let targetObj

      if (levelId && subareaId) {
        // Subarea level
        const levelIndex = newBudget.entries[areaIndex].area_info.level_info.findIndex(
          (level) => level.level_id === levelId,
        )
        if (levelIndex === -1) return prevBudget

        const subareaIndex = newBudget.entries[areaIndex].area_info.level_info[levelIndex].subarea_info.findIndex(
          (subarea) => subarea.subarea_id === subareaId,
        )
        if (subareaIndex === -1) return prevBudget

        targetObj = newBudget.entries[areaIndex].area_info.level_info[levelIndex].subarea_info[subareaIndex]
      } else if (levelId) {
        // Level level
        const levelIndex = newBudget.entries[areaIndex].area_info.level_info.findIndex(
          (level) => level.level_id === levelId,
        )
        if (levelIndex === -1) return prevBudget

        targetObj = newBudget.entries[areaIndex].area_info.level_info[levelIndex]
      } else {
        // Area level
        targetObj = newBudget.entries[areaIndex].area_info
      }

      // Find the type in the target object
      const typeIndex = targetObj.product_type_obj_ref.findIndex((type) => type.type_id === typeId)
      if (typeIndex === -1) return prevBudget

      // Update based on category and subcategory
      if (categoryId && subcategoryId) {
        // Update at subcategory level
        const categoryIndex = targetObj.product_type_obj_ref[typeIndex].category_obj_ref.findIndex(
          (category) => category.category_id === categoryId,
        )
        if (categoryIndex === -1) return prevBudget

        const subcategoryIndex = targetObj.product_type_obj_ref[typeIndex].category_obj_ref[
          categoryIndex
        ].subcategory_obj_ref.findIndex((subcategory) => subcategory.subcategory_id === subcategoryId)
        if (subcategoryIndex === -1) return prevBudget

        // Update the field
        targetObj.product_type_obj_ref[typeIndex].category_obj_ref[categoryIndex].subcategory_obj_ref[subcategoryIndex][
          field
        ] = value

        // Recalculate total for this subcategory
        if (field === "subcategory_total_m2" || field === "subcategory_rate") {
          const m2 =
            targetObj.product_type_obj_ref[typeIndex].category_obj_ref[categoryIndex].subcategory_obj_ref[
              subcategoryIndex
            ].subcategory_total_m2
          const rate =
            targetObj.product_type_obj_ref[typeIndex].category_obj_ref[categoryIndex].subcategory_obj_ref[
              subcategoryIndex
            ].subcategory_rate

          targetObj.product_type_obj_ref[typeIndex].category_obj_ref[categoryIndex].subcategory_obj_ref[
            subcategoryIndex
          ].subcategory_total_amount = calculateTotals(m2, rate)
        }

        // Update category total (sum of subcategories)
        let categoryTotal = 0
        targetObj.product_type_obj_ref[typeIndex].category_obj_ref[categoryIndex].subcategory_obj_ref.forEach(
          (subcategory) => {
            categoryTotal += Number.parseFloat(subcategory.subcategory_total_amount || 0)
          },
        )
        targetObj.product_type_obj_ref[typeIndex].category_obj_ref[categoryIndex].category_total_amount =
          Math.round(categoryTotal * 100) / 100

        // Update type total (sum of categories)
        let typeTotal = 0
        targetObj.product_type_obj_ref[typeIndex].category_obj_ref.forEach((category) => {
          typeTotal += Number.parseFloat(category.category_total_amount || 0)
        })
        targetObj.product_type_obj_ref[typeIndex].type_total_amount = Math.round(typeTotal * 100) / 100

      } else if (categoryId) {
        // Update at category level
        const categoryIndex = targetObj.product_type_obj_ref[typeIndex].category_obj_ref.findIndex(
          (category) => category.category_id === categoryId,
        )
        if (categoryIndex === -1) return prevBudget

        // Update the field
        targetObj.product_type_obj_ref[typeIndex].category_obj_ref[categoryIndex][field] = value

        // Recalculate total for this category if m2 or rate changed directly
        if (field === "category_total_m2" || field === "category_rate") {
          const m2 = targetObj.product_type_obj_ref[typeIndex].category_obj_ref[categoryIndex].category_total_m2
          const rate = targetObj.product_type_obj_ref[typeIndex].category_obj_ref[categoryIndex].category_rate

          targetObj.product_type_obj_ref[typeIndex].category_obj_ref[categoryIndex].category_total_amount =
            calculateTotals(m2, rate)
        }

        // Update type total (sum of categories)
        let typeTotal = 0
        targetObj.product_type_obj_ref[typeIndex].category_obj_ref.forEach((category) => {
          typeTotal += Number.parseFloat(category.category_total_amount || 0)
        })
        targetObj.product_type_obj_ref[typeIndex].type_total_amount = Math.round(typeTotal * 100) / 100

      } else {
        // Update at type level
        targetObj.product_type_obj_ref[typeIndex][field] = value

        // If direct type values changed, update the type total
        if (field === "type_total_m2" || field === "type_rate") {
          const m2 = targetObj.product_type_obj_ref[typeIndex].type_total_m2
          const rate = targetObj.product_type_obj_ref[typeIndex].type_rate

          // Calculate direct type amount (not including categories)
          const directTypeAmount = Number.parseFloat(calculateTotals(m2, rate))

          // Sum category amounts
          let categoriesTotal = 0
          targetObj.product_type_obj_ref[typeIndex].category_obj_ref.forEach((category) => {
            categoriesTotal += Number.parseFloat(category.category_total_amount || 0)
          })

          // Type total is direct amount plus categories
          targetObj.product_type_obj_ref[typeIndex].type_total_amount = Math.round((directTypeAmount + categoriesTotal) * 100) / 100

        }
      }

      return newBudget
    })
  }

  // Calculate budget totals
  const calculateBudgetTotals = () => {
    let totalBudget = 0

    // Calculate totals for each area, level, and subarea
    budget.entries.forEach((entry) => {
      // Area level calculations
      if (entry.area_info.product_type_obj_ref) {
        entry.area_info.product_type_obj_ref.forEach((type) => {
          totalBudget += Number.parseFloat(type.type_total_amount || 0)
        })
      }

      // Level calculations
      if (entry.area_info.level_info) {
        entry.area_info.level_info.forEach((level) => {
          if (level.product_type_obj_ref) {
            level.product_type_obj_ref.forEach((type) => {
              totalBudget += Number.parseFloat(type.type_total_amount || 0)
            })
          }

          // Subarea calculations
          if (level.subarea_info) {
            level.subarea_info.forEach((subarea) => {
              if (subarea.product_type_obj_ref) {
                subarea.product_type_obj_ref.forEach((type) => {
                  totalBudget += Number.parseFloat(type.type_total_amount || 0)
                })
              }
            })
          }
        })
      }
    })

    return Math.round(totalBudget * 100) / 100

  }

  // Calculate area totals for summary
  const calculateAreaTotals = (areaId) => {
    let areaTotal = 0
    const areaEntry = budget.entries.find((entry) => entry.area_info.area_id === areaId)

    if (!areaEntry) return "0.00"

    // Sum area level product types
    if (areaEntry.area_info.product_type_obj_ref) {
      areaEntry.area_info.product_type_obj_ref.forEach((type) => {
        areaTotal += Number.parseFloat(type.type_total_amount || 0)
      })
    }

    // Sum all levels and subareas within this area
    if (areaEntry.area_info.level_info) {
      areaEntry.area_info.level_info.forEach((level) => {
        if (level.product_type_obj_ref) {
          level.product_type_obj_ref.forEach((type) => {
            areaTotal += Number.parseFloat(type.type_total_amount || 0)
          })
        }

        if (level.subarea_info) {
          level.subarea_info.forEach((subarea) => {
            if (subarea.product_type_obj_ref) {
              subarea.product_type_obj_ref.forEach((type) => {
                areaTotal += Number.parseFloat(type.type_total_amount || 0)
              })
            }
          })
        }
      })
    }

    return Math.round(areaTotal * 100) / 100

  }

  // Calculate product type totals for summary
  const calculateProductTypeTotals = (typeId) => {
    let typeTotal = 0

    budget.entries.forEach((entry) => {
      // Area level
      if (entry.area_info.product_type_obj_ref) {
        const typeEntry = entry.area_info.product_type_obj_ref.find((type) => type.type_id === typeId)
        if (typeEntry) {
          typeTotal += Number.parseFloat(typeEntry.type_total_amount || 0)
        }
      }

      // Level level
      if (entry.area_info.level_info) {
        entry.area_info.level_info.forEach((level) => {
          if (level.product_type_obj_ref) {
            const typeEntry = level.product_type_obj_ref.find((type) => type.type_id === typeId)
            if (typeEntry) {
              typeTotal += Number.parseFloat(typeEntry.type_total_amount || 0)
            }
          }

          // Subarea level
          if (level.subarea_info) {
            level.subarea_info.forEach((subarea) => {
              if (subarea.product_type_obj_ref) {
                const typeEntry = subarea.product_type_obj_ref.find((type) => type.type_id === typeId)
                if (typeEntry) {
                  typeTotal += Number.parseFloat(typeEntry.type_total_amount || 0)
                }
              }
            })
          }
        })
      }
    })

    return Math.round(typeTotal * 100) / 100

  }

  if (isFetchProjectLoading || isFetchProductTypeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (fetchProjectError || fetchProductTypeError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <p>Error: {fetchProjectError || fetchProductTypeError}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Budget Planner</h1>

        {/* Budget Name */}
        <div className="mb-6">
          <label htmlFor="budget_name" className="block text-sm font-medium text-gray-700 mb-1">
            Budget Name
          </label>
          <input
            type="text"
            id="budget_name"
            name="budget_name"
            value={budget.budget_name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter budget name"
          />
        </div>

        {/* Project Selection */}
        <div className="mb-8">
          <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
            Select Project
          </label>
          <select
            id="project"
            name="project"
            value={budget.project || ""}
            onChange={handleProjectChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select a project</option>
            {projectState.map((project) => (
              <option key={project._id} value={project._id}>
                {project.project_name}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Entries */}
        {selectedProject && budget.entries.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Budget Details</h2>

            {/* Areas */}
            {budget.entries.map((entry) => (
              <div key={`area-${entry.area_info.area_id}`} className="border border-gray-200 rounded-md p-4">
                <div
                  className="flex items-center cursor-pointer mb-4"
                  onClick={() => toggleSection(`area-${entry.area_info.area_id}`)}
                >
                  {expandedSections[`area-${entry.area_info.area_id}`] ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <Building className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-medium text-gray-800">{entry.area_info.area_name}</h3>
                </div>

                {expandedSections[`area-${entry.area_info.area_id}`] && (
                  <div className="pl-6 space-y-4">
                    {/* Product Types for Area */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <Package className="h-4 w-4 text-gray-600 mr-2" />
                        Product Types for {entry.area_info.area_name}
                      </h4>

                      <div className="space-y-4 mt-2">
                        {entry.area_info.product_type_obj_ref &&
                          entry.area_info.product_type_obj_ref.map((type) => (
                            <div
                              key={`area-${entry.area_info.area_id}-type-${type.type_id}`}
                              className="border border-gray-100 rounded-md p-3"
                            >
                              <div
                                className="flex items-center cursor-pointer mb-2"
                                onClick={() => toggleSection(`area-${entry.area_info.area_id}-type-${type.type_id}`)}
                              >
                                {expandedSections[`area-${entry.area_info.area_id}-type-${type.type_id}`] ? (
                                  <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                                )}
                                <div className="text-sm font-medium text-gray-700">{type.type_name}</div>
                              </div>

                              <div className="grid grid-cols-4 gap-2 items-center mb-2">
                                <div className="text-xs text-gray-500">Area (m²)</div>
                                <input
                                  type="number"
                                  placeholder="m²"
                                  value={type.type_total_m2 || ""}
                                  className="p-1 border border-gray-300 rounded text-sm"
                                  onChange={(e) =>
                                    handleProductTypeInput(
                                      e,
                                      entry.area_info.area_id,
                                      null,
                                      null,
                                      type.type_id,
                                      null,
                                      null,
                                      "type_total_m2",
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  placeholder="Rate"
                                  value={type.type_rate || ""}
                                  className="p-1 border border-gray-300 rounded text-sm"
                                  onChange={(e) =>
                                    handleProductTypeInput(
                                      e,
                                      entry.area_info.area_id,
                                      null,
                                      null,
                                      type.type_id,
                                      null,
                                      null,
                                      "type_rate",
                                    )
                                  }
                                />
                                <div className="text-sm font-medium text-gray-800">
                                  ${type.type_total_amount || "0.00"}
                                </div>
                              </div>

                              {expandedSections[`area-${entry.area_info.area_id}-type-${type.type_id}`] &&
                                type.category_obj_ref && (
                                  <div className="pl-4 space-y-3 mt-3 border-l-2 border-gray-200">
                                    {type.category_obj_ref.map((category) => (
                                      <div
                                        key={`area-${entry.area_info.area_id}-type-${type.type_id}-cat-${category.category_id}`}
                                      >
                                        <div
                                          className="flex items-center cursor-pointer mb-2"
                                          onClick={() =>
                                            toggleSection(
                                              `area-${entry.area_info.area_id}-type-${type.type_id}-cat-${category.category_id}`,
                                            )
                                          }
                                        >
                                          {expandedSections[
                                            `area-${entry.area_info.area_id}-type-${type.type_id}-cat-${category.category_id}`
                                          ] ? (
                                            <ChevronDown className="h-4 w-4 text-gray-500 mr-1" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-500 mr-1" />
                                          )}
                                          <div className="text-sm text-gray-700">{category.category_name}</div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 items-center mb-2">
                                            <div className="text-xs text-gray-500">Area (m²)</div>
                                            <input
                                            type="number"
                                            placeholder="m²"
                                            value={category.category_total_m2 || ""}
                                            className="p-1 border border-gray-300 rounded text-sm"
                                            onChange={(e) =>
                                                handleProductTypeInput(
                                                e,
                                                entry.area_info.area_id,
                                                null,
                                                null,
                                                type.type_id,
                                                category.category_id,
                                                null,
                                                "category_total_m2",
                                                )
                                            }
                                            />
                                            <input
                                            type="number"
                                            placeholder="Rate"
                                            value={category.category_rate || ""}
                                            className="p-1 border border-gray-300 rounded text-sm"
                                            onChange={(e) =>
                                                handleProductTypeInput(
                                                e,
                                                entry.area_info.area_id,
                                                null,
                                                null,
                                                type.type_id,
                                                category.category_id,
                                                null,
                                                "category_rate",
                                                )
                                            }
                                            />
                                            <div className="text-sm font-medium text-gray-800">
                                            ${category.category_total_amount || "0.00"}
                                            </div>
                                        </div>

                                        {expandedSections[
                                          `area-${entry.area_info.area_id}-type-${type.type_id}-cat-${category.category_id}`
                                        ] &&
                                          category.subcategory_obj_ref && (
                                            <div className="pl-4 space-y-2 mt-2">
                                              {category.subcategory_obj_ref.map((subcategory) => (
                                                <div
                                                  key={`area-${entry.area_info.area_id}-type-${type.type_id}-cat-${category.category_id}-subcat-${subcategory.subcategory_id}`}
                                                  className="grid grid-cols-4 gap-2 items-center"
                                                >
                                                  <div className="text-xs text-gray-600">
                                                    {subcategory.subcategory_name}
                                                  </div>
                                                  <input
                                                    type="number"
                                                    placeholder="m²"
                                                    className="p-1 border border-gray-300 rounded text-xs"
                                                    value={subcategory.subcategory_total_m2 || ""}
                                                    onChange={(e) =>
                                                      handleProductTypeInput(
                                                        e,
                                                        entry.area_info.area_id,
                                                        null,
                                                        null,
                                                        type.type_id,
                                                        category.category_id,
                                                        subcategory.subcategory_id,
                                                        "subcategory_total_m2",
                                                      )
                                                    }
                                                  />
                                                  <input
                                                    type="number"
                                                    placeholder="Rate"
                                                    className="p-1 border border-gray-300 rounded text-xs"
                                                    value={subcategory.subcategory_rate || ""}
                                                    onChange={(e) =>
                                                      handleProductTypeInput(
                                                        e,
                                                        entry.area_info.area_id,
                                                        null,
                                                        null,
                                                        type.type_id,
                                                        category.category_id,
                                                        subcategory.subcategory_id,
                                                        "subcategory_rate",
                                                      )
                                                    }
                                                  />
                                                  <div className="text-xs font-medium text-gray-800">
                                                    ${subcategory.subcategory_total_amount || "0.00"}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Levels */}
                    {entry.area_info.level_info &&
                      entry.area_info.level_info.map((level) => (
                        <div key={`level-${level.level_id}`} className="border-l-2 border-gray-200 pl-4">
                          <div
                            className="flex items-center cursor-pointer mb-3"
                            onClick={() => toggleSection(`level-${level.level_id}`)}
                          >
                            {expandedSections[`level-${level.level_id}`] ? (
                              <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                            )}
                            <Layers className="h-5 w-5 text-blue-500 mr-2" />
                            <h4 className="text-md font-medium text-gray-700">{level.level_name}</h4>
                          </div>

                          {expandedSections[`level-${level.level_id}`] && (
                            <div className="pl-6 space-y-4">
                              {/* Product Types for Level */}
                              <div className="bg-gray-50 p-3 rounded-md">
                                <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                                  <Package className="h-4 w-4 text-gray-600 mr-2" />
                                  Product Types for {level.level_name}
                                </h5>

                                <div className="space-y-4 mt-2">
                                  {level.product_type_obj_ref &&
                                    level.product_type_obj_ref.map((type) => (
                                      <div
                                        key={`level-${level.level_id}-type-${type.type_id}`}
                                        className="border border-gray-100 rounded-md p-3"
                                      >
                                        <div
                                          className="flex items-center cursor-pointer mb-2"
                                          onClick={() => toggleSection(`level-${level.level_id}-type-${type.type_id}`)}
                                        >
                                          {expandedSections[`level-${level.level_id}-type-${type.type_id}`] ? (
                                            <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                                          )}
                                          <div className="text-sm font-medium text-gray-700">{type.type_name}</div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 items-center mb-2">
                                          <div className="text-xs text-gray-500">Area (m²)</div>
                                          <input
                                            type="number"
                                            placeholder="m²"
                                            value={type.type_total_m2 || ""}
                                            className="p-1 border border-gray-300 rounded text-sm"
                                            onChange={(e) =>
                                              handleProductTypeInput(
                                                e,
                                                entry.area_info.area_id,
                                                level.level_id,
                                                null,
                                                type.type_id,
                                                null,
                                                null,
                                                "type_total_m2",
                                              )
                                            }
                                          />
                                          <input
                                            type="number"
                                            placeholder="Rate"
                                            value={type.type_rate || ""}
                                            className="p-1 border border-gray-300 rounded text-sm"
                                            onChange={(e) =>
                                              handleProductTypeInput(
                                                e,
                                                entry.area_info.area_id,
                                                level.level_id,
                                                null,
                                                type.type_id,
                                                null,
                                                null,
                                                "type_rate",
                                              )
                                            }
                                          />
                                          <div className="text-sm font-medium text-gray-800">
                                            ${type.type_total_amount || "0.00"}
                                          </div>
                                        </div>

                                        {expandedSections[`level-${level.level_id}-type-${type.type_id}`] &&
                                          type.category_obj_ref && (
                                            <div className="pl-4 space-y-3 mt-3 border-l-2 border-gray-200">
                                              {type.category_obj_ref.map((category) => (
                                                <div
                                                  key={`level-${level.level_id}-type-${type.type_id}-cat-${category.category_id}`}
                                                >
                                                  <div
                                                    className="flex items-center cursor-pointer mb-2"
                                                    onClick={() =>
                                                      toggleSection(
                                                        `level-${level.level_id}-type-${type.type_id}-cat-${category.category_id}`,
                                                      )
                                                    }
                                                  >
                                                    {expandedSections[
                                                      `level-${level.level_id}-type-${type.type_id}-cat-${category.category_id}`
                                                    ] ? (
                                                      <ChevronDown className="h-4 w-4 text-gray-500 mr-1" />
                                                    ) : (
                                                      <ChevronRight className="h-4 w-4 text-gray-500 mr-1" />
                                                    )}
                                                    <div className="text-sm text-gray-700">
                                                      {category.category_name}
                                                    </div>
                                                  </div>

                                                  <div className="grid grid-cols-4 gap-2 items-center mb-2">
                                                    <div className="text-xs text-gray-500">Area (m²)</div>
                                                    <input
                                                        type="number"
                                                        placeholder="m²"
                                                        value={category.category_total_m2 || ""}
                                                        className="p-1 border border-gray-300 rounded text-sm"
                                                        onChange={(e) =>
                                                        handleProductTypeInput(
                                                            e,
                                                            entry.area_info.area_id,
                                                            level.level_id,
                                                            null,
                                                            type.type_id,
                                                            category.category_id,
                                                            null,
                                                            "category_total_m2",
                                                        )
                                                        }
                                                    />
                                                    <input
                                                        category="number"
                                                        placeholder="Rate"
                                                        value={category.category_rate || ""}
                                                        className="p-1 border border-gray-300 rounded text-sm"
                                                        onChange={(e) =>
                                                        handleProductTypeInput(
                                                            e,
                                                            entry.area_info.area_id,
                                                            level.level_id,
                                                            null,
                                                            type.type_id,
                                                            category.category_id,
                                                            null,
                                                            "category_rate",
                                                        )
                                                        }
                                                    />
                                                    <div className="text-sm font-medium text-gray-800">
                                                        ${category.category_total_amount || "0.00"}
                                                    </div>
                                                    </div>

                                                  {expandedSections[
                                                    `level-${level.level_id}-type-${type.type_id}-cat-${category.category_id}`
                                                  ] &&
                                                    category.subcategory_obj_ref && (
                                                      <div className="pl-4 space-y-2 mt-2">
                                                        {category.subcategory_obj_ref.map((subcategory) => (
                                                          <div
                                                            key={`level-${level.level_id}-type-${type.type_id}-cat-${category.category_id}-subcat-${subcategory.subcategory_id}`}
                                                            className="grid grid-cols-4 gap-2 items-center"
                                                          >
                                                            <div className="text-xs text-gray-600">
                                                              {subcategory.subcategory_name}
                                                            </div>
                                                            <input
                                                              type="number"
                                                              placeholder="m²"
                                                              className="p-1 border border-gray-300 rounded text-xs"
                                                              value={subcategory.subcategory_total_m2 || ""}
                                                              onChange={(e) =>
                                                                handleProductTypeInput(
                                                                  e,
                                                                  entry.area_info.area_id,
                                                                  level.level_id,
                                                                  null,
                                                                  type.type_id,
                                                                  category.category_id,
                                                                  subcategory.subcategory_id,
                                                                  "subcategory_total_m2",
                                                                )
                                                              }
                                                            />
                                                            <input
                                                              type="number"
                                                              placeholder="Rate"
                                                              className="p-1 border border-gray-300 rounded text-xs"
                                                              value={subcategory.subcategory_rate || ""}
                                                              onChange={(e) =>
                                                                handleProductTypeInput(
                                                                  e,
                                                                  entry.area_info.area_id,
                                                                  level.level_id,
                                                                  null,
                                                                  type.type_id,
                                                                  category.category_id,
                                                                  subcategory.subcategory_id,
                                                                  "subcategory_rate",
                                                                )
                                                              }
                                                            />
                                                            <div className="text-xs font-medium text-gray-800">
                                                              ${subcategory.subcategory_total_amount || "0.00"}
                                                            </div>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                      </div>
                                    ))}
                                </div>
                              </div>

                              {/* Subareas */}
                              {level.subarea_info &&
                                level.subarea_info.map((subarea) => (
                                  <div
                                    key={`subarea-${subarea.subarea_id}`}
                                    className="border-l-2 border-gray-200 pl-4"
                                  >
                                    <div
                                      className="flex items-center cursor-pointer mb-3"
                                      onClick={() => toggleSection(`subarea-${subarea.subarea_id}`)}
                                    >
                                      {expandedSections[`subarea-${subarea.subarea_id}`] ? (
                                        <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                                      ) : (
                                        <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                                      )}
                                      <Grid3X3 className="h-5 w-5 text-green-500 mr-2" />
                                      <h5 className="text-md font-medium text-gray-700">{subarea.subarea_name}</h5>
                                    </div>

                                    {expandedSections[`subarea-${subarea.subarea_id}`] && (
                                      <div className="pl-6">
                                        {/* Product Types for Subarea */}
                                        <div className="bg-gray-50 p-3 rounded-md">
                                          <h6 className="font-medium text-gray-700 mb-2 flex items-center">
                                            <Package className="h-4 w-4 text-gray-600 mr-2" />
                                            Product Types for {subarea.subarea_name}
                                          </h6>

                                          <div className="space-y-4 mt-2">
                                            {subarea.product_type_obj_ref &&
                                              subarea.product_type_obj_ref.map((type) => (
                                                <div
                                                  key={`subarea-${subarea.subarea_id}-type-${type.type_id}`}
                                                  className="border border-gray-100 rounded-md p-3"
                                                >
                                                  <div
                                                    className="flex items-center cursor-pointer mb-2"
                                                    onClick={() =>
                                                      toggleSection(
                                                        `subarea-${subarea.subarea_id}-type-${type.type_id}`,
                                                      )
                                                    }
                                                  >
                                                    {expandedSections[
                                                      `subarea-${subarea.subarea_id}-type-${type.type_id}`
                                                    ] ? (
                                                      <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                                                    ) : (
                                                      <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                                                    )}
                                                    <div className="text-sm font-medium text-gray-700">
                                                      {type.type_name}
                                                    </div>
                                                  </div>

                                                  <div className="grid grid-cols-4 gap-2 items-center mb-2">
                                                    <div className="text-xs text-gray-500">Area (m²)</div>
                                                    <input
                                                      type="number"
                                                      placeholder="m²"
                                                      value={type.type_total_m2 || ""}
                                                      className="p-1 border border-gray-300 rounded text-sm"
                                                      onChange={(e) =>
                                                        handleProductTypeInput(
                                                          e,
                                                          entry.area_info.area_id,
                                                          level.level_id,
                                                          subarea.subarea_id,
                                                          type.type_id,
                                                          null,
                                                          null,
                                                          "type_total_m2",
                                                        )
                                                      }
                                                    />
                                                    <input
                                                      type="number"
                                                      placeholder="Rate"
                                                      value={type.type_rate || ""}
                                                      className="p-1 border border-gray-300 rounded text-sm"
                                                      onChange={(e) =>
                                                        handleProductTypeInput(
                                                          e,
                                                          entry.area_info.area_id,
                                                          level.level_id,
                                                          subarea.subarea_id,
                                                          type.type_id,
                                                          null,
                                                          null,
                                                          "type_rate",
                                                        )
                                                      }
                                                    />
                                                    <div className="text-sm font-medium text-gray-800">
                                                      ${type.type_total_amount || "0.00"}
                                                    </div>
                                                  </div>

                                                  {expandedSections[
                                                    `subarea-${subarea.subarea_id}-type-${type.type_id}`
                                                  ] &&
                                                    type.category_obj_ref && (
                                                      <div className="pl-4 space-y-3 mt-3 border-l-2 border-gray-200">
                                                        {type.category_obj_ref.map((category) => (
                                                          <div
                                                            key={`subarea-${subarea.subarea_id}-type-${type.type_id}-cat-${category.category_id}`}
                                                          >
                                                            <div
                                                              className="flex items-center cursor-pointer mb-2"
                                                              onClick={() =>
                                                                toggleSection(
                                                                  `subarea-${subarea.subarea_id}-type-${type.type_id}-cat-${category.category_id}`,
                                                                )
                                                              }
                                                            >
                                                              {expandedSections[
                                                                `subarea-${subarea.subarea_id}-type-${type.type_id}-cat-${category.category_id}`
                                                              ] ? (
                                                                <ChevronDown className="h-4 w-4 text-gray-500 mr-1" />
                                                              ) : (
                                                                <ChevronRight className="h-4 w-4 text-gray-500 mr-1" />
                                                              )}
                                                              <div className="text-sm text-gray-700">
                                                                {category.category_name}
                                                              </div>
                                                            </div>

                                                            {expandedSections[
                                                              `subarea-${subarea.subarea_id}-type-${type.type_id}-cat-${category.category_id}`
                                                            ] &&
                                                              category.subcategory_obj_ref && (
                                                                <div className="pl-4 space-y-2 mt-2">
                                                                  {category.subcategory_obj_ref.map((subcategory) => (
                                                                    <div
                                                                      key={`subarea-${subarea.subarea_id}-type-${type.type_id}-cat-${category.category_id}-subcat-${subcategory.subcategory_id}`}
                                                                      className="grid grid-cols-4 gap-2 items-center"
                                                                    >
                                                                      <div className="text-xs text-gray-600">
                                                                        {subcategory.subcategory_name}
                                                                      </div>
                                                                      <input
                                                                        type="number"
                                                                        placeholder="m²"
                                                                        className="p-1 border border-gray-300 rounded text-xs"
                                                                        value={subcategory.subcategory_total_m2 || ""}
                                                                        onChange={(e) =>
                                                                          handleProductTypeInput(
                                                                            e,
                                                                            entry.area_info.area_id,
                                                                            level.level_id,
                                                                            subarea.subarea_id,
                                                                            type.type_id,
                                                                            category.category_id,
                                                                            subcategory.subcategory_id,
                                                                            "subcategory_total_m2",
                                                                          )
                                                                        }
                                                                      />
                                                                      <input
                                                                        type="number"
                                                                        placeholder="Rate"
                                                                        className="p-1 border border-gray-300 rounded text-xs"
                                                                        value={subcategory.subcategory_rate || ""}
                                                                        onChange={(e) =>
                                                                          handleProductTypeInput(
                                                                            e,
                                                                            entry.area_info.area_id,
                                                                            level.level_id,
                                                                            subarea.subarea_id,
                                                                            type.type_id,
                                                                            category.category_id,
                                                                            subcategory.subcategory_id,
                                                                            "subcategory_rate",
                                                                          )
                                                                        }
                                                                      />
                                                                      <div className="text-xs font-medium text-gray-800">
                                                                        $
                                                                        {subcategory.subcategory_total_amount || "0.00"}
                                                                      </div>
                                                                    </div>
                                                                  ))}
                                                                </div>
                                                              )}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}

            {/* Budget Summary */}
            <div className="mt-8 border border-gray-200 rounded-md p-4 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Budget Summary</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">By Area</h3>
                    <div className="space-y-2">
                      {budget.entries.map((entry) => (
                        <div key={`summary-area-${entry.area_info.area_id}`} className="flex justify-between">
                          <span className="text-sm text-gray-600">{entry.area_info.area_name}</span>
                          <span className="text-sm font-medium">${calculateAreaTotals(entry.area_info.area_id)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">By Product Type</h3>
                    <div className="space-y-2">
                      {productTypeState.map((type) => (
                        <div key={`summary-type-${type._id}`} className="flex justify-between">
                          <span className="text-sm text-gray-600">{type.type_name}</span>
                          <span className="text-sm font-medium">${calculateProductTypeTotals(type._id)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-800">Total Budget</span>
                    <span className="text-lg font-bold text-primary">${calculateBudgetTotals()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <button
                className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                onClick={() => console.log("Budget data:", budget)}
              >
                <Save className="h-5 w-5 mr-2" />
                Save Budget
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

