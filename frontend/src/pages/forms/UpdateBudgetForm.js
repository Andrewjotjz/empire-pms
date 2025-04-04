"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronDown, ChevronRight, Dot, Building, Layers, Grid3X3, Package, Save, Info } from "lucide-react"
import SessionExpired from "../../components/SessionExpired"


export default function BudgetPlanner() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [projectState, setProjectState] = useState([])
  const [isFetchProjectLoading, setIsFetchProjectLoading] = useState(false)
  const [fetchProjectError, setFetchProjectError] = useState(null)

  const [productTypeState, setProductTypeState] = useState([])
  const [isFetchProductTypeLoading, setIsFetchProductTypeLoading] = useState(false)
  const [fetchProductTypeError, setFetchProductTypeError] = useState(null)

  const [budget, setBudget] = useState({})
  const [isFetchBudgetLoading, setIsFetchBudgetLoading] = useState(false)
  const [fetchBudgetError, setFetchBudgetError] = useState(null)

  const [selectedProject, setSelectedProject] = useState(null)
  const [expandedSections, setExpandedSections] = useState({})
  const [selectedIds, setSelectedIds] = useState([])

  const [addBudgetLoading, setAddBudgetLoading] = useState(false);
  const [addBudgetError, setAddBudgetError] = useState(null);

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
        setIsFetchProductTypeLoading(true); // Set loading state to true at the beginning
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

  // Fetch budget
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchBudget = async () => {
        setIsFetchBudgetLoading(true); // Set loading state to true at the beginning
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/budget/${id}`, { signal , credentials: 'include',
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
            
            setIsFetchBudgetLoading(false);
            setBudget(data);
            setSelectedProject(data.project)
            setFetchBudgetError(null);
        } catch (error) {
            if (error.name === 'AbortError') {
                // do nothing
            } else {
                setIsFetchBudgetLoading(false);
                setFetchBudgetError(error.message);
            }
        }
    };

    fetchBudget();

    return () => {
        abortController.abort(); // Cleanup
    };
  }, [id]);

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
      type_name: productTypeState.find(typ => typ._id === type.type_id).type_name,
      type_total_m2: 0,
      type_rate: 0,
      type_total_amount: 0,
      category_obj_ref: (type.type_categories ?? []).map((category) => ({
        category_id: category._id,
        category_name: productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name,
        category_total_m2: 0,
        category_rate: 0,
        category_total_amount: 0,
        subcategory_obj_ref: (category.subcategories ?? []).map((subcategory) => ({
          subcategory_id: subcategory._id,
          subcategory_name: productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name,
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

          /* 
          -- Sum category amounts --
          let categoriesTotal = 0
           targetObj.product_type_obj_ref[typeIndex].category_obj_ref.forEach((category) => {
             categoriesTotal += Number.parseFloat(category.category_total_amount || 0)
           })

          -- Type total = direct amount + categories --
          targetObj.product_type_obj_ref[typeIndex].type_total_amount = Math.round((directTypeAmount + categoriesTotal) * 100) / 100
          */

          // Type total is direct amount plus categories
          targetObj.product_type_obj_ref[typeIndex].type_total_amount = Math.round((directTypeAmount) * 100) / 100

        }
      }

      return newBudget
    })
  }

  // Calculate 'Total Budget by Area' for Summary
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

    /* 
    -- Sum all levels and subareas within this area --
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
    */

    return Math.round(areaTotal * 100) / 100

  }
  // Calculate 'Total Budget by Area by Level' for Summary
  const calculateLevelTotals = (areaId, levelId) => {
    let levelTotal = 0
    const levelEntry = budget.entries.find((entry) => entry.area_info.area_id === areaId).area_info.level_info.find((level) => level.level_id === levelId)

    if (!levelEntry) return "0.00"

    // Sum level's product types
    if (levelEntry.product_type_obj_ref) {
      levelEntry.product_type_obj_ref.forEach((type) => {
        levelTotal += Number.parseFloat(type.type_total_amount || 0)
      })
    }

    /*
    -- Sum all subareas within this level --
    if (levelEntry.subarea_info) {
      levelEntry.subarea_info.forEach((subarea) => {
        if (subarea.product_type_obj_ref) {
          subarea.product_type_obj_ref.forEach((type) => {
            levelTotal += Number.parseFloat(type.type_total_amount || 0)
          })
        }
      })
    }
    */

    return Math.round(levelTotal * 100) / 100

  }
  // Calculate 'Total Budget by Area by Level' for Summary
  const calculateSubareaTotals = (areaId, levelId, subareaId) => {
    let subAreaTotal = 0
    const subareaEntry = budget.entries.find((entry) => entry.area_info.area_id === areaId).area_info.level_info.find((level) => level.level_id === levelId).subarea_info.find((subarea) => subarea.subarea_id === subareaId)

    if (!subareaEntry) return "0.00"

    // Sum level's product types
    if (subareaEntry.product_type_obj_ref) {
      subareaEntry.product_type_obj_ref.forEach((type) => {
        subAreaTotal += Number.parseFloat(type.type_total_amount || 0)
      })
    }

    return Math.round(subAreaTotal * 100) / 100

  }

  // Calculate 'Total Budget by Product Type based on selected area/level/subarea' for Summary
  const calculateProductTypeTotals = (typeId) => {
    let typeTotal = 0

    budget.entries.forEach((entry) => {
      // Area level
      if (entry.area_info.product_type_obj_ref && selectedIds.includes(entry.area_info.area_id)) {
        const typeEntry = entry.area_info.product_type_obj_ref.find((type) => type.type_id === typeId)
        if (typeEntry) {
          typeTotal += Number.parseFloat(typeEntry.type_total_amount || 0)
        }
      }

      // Level level
      if (entry.area_info.level_info) {
        entry.area_info.level_info.forEach((level) => {
          if (level.product_type_obj_ref && selectedIds.includes(level.level_id)) {
            const typeEntry = level.product_type_obj_ref.find((type) => type.type_id === typeId)
            if (typeEntry) {
              typeTotal += Number.parseFloat(typeEntry.type_total_amount || 0)
            }
          }

          // Subarea level
          if (level.subarea_info) {
            level.subarea_info.forEach((subarea) => {
              if (subarea.product_type_obj_ref && selectedIds.includes(subarea.subarea_id)) {
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

  // Calculate 'Total Budget by Product Type + Category based on selected area/level/subarea' for Summary
  const calculateCategoryTotals = (typeId, catId) => {
    let categoryTotal = 0

    budget.entries.forEach((entry) => {
      // Area level
      if (entry.area_info.product_type_obj_ref && selectedIds.includes(entry.area_info.area_id)) {
        const catEntry = entry.area_info.product_type_obj_ref.find((type) => type.type_id === typeId).category_obj_ref.find((cat) => cat.category_id === catId)
        if (catEntry) {
          categoryTotal += Number.parseFloat(catEntry.category_total_amount || 0)
        }
      }

      // Level level
      if (entry.area_info.level_info) {
        entry.area_info.level_info.forEach((level) => {
          if (level.product_type_obj_ref && selectedIds.includes(level.level_id)) {
            const catEntry = level.product_type_obj_ref.find((type) => type.type_id === typeId).category_obj_ref.find((cat) => cat.category_id === catId)
            if (catEntry) {
              categoryTotal += Number.parseFloat(catEntry.category_total_amount || 0)
            }
          }

          // Subarea level
          if (level.subarea_info) {
            level.subarea_info.forEach((subarea) => {
              if (subarea.product_type_obj_ref && selectedIds.includes(subarea.subarea_id)) {
                const catEntry = subarea.product_type_obj_ref.find((type) => type.type_id === typeId).category_obj_ref.find((cat) => cat.category_id === catId)
                if (catEntry) {
                  categoryTotal += Number.parseFloat(catEntry.category_total_amount || 0)
                }
              }
            })
          }
        })
      }
    })

    return Math.round(categoryTotal * 100) / 100

  }

  // Calculate 'Total Budget of all Product Types based on Area/Level/Subarea selection' for Summary
  const calculateBudgetTotals = () => {
    let totalBudget = 0

    // Calculate totals for each area, level, and subarea
    budget.entries.forEach((entry) => {
      // Area level calculations
      if (selectedIds.includes(entry.area_info.area_id) && entry.area_info.product_type_obj_ref) {
        entry.area_info.product_type_obj_ref.forEach((type) => {
          totalBudget += Number.parseFloat(type.type_total_amount || 0)
        })
      }

      // Level calculations
      if (entry.area_info.level_info) {
        entry.area_info.level_info.forEach((level) => {
          if (level.product_type_obj_ref && selectedIds.includes(level.level_id)) {
            level.product_type_obj_ref.forEach((type) => {
              totalBudget += Number.parseFloat(type.type_total_amount || 0)
            })
          }

          // Subarea calculations
          if (level.subarea_info) {
            level.subarea_info.forEach((subarea) => {
              if (subarea.product_type_obj_ref && selectedIds.includes(subarea.subarea_id)) {
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

  // Checkbox to select Areas, Levels or Subareas for Summary
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Form submit
  const addBudget = async (budget) => {
    setAddBudgetLoading(true)
    setAddBudgetError(null)

    const postBudget = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/budget/create`, {
                credentials: 'include', method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                },
                body: JSON.stringify(budget)
            })

            const data = await res.json();

            if (data.tokenError) {
                throw new Error(data.tokenError)
            }

            if (!res.ok) {
                throw new Error('Failed to POST new budget details')
            }
            if (res.ok) {
                // navigate client to dashboard page
                navigate(`/EmpirePMS/budget/`)

                alert(`Budget created successfully!`);
            
                // update loading state
                setAddBudgetLoading(false)

            }
        } catch (error) {
            setAddBudgetError(error.message);
            setAddBudgetLoading(false);
        }
    }
    postBudget();
  }

  const handleSubmit = (e) => {
    e.preventDefault();


    addBudget(budget)
  };

  // Loading state handling
  if (
    isFetchProjectLoading ||
    isFetchProductTypeLoading ||
    isFetchBudgetLoading ||
    addBudgetLoading
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Error state handling
  if (
    fetchProjectError ||
    fetchProductTypeError ||
    fetchBudgetError ||
    addBudgetError
  ) {
    // Session expired check
    if (
      fetchProjectError?.includes("Session expired") ||
      fetchProjectError?.includes("jwt expired") ||
      fetchProjectError?.includes("jwt malformed") ||
      fetchProductTypeError?.includes("Session expired") ||
      fetchProductTypeError?.includes("jwt expired") ||
      fetchProductTypeError?.includes("jwt malformed") ||
      fetchBudgetError?.includes("Session expired") ||
      fetchBudgetError?.includes("jwt expired") ||
      fetchBudgetError?.includes("jwt malformed") ||
      addBudgetError?.includes("Session expired") ||
      addBudgetError?.includes("jwt expired") ||
      addBudgetError?.includes("jwt malformed")
    ) {
      return <div><SessionExpired /></div>;
    }
  
    // General error message
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <p>
          Error:{" "}
          {fetchProjectError ||
            fetchProductTypeError ||
            fetchBudgetError ||
            addBudgetError}
        </p>
      </div>
    );
  };

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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                <div className="text-sm font-medium text-gray-700">{productTypeState.find(typ => typ._id === type.type_id).type_name}</div>
                              </div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="text-xs text-gray-500">Area (m²)</div>
                                {/* INPUT starts here */}
                                <div className={`relative`}>
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                    {productTypeState.find(typ => typ._id === type.type_id).type_unit}
                                  </span>
                                  <input
                                    type="number"
                                    name={`productType_total_m2_${entry.area_info.area_id}`}
                                    id={`productType_total_m2_${entry.area_info.area_id}`}
                                    placeholder="0.00"
                                    value={type.type_total_m2 || ""}
                                    aria-label={`Total m2 for ${productTypeState.find(typ => typ._id === type.type_id).type_name}`}
                                    className="pl-7 pr-2 py-1 w-60 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                    min="0"
                                    step="0.01"
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
                                </div>
                                <div className={`relative`}>
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    name={`productType_rate_${entry.area_info.area_id}`}
                                    id={`productType_rate_${entry.area_info.area_id}`}
                                    placeholder="0.00"
                                    value={type.type_rate || ""}
                                    aria-label={`Rate for ${productTypeState.find(typ => typ._id === type.type_id).type_name}`}
                                    className="pl-7 pr-2 py-1 w-60 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                    min="0"
                                    step="0.01"
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
                                </div>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    name={`productType_total_amount_${type.type_id}`}
                                    id={`productType_total_amount_${type.type_id}`}
                                    placeholder="0.00"
                                    value={type.type_total_amount || 0.00}
                                    aria-label={`Total amount for ${productTypeState.find(typ => typ._id === type.type_id).type_name}`}
                                    className="pl-7 pr-2 py-1 w-60 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                    min="0"
                                    step="0.01"
                                    disabled={true}
                                  />
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
                                          <div className="text-sm text-gray-700">{productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name}</div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 mb-2">
                                          <div className="text-xs text-gray-500">Area (m²)</div>
                                          {/* INPUT starts here */}
                                          <div className={`relative`}>
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                              {productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_unit}
                                            </span>
                                            <input
                                              type="number"
                                              name={`category_total_m2_${category.category_id}`}
                                              id={`category_total_m2_${category.category_id}`}
                                              placeholder="0.00"
                                              value={category.category_total_m2 || ""}
                                              aria-label={`Total m2 for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name}`}
                                              className="pl-7 pr-2 py-1 w-52 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                              min="0"
                                              step="0.01"
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
                                          </div>
                                          <div className={`relative`}>
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                              $
                                            </span>
                                            <input
                                              type="number"
                                              name={`category_rate_${category.category_id}`}
                                              id={`category_rate_${category.category_id}`}
                                              placeholder="0.00"
                                              value={category.category_rate || ""}
                                              aria-label={`Rate for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name}`}
                                              className="pl-7 pr-2 py-1 w-52 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                              min="0"
                                              step="0.01"
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
                                          </div>
                                          <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                              $
                                            </span>
                                            <input
                                              type="number"
                                              name={`category_total_amount_${category.category_id}`}
                                              id={`category_total_amount_${category.category_id}`}
                                              placeholder="0.00"
                                              value={category.category_total_amount || 0.00}
                                              aria-label={`Total amount for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name}`}
                                              className="pl-7 pr-2 py-1 w-52 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                              min="0"
                                              step="0.01"
                                              disabled={true}
                                            />
                                          </div>
                                        </div>

                                        {expandedSections[`area-${entry.area_info.area_id}-type-${type.type_id}-cat-${category.category_id}`] &&
                                          category.subcategory_obj_ref && (
                                            <div className="pl-4 space-y-2 mt-2">
                                              {category.subcategory_obj_ref.map((subcategory) => (
                                                <div
                                                  key={`area-${entry.area_info.area_id}-type-${type.type_id}-cat-${category.category_id}-subcat-${subcategory.subcategory_id}`}
                                                  className="grid grid-cols-4 gap-2 items-center"
                                                > 
                                                  <div className="text-xs text-gray-600">{productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name}</div>
                                                  {/* NEW INPUT STARTS HERE */}
                                                  <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                      {productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_unit}
                                                    </span>
                                                    <input
                                                      type="number"
                                                      name={`subcategory_total_m2_${subcategory._id}`}
                                                      id={`subcategory_total_m2_${subcategory._id}`}
                                                      placeholder="0.00"
                                                      aria-label={`Total m2 for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name}`}
                                                      className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                      min="0"
                                                      step="0.01"
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
                                                  </div>
                                                  <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                      $
                                                    </span>
                                                    <input
                                                      type="number"
                                                      name={`subcategory_rate_${subcategory._id}`}
                                                      id={`subcategory_rate_${subcategory._id}`}
                                                      placeholder="0.00"
                                                      aria-label={`Rate for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name}`}
                                                      className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                      min="0"
                                                      step="0.01"
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
                                                  </div>
                                                  <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                      $
                                                    </span>
                                                    <input
                                                      type="number"
                                                      name={`subcategory_total_amount_${subcategory.subcategory_id}`}
                                                      id={`subcategory_total_amount_${subcategory.subcategory_id}`}
                                                      placeholder="0.00"
                                                      aria-label={`Total amount for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name}`}
                                                      className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right disabled:bg-gray-50"
                                                      value={subcategory.subcategory_total_amount}
                                                      min="0"
                                                      step="0.01"
                                                      disabled
                                                    />
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
                                          <div className="text-sm font-medium text-gray-700">{productTypeState.find(typ => typ._id === type.type_id).type_name}</div>
                                        </div>

                                        {/* INPUT starts here - LEVEL + TYPE */}
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                          <div className="text-xs text-gray-500">Area (m²)</div>
                                          <div className={`relative`}>
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                              {productTypeState.find(typ => typ._id === type.type_id).type_unit}
                                            </span>
                                            <input
                                              type="number"
                                              name={`productType_total_m2_${entry.area_info.area_id}_${level.level_id}`}
                                              id={`productType_total_m2_${entry.area_info.area_id}_${level.level_id}`}
                                              placeholder="0.00"
                                              value={type.type_total_m2 || ""}
                                              aria-label={`Total m2 for ${productTypeState.find(typ => typ._id === type.type_id).type_name} at ${level.level_name}`}
                                              className="pl-7 pr-2 py-1 w-60 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                              min="0"
                                              step="0.01"
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
                                          </div>
                                          <div className={`relative`}>
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                              $
                                            </span>
                                            <input
                                              type="number"
                                              name={`productType_rate_${entry.area_info.area_id}_${level.level_id}`}
                                              id={`productType_rate_${entry.area_info.area_id}_${level.level_id}`}
                                              placeholder="0.00"
                                              value={type.type_rate || ""}
                                              aria-label={`Total m2 for ${productTypeState.find(typ => typ._id === type.type_id).type_name} at ${level.level_name}`}
                                              className="pl-7 pr-2 py-1 w-60 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                              min="0"
                                              step="0.01"
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
                                          </div>
                                          <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                              $
                                            </span>
                                            <input
                                              type="number"
                                              name={`productType_total_amount_${entry.area_info.area_id}_${level.level_id}`}
                                              id={`productType_total_amount_${entry.area_info.area_id}_${level.level_id}`}
                                              placeholder="0.00"
                                              value={type.type_total_amount || 0.00}
                                              aria-label={`Total amount for ${productTypeState.find(typ => typ._id === type.type_id).type_name} at ${level.level_name}`}
                                              className="pl-7 pr-2 py-1 w-60 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                              min="0"
                                              step="0.01"
                                              disabled={true}
                                            />
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
                                                      {productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name}
                                                    </div>
                                                  </div>
                                                  {/* NEW INPUT STARTS HERE - LEVEL + CATEGORY */}
                                                  <div className="flex items-center justify-between gap-2 mb-2">
                                                    <div className="text-xs text-gray-500">Area (m²)</div>
                                                    <div className={`relative`}>
                                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                        {productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_unit}
                                                      </span>
                                                      <input
                                                        type="number"
                                                        name={`category_total_m2_${category.category_id}_${level.level_id}`}
                                                        id={`category_total_m2_${category.category_id}_${level.level_id}`}
                                                        placeholder="0.00"
                                                        value={category.category_total_m2 || ""}
                                                        aria-label={`Total m2 for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name} at ${level.level_name}`}
                                                        className="pl-7 pr-2 py-1 w-52 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                        min="0"
                                                        step="0.01"
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
                                                    </div>
                                                    <div className={`relative`}>
                                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                        $
                                                      </span>
                                                      <input
                                                        type="number"
                                                        name={`category_rate_${category.category_id}_${level.level_id}`}
                                                        id={`category_rate_${category.category_id}_${level.level_id}`}
                                                        placeholder="0.00"
                                                        value={category.category_rate || ""}
                                                        aria-label={`Rate for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name} at ${level.level_name}`}
                                                        className="pl-7 pr-2 py-1 w-52 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                        min="0"
                                                        step="0.01"
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
                                                    </div>
                                                    <div className="relative">
                                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                        $
                                                      </span>
                                                      <input
                                                        type="number"
                                                        name={`category_total_amount_${category.category_id}_${level.level_id}`}
                                                        id={`category_total_amount_${category.category_id}_${level.level_id}`}
                                                        placeholder="0.00"
                                                        value={category.category_total_amount || 0.00}
                                                        aria-label={`Total amount for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name} at ${level.level_name}`}
                                                        className="pl-7 pr-2 py-1 w-52 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                        min="0"
                                                        step="0.01"
                                                        disabled={true}
                                                      />
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
                                                              {productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name}
                                                            </div>
                                                            {/* NEW - LEVEL + SUBCATEGORY */}
                                                            <div className="relative">
                                                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                                {productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_unit}
                                                              </span>
                                                              <input
                                                                type="number"
                                                                name={`subcategory_total_m2_${subcategory._id}_${level.level_id}`}
                                                                id={`subcategory_total_m2_${subcategory._id}_${level.level_id}`}
                                                                placeholder="0.00"
                                                                aria-label={`Total m2 for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name}`}
                                                                className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                                min="0"
                                                                step="0.01"
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
                                                            </div>
                                                            <div className="relative">
                                                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                                $
                                                              </span>
                                                              <input
                                                                type="number"
                                                                name={`subcategory_rate_${subcategory._id}_${level.level_id}`}
                                                                id={`subcategory_rate_${subcategory._id}_${level.level_id}`}
                                                                placeholder="0.00"
                                                                aria-label={`Rate for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name} at ${level.level_name}`}
                                                                className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                                min="0"
                                                                step="0.01"
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
                                                            </div>
                                                            <div className="relative">
                                                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                                $
                                                              </span>
                                                              <input
                                                                type="number"
                                                                name={`subcategory_total_amount_${subcategory.subcategory_id}_${level.level_id}`}
                                                                id={`subcategory_total_amount_${subcategory.subcategory_id}_${level.level_id}`}
                                                                placeholder="0.00"
                                                                aria-label={`Total amount for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name} at ${level.level_name}`}
                                                                className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right disabled:bg-gray-50"
                                                                value={subcategory.subcategory_total_amount}
                                                                min="0"
                                                                step="0.01"
                                                                disabled
                                                              />
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
                                                      {productTypeState.find(typ => typ._id === type.type_id).type_name}
                                                    </div>
                                                  </div>
                                                  {/* NEW - SUBAREA + TYPE */}
                                                  <div className="flex items-center justify-between gap-2 mb-2">
                                                    <div className="text-xs text-gray-500">Area (m²)</div>
                                                    <div className={`relative`}>
                                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                        {productTypeState.find(typ => typ._id === type.type_id).type_unit}
                                                      </span>
                                                      <input
                                                        type="number"
                                                        name={`productType_total_m2_${type.type_id}_${subarea.subarea_id}`}
                                                        id={`productType_total_m2_${type.type_id}_${subarea.subarea_id}`}
                                                        placeholder="0.00"
                                                        value={type.type_total_m2 || ""}
                                                        aria-label={`Total m2 for ${productTypeState.find(typ => typ._id === type.type_id).type_name} at ${subarea.subarea_name}`}
                                                        className="pl-7 pr-2 py-1 w-60 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                        min="0"
                                                        step="0.01"
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
                                                    </div>
                                                    <div className={`relative`}>
                                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                        $
                                                      </span>
                                                      <input
                                                        type="number"
                                                        name={`productType_total_m2_${type.type_id}_${subarea.subarea_id}`}
                                                        id={`productType_total_m2_${type.type_id}_${subarea.subarea_id}`}
                                                        placeholder="0.00"
                                                        value={type.type_rate || ""}
                                                        aria-label={`Total m2 for ${productTypeState.find(typ => typ._id === type.type_id).type_name} at ${subarea.subarea_name}`}
                                                        className="pl-7 pr-2 py-1 w-60 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                        min="0"
                                                        step="0.01"
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
                                                    </div>
                                                    <div className="relative">
                                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                        $
                                                      </span>
                                                      <input
                                                        type="number"
                                                        name={`productType_total_m2_${type.type_id}_${subarea.subarea_id}`}
                                                        id={`productType_total_m2_${type.type_id}_${subarea.subarea_id}`}
                                                        placeholder="0.00"
                                                        value={type.type_total_amount || 0.00}
                                                        aria-label={`Total amount for ${productTypeState.find(typ => typ._id === type.type_id).type_name} at ${subarea.subarea_name}`}
                                                        className="pl-7 pr-2 py-1 w-60 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                        min="0"
                                                        step="0.01"
                                                        disabled={true}
                                                      />
                                                    </div>
                                                  </div>

                                                  {expandedSections[`subarea-${subarea.subarea_id}-type-${type.type_id}`] && type.category_obj_ref && (
                                                      <div className="pl-4 space-y-3 mt-3 border-l-2 border-gray-200">
                                                        {type.category_obj_ref.map((category) => (
                                                          <div key={`subarea-${subarea.subarea_id}-type-${type.type_id}-cat-${category.category_id}`}>
                                                            <div
                                                              className="flex items-center cursor-pointer mb-2"
                                                              onClick={() =>
                                                                toggleSection(
                                                                  `subarea-${subarea.subarea_id}-type-${type.type_id}-cat-${category.category_id}`,
                                                                )
                                                              }
                                                            >
                                                              {expandedSections[`subarea-${subarea.subarea_id}-type-${type.type_id}-cat-${category.category_id}`] ? (
                                                                <ChevronDown className="h-4 w-4 text-gray-500 mr-1" />
                                                              ) : (
                                                                <ChevronRight className="h-4 w-4 text-gray-500 mr-1" />
                                                              )}
                                                              <div className="text-sm text-gray-700">{productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name}</div>
                                                            </div>

                                                            <div className="pl-6 space-y-4">
                                                              {/* NEW - SUBAREA + CATEGORY */}
                                                              <div className="flex items-center justify-between gap-2 mb-2">
                                                                <div className="text-xs text-gray-500">Area (m²)</div>
                                                                <div className={`relative`}>
                                                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                                    {productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_unit}
                                                                  </span>
                                                                  <input
                                                                    type="number"
                                                                    name={`productType_total_m2_${category.category_id}_${subarea.subarea_id}`}
                                                                    id={`productType_total_m2_${category.category_id}_${subarea.subarea_id}`}
                                                                    placeholder="0.00"
                                                                    value={category.category_total_m2 || ""}
                                                                    aria-label={`Total m2 for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name} at ${subarea.subarea_name}`}
                                                                    className="pl-7 pr-2 py-1 w-52 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                                    min="0"
                                                                    step="0.01"
                                                                    onChange={(e) =>
                                                                      handleProductTypeInput(
                                                                        e,
                                                                        entry.area_info.area_id,
                                                                        level.level_id,
                                                                        subarea.subarea_id,
                                                                        type.type_id,
                                                                        category.category_id,
                                                                        null,
                                                                        "category_total_m2",
                                                                      )
                                                                    }
                                                                  />
                                                                </div>
                                                                <div className={`relative`}>
                                                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                                    $
                                                                  </span>
                                                                  <input
                                                                    type="number"
                                                                    name={`category_rate_${category.category_id}_${subarea.subarea_id}`}
                                                                    id={`category_rate_${category.category_id}_${subarea.subarea_id}`}
                                                                    placeholder="0.00"
                                                                    value={category.category_rate || ""}
                                                                    aria-label={`Rate for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name} at ${subarea.subarea_name}`}
                                                                    className="pl-7 pr-2 py-1 w-52 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                                    min="0"
                                                                    step="0.01"
                                                                    onChange={(e) =>
                                                                    handleProductTypeInput(
                                                                        e,
                                                                        entry.area_info.area_id,
                                                                        level.level_id,
                                                                        subarea.subarea_id,
                                                                        type.type_id,
                                                                        category.category_id,
                                                                        null,
                                                                        "category_rate",
                                                                    )
                                                                    }
                                                                  />
                                                                </div>
                                                                <div className="relative">
                                                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                                    $
                                                                  </span>
                                                                  <input
                                                                    type="number"
                                                                    name={`category_total_amount_${category.category_id}_${subarea.subarea_id}`}
                                                                    id={`category_total_amount_${category.category_id}_${subarea.subarea_id}`}
                                                                    placeholder="0.00"
                                                                    value={category.category_total_amount || 0.00}
                                                                    aria-label={`Total amount for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).category_name} at ${subarea.subarea_name}`}
                                                                    className="pl-7 pr-2 py-1 w-52 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                                    min="0"
                                                                    step="0.01"
                                                                    disabled={true}
                                                                  />
                                                                </div>
                                                              </div>
                                                            </div>

                                                            {expandedSections[`subarea-${subarea.subarea_id}-type-${type.type_id}-cat-${category.category_id}`] &&
                                                              category.subcategory_obj_ref && (
                                                                <div className="pl-4 space-y-2 mt-2">
                                                                  {category.subcategory_obj_ref.map((subcategory) => (
                                                                    <div
                                                                      key={`subarea-${subarea.subarea_id}-type-${type.type_id}-cat-${category.category_id}-subcat-${subcategory.subcategory_id}`}
                                                                      className="grid grid-cols-4 gap-2 items-center"
                                                                    >
                                                                      <div className="text-xs text-gray-600">
                                                                        {productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name}
                                                                      </div>
                                                                      {/* NEW - SUBAREA + SUB-CATEGORY */}
                                                                      <div className={`relative`}>
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                                          {productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_unit}
                                                                        </span>
                                                                        <input
                                                                          type="number"
                                                                          name={`subcategory_total_m2_${subcategory.subcategory_id}_${subarea.subarea_id}`}
                                                                          id={`subcategory_total_m2_${subcategory.subcategory_id}_${subarea.subarea_id}`}
                                                                          placeholder="0.00"
                                                                          value={subcategory.subcategory_total_m2 || ""}
                                                                          aria-label={`Total m2 for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name} at ${subarea.subarea_name}`}
                                                                          className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                                          min="0"
                                                                          step="0.01"
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
                                                                      </div>
                                                                      <div className={`relative`}>
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                                          $
                                                                        </span>
                                                                        <input
                                                                          type="number"
                                                                          name={`subcategory_rate_${subcategory.subcategory_id}_${subarea.subarea_id}`}
                                                                          id={`subcategory_rate_${subcategory.subcategory_id}_${subarea.subarea_id}`}
                                                                          placeholder="0.00"
                                                                          value={subcategory.subcategory_rate || ""}
                                                                          aria-label={`Rate for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name} at ${subarea.subarea_name}`}
                                                                          className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                                          min="0"
                                                                          step="0.01"
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
                                                                      </div>
                                                                      <div className="relative">
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                                          $
                                                                        </span>
                                                                        <input
                                                                          type="number"
                                                                          name={`subcategory_total_amount_${subcategory.subcategory_id}_${subarea.subarea_id}`}
                                                                          id={`subcategory_total_amount_${subcategory.subcategory_id}_${subarea.subarea_id}`}
                                                                          placeholder="0.00"
                                                                          value={subcategory.subcategory_total_amount || 0.00}
                                                                          aria-label={`Total amount for ${productTypeState.find(typ => typ._id === type.type_id).type_categories.find(cat => cat._id === category.category_id).subcategories.find(sub => sub._id === subcategory.subcategory_id).subcategory_name} at ${subarea.subarea_name}`}
                                                                          className="pl-7 pr-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                                                                          min="0"
                                                                          step="0.01"
                                                                          disabled={true}
                                                                        />
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Budget Summary</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* ***** total budget by AREA ***** */}
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-medium text-gray-700">By Area</h3>
                      <button title="Calculate 'Total Budget by Area or Level or Subarea' based on checkbox selection" disabled>
                        <Info className="h-4 w-4 text-blue-500 ml-2"/>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {budget.entries.map((entry) => (
                        <div key={`summary-area-${entry.area_info.area_id}`}>
                          <div className="flex justify-between">
                            <div 
                              className="flex items-center cursor-pointer"
                              onClick={() => toggleSection(`area-${entry.area_info.area_id}-summary`)}
                            >
                              {expandedSections[`area-${entry.area_info.area_id}-summary`] ? (
                                <>
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                  <span className="text-lg font-semibold text-gray-600">{entry.area_info.area_name}</span>
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-4 w-4 text-gray-500" />
                                  <span className="text-lg font-semibold text-gray-600">{entry.area_info.area_name}</span>
                                </>
                              )}
                              <input 
                                key={entry.area_info.area_id}
                                type="checkbox"
                                className="ml-2 cursor-pointer"
                                value={entry.area_info.area_id}
                                checked={selectedIds.includes(entry.area_info.area_id)}
                                onClick={(e) => e.stopPropagation()} // This prevents checkbox onClick from reaching parent's onClick
                                onChange={() => handleCheckboxChange(entry.area_info.area_id)}
                              />
                            </div>
                            <span className="text-lg font-semibold">${calculateAreaTotals(entry.area_info.area_id)}</span>
                          </div>

                          {/* Expand to Levels */}
                          {expandedSections[`area-${entry.area_info.area_id}-summary`] && (
                            <div className="pl-6 space-y-4">
                              {entry.area_info.level_info.map((lvl) => (
                                <div key={`summary-area-${entry.area_info.area_id}-level-${lvl.level_id}`}>
                                  <div className="flex justify-between">
                                    <div 
                                      className="flex items-center cursor-pointer"
                                      onClick={() => toggleSection(`area-${entry.area_info.area_id}-level-${lvl.level_id}-summary`)}
                                    >
                                      {expandedSections[`area-${entry.area_info.area_id}-level-${lvl.level_id}-summary`] ? (
                                        <>
                                          <ChevronDown className="h-4 w-4 text-gray-500" />
                                          <span className="text-md text-gray-600">{lvl.level_name}</span>
                                        </>
                                      ) : (
                                        <>
                                          <ChevronRight className="h-4 w-4 text-gray-500" />
                                          <span className="text-md text-gray-600">{lvl.level_name}</span>
                                        </>
                                      )}
                                      <input 
                                        key={lvl.level_id}
                                        type="checkbox"
                                        className="ml-2 cursor-pointer"
                                        value={lvl.level_id}
                                        checked={selectedIds.includes(lvl.level_id)}
                                        onClick={(e) => e.stopPropagation()} // This prevents checkbox onClick from reaching parent's onClick
                                        onChange={() => handleCheckboxChange(lvl.level_id)}
                                      />
                                    </div>
                                    <span className="text-md font-normal">
                                      ${calculateLevelTotals(entry.area_info.area_id, lvl.level_id)}
                                    </span>
                                  </div>

                                  {/* Expand to Subareas */}
                                  {expandedSections[`area-${entry.area_info.area_id}-level-${lvl.level_id}-summary`] && (
                                    <div className="pl-6 space-y-4">
                                      {lvl.subarea_info.map((sub) => (
                                        <div key={`summary-area-${entry.area_info.area_id}-level-${lvl.level_id}-subarea-${sub.subarea_id}`} className="flex justify-between">
                                          <div 
                                            className="flex items-center"
                                            onClick={() => toggleSection(`area-${entry.area_info.area_id}-level-${lvl.level_id}-subarea-${sub.subarea_id}-summary`)}
                                          >
                                            {expandedSections[`area-${entry.area_info.area_id}-level-${lvl.level_id}-subarea-${sub.subarea_id}-summary`] ? (
                                              <>
                                                <Dot className="h-4 w-4 text-gray-500 mr-1" />
                                                <span className="text-sm text-gray-500">{sub.subarea_name}</span>
                                              </>
                                            ) : (
                                              <>
                                                <Dot className="h-4 w-4 text-gray-500 mr-1" />
                                                <span className="text-sm text-gray-500">{sub.subarea_name}</span>
                                              </>
                                            )}
                                            <input 
                                              key={sub.subarea_id}
                                              type="checkbox"
                                              className="ml-2 cursor-pointer"
                                              value={sub.subarea_id}
                                              checked={selectedIds.includes(sub.subarea_id)}
                                              onClick={(e) => e.stopPropagation()} // This prevents checkbox onClick from reaching parent's onClick
                                              onChange={() => handleCheckboxChange(sub.subarea_id)}
                                            />
                                          </div>
                                          <span className="text-sm font-light">
                                            ${calculateSubareaTotals(entry.area_info.area_id, lvl.level_id, sub.subarea_id)}
                                          </span>
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
                  {/* ***** total budget by PRODUCT TYPE ***** */}
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-medium text-gray-700">By Product Type</h3>
                      <button title="Total Budget using breakdown by Product Type" disabled>
                        <Info className="h-4 w-4 text-blue-500 ml-2"/>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {productTypeState.map((type) => (
                        <div key={`summary-type-${type._id}`} className="p-2">
                          {/* Product Type Summary */}
                          <div className={`flex justify-between`}>
                            <span className="text-sm text-gray-600 font-semibold">{productTypeState.find(typ => typ._id === type._id).type_name}</span>
                            <span className="text-sm font-medium">
                              <Dot className={`h-4 w-4 text-gray-500 ${calculateProductTypeTotals(type._id) > 0 ? 'inline-block' : 'hidden'}`}/>
                              ${calculateProductTypeTotals(type._id)}
                            </span>
                          </div>

                          {/* Ensure category_obj_ref exists before mapping */}
                          {Array.isArray(type.type_categories) &&
                            type.type_categories.map((cat) => (
                              <div key={`summary-type-${cat._id}`} className={`flex justify-between border-b-2`}>
                                <span className="ml-4 text-xs text-gray-600">{cat.category_name}</span>
                                <span className="text-xs font-light">
                                  <Dot className={`h-4 w-4 text-gray-500 ${calculateCategoryTotals(type._id, cat._id) > 0 ? 'inline-block' : 'hidden'}`}/>
                                  ${calculateCategoryTotals(type._id, cat._id)}
                                </span>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ***** total budget by WHOLE PROJECT ***** */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <span className="text-lg font-medium text-gray-800">Total Budget</span>
                      <button title="Total Budget of all Product Types based on Area/Level/Subarea selection" disabled>
                        <Info className="h-4 w-4 text-blue-500 ml-2"/>
                      </button>
                    </div>
                    <span className="text-lg font-bold text-primary">${calculateBudgetTotals()}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <button
                className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                onClick={handleSubmit}
                disabled={addBudgetLoading} // Optional: Disable button while loading
              >
                {addBudgetLoading ? (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Budget
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

