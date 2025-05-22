"use client"

// Import modules
import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import SessionExpired from "../../components/SessionExpired"
import LoadingScreen from "../loaders/LoadingScreen"
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton"
import { Loader2, X, Plus, Trash2, Square, MinusCircle } from "lucide-react"

const UpdateProjectForm = () => {
  // Component router
  const navigate = useNavigate()
  const { id } = useParams()

  // Component state declaration
  const [projectState, setProjectState] = useState({
    project_name: "",
    project_address: "",
    project_isarchived: false,
    suppliers: [],
    area_obj_ref: [],
  })
  const [supplierState, setSupplierState] = useState([])
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Integrated update project hook states
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState(null)

  // Component functions and variables
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  // Integrated update project hook function
  const update = async (projectState) => {
    setUpdateLoading(true)
    setUpdateError(null)

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/${projectState._id}`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
        },
        body: JSON.stringify({ ...projectState }),
      })

      const promise = await res.json()

      if (promise.tokenError) {
        throw new Error(promise.tokenError)
      }

      if (!res.ok) {
        throw new Error("Failed to PUT project details")
      }

      // navigate client to project page
      navigate(`/EmpirePMS/project/${projectState._id}`)

      alert(`Project updated successfully!`)

      // update loading state
      setUpdateLoading(false)
    } catch (error) {
      setUpdateError(error.message)
      setUpdateLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setProjectState((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const addArea = () => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: [...prevData.area_obj_ref, { areas: { area_name: "", levels: [] } }],
    }))
  }

  const removeArea = (areaIndex) => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.filter((_, index) => index !== areaIndex),
    }))
  }

  const addLevel = (areaIndex) => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.map((areaObj, index) => {
        if (index === areaIndex) {
          return {
            ...areaObj,
            areas: {
              ...areaObj.areas,
              levels: [...areaObj.areas.levels, { level_name: "", subareas: [] }],
            },
          }
        }
        return areaObj
      }),
    }))
  }

  const removeLevel = (areaIndex, levelIndex) => {
    setProjectState((prevData) => {
      const newData = { ...prevData }
      newData.area_obj_ref[areaIndex].areas.levels = newData.area_obj_ref[areaIndex].areas.levels.filter(
        (_, index) => index !== levelIndex,
      )
      return newData
    })
  }

  const addSubarea = (areaIndex, levelIndex) => {
    setProjectState((prevData) => ({
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
                        subareas: [...level.subareas, { subarea_name: "" }],
                      }
                    : level,
                ),
              },
            }
          : area,
      ),
    }))
  }

  const removeSubarea = (areaIndex, levelIndex, subareaIndex) => {
    setProjectState((prevData) => {
      const newData = { ...prevData }
      newData.area_obj_ref[areaIndex].areas.levels[levelIndex].subareas = newData.area_obj_ref[areaIndex].areas.levels[
        levelIndex
      ].subareas.filter((_, index) => index !== subareaIndex)
      return newData
    })
  }

  const handleAreaChange = (areaIndex, value) => {
    setProjectState((prevData) => {
      const newData = { ...prevData }
      newData.area_obj_ref[areaIndex].areas.area_name = value
      return newData
    })
  }

  const handleLevelChange = (areaIndex, levelIndex, value) => {
    setProjectState((prevData) => {
      const newData = { ...prevData }
      newData.area_obj_ref[areaIndex].areas.levels[levelIndex].level_name = value
      return newData
    })
  }

  const handleSubareaChange = (areaIndex, levelIndex, subareaIndex, value) => {
    setProjectState((prevData) => {
      const newData = { ...prevData }
      newData.area_obj_ref[areaIndex].areas.levels[levelIndex].subareas[subareaIndex].subarea_name = value
      return newData
    })
  }

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target

    setProjectState((prevState) => {
      // Find the supplier object based on the value (ID)
      const supplierToAdd = supplierState.find((supplier) => supplier._id === value)

      const updatedSuppliers = checked
        ? [...prevState.suppliers, supplierToAdd] // Add the supplier object if checked
        : prevState.suppliers.filter((supplier) => supplier._id !== value) // Remove the supplier object if unchecked

      return { ...prevState, suppliers: updatedSuppliers }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    update(projectState)
  }

  // fetch all suppliers
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchAllSuppliers = async () => {
      setIsLoadingState(true)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch")
        }

        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setIsLoadingState(false)
        setSupplierState(data)
        setErrorState(null)
      } catch (error) {
        if (error.name === "AbortError") {
          // do nothing
        } else {
          setIsLoadingState(false)
          setErrorState(error.message)
        }
      }
    }

    fetchAllSuppliers()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [])

  // fetch project details
  const fetchProjectDetails = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
        },
      })

      if (!res.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await res.json()

      setProjectState(data[0])
      setIsLoadingState(false)
    } catch (error) {
      setErrorState(error.message)
    } finally {
      setIsLoadingState(false)
    }
  }, [id])

  useEffect(() => {
    fetchProjectDetails()
  }, [fetchProjectDetails])

  // Improved loading state handling
  if (isLoadingState) {
    return <LoadingScreen />
  }

  if (errorState) {
    if (
      errorState.includes("Session expired") ||
      errorState.includes("jwt expired") ||
      errorState.includes("jwt malformed")
    ) {
      return (
        <div>
          <SessionExpired />
        </div>
      )
    }
    return <div>Error: {errorState}</div>
  }

  return localUser && Object.keys(localUser).length > 0 ? (
    <div className="container mx-auto mt-4 sm:mt-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-800 px-6 py-2">
          <h1 className="text-xs sm:text-xl font-bold text-white">EDIT PROJECT</h1>
        </div>
        <form
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
            }
          }}
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-2 sm:space-y-6 text-xs sm:text-base"
        >
          {/* PROJECT NAME */}
          <div className="flex gap-x-2">
            <div className="w-full">
              <label htmlFor="project_name" className="block text-sm font-medium text-gray-700">
                * Project Name
              </label>
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
            <div className="w-full">
              <label htmlFor="project_address" className="block text-sm font-medium text-gray-700">
                * Project Address
              </label>
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
                {projectState.suppliers.length > 0
                  ? `x${projectState.suppliers.length} Suppliers Selected`
                  : `Select Suppliers`}
              </button>
              {isDropdownOpen && (
                <div
                  className="relative z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto"
                  onClick={() => setIsDropdownOpen(true)}
                >
                  <ul className="py-1">
                    {supplierState &&
                      supplierState.length > 0 &&
                      supplierState.map((supplier, index) => (
                        <li key={index} className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <input
                            type="checkbox"
                            id={`supplier-${supplier._id}`}
                            value={supplier._id}
                            checked={projectState.suppliers.some((sup) => sup._id === supplier._id)}
                            onChange={handleCheckboxChange}
                            className="mr-2"
                            required={projectState.suppliers.length === 0} // Set required only if no supplier is selected
                            onInvalid={(e) => {
                              if (projectState.suppliers.length === 0) {
                                e.target.setCustomValidity(
                                  "You must select one or more supplier(s) applied to this Project",
                                )
                              }
                            }}
                            onInput={(e) => e.target.setCustomValidity("")}
                          />
                          <label htmlFor={`supplier-${supplier._id}`} className="text-gray-900">
                            {supplier.supplier_name}
                          </label>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
            <p className="hidden sm:inline-block text-xs italic text-gray-400 mt-2">
              Assign one or more suppliers to this new Project
            </p>
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
                    className="px-2 py-1 text-sm rounded-md text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <X className="size-7" />
                  </button>
                </div>
                {/* LEVELS */}
                <div className="border-l-2 border-purple-300 mb-1 p-2 bg-purple-100 bg-opacity-50">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Levels</h4>
                  {areaObj.areas.levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="ml-2 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Square className="size-3 mr-1" />
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
                          <MinusCircle className="size-6" />
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
                              <Trash2 className="size-5" />
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
                          <Plus className="size-4 sm:size-5 mr-1" />
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
                    <Plus className="size-4 sm:size-5 mr-1" />
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
              <Plus className="size-4 sm:size-5 mr-1" />
              Add Area
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={updateLoading}
              className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {updateLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  UPDATING...
                </span>
              ) : (
                "UPDATE PROJECT"
              )}
            </button>

            {updateError && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">Error: {updateError}</div>
            )}
          </div>
        </form>
      </div>
    </div>
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default UpdateProjectForm
