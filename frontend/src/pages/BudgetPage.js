"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SessionExpired from "../components/SessionExpired"
import LoadingScreen from "./loaders/LoadingScreen"
import UnauthenticatedSkeleton from "./loaders/UnauthenticateSkeleton"

const itemsPerPage = 10

const Budget = () => {
  // Component state declaration
  const [budgetState, setBudgetState] = useState([])
  const [budgetData, setBudgetData] = useState({})
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [isArchive, setIsArchive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchDate, setSearchDate] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" })
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  // Component router
  const navigate = useNavigate()

  // Component functions and variables
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  const handleSearchDateChange = (e) => {
    setSearchDate(e.target.value)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleTableClick = (id) => {
    navigate(`/EmpirePMS/budget/${id}`)
  }

  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Process budget data
  const processBudgetData = (budget) => {
    // Ensure that budget.entries is not null or undefined
    if (!budget || !budget.entries) {
      console.error("Invalid budget data: 'entries' is null or undefined.");
      return null; // or return a default structure, depending on your needs
    }

    const budgetData = {
      total: 0,
      byType: {},
      Name: {},
      byCategoryName: {},
      bySubcategory: {},
    }

    budget.entries.forEach((entry) => {
      if (!entry.area_info || !Array.isArray(entry.area_info.product_type_obj_ref)) {
        console.warn("Invalid entry data: Missing product_type_obj_ref.");
        return; // Skip this entry if it is invalid
      }

      entry.area_info.product_type_obj_ref.forEach((type) => {
        budgetData.total += type.type_total_amount

        // By Type
        if (!budgetData.byType[type.type_id]) {
          budgetData.byType[type.type_id] = 0
        }
        budgetData.byType[type.type_id] += type.type_total_amount
      })
    })

    return budgetData
  }

  // Fetch budget data
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchBudget = async () => {
      setIsLoadingState(true)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/budget`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch budgets")
        }

        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setIsLoadingState(false)
        setBudgetState(data)
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

    fetchBudget()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [])

  // Filter and sort data
  useEffect(() => {
    let result = budgetState

    // Filter by search term
    if (searchTerm) {
      result = result.filter((budget) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase()
        return (
          budget.budget_name.toLowerCase().includes(lowerCaseSearchTerm) ||
          budget.project.project_name.toLowerCase().includes(lowerCaseSearchTerm) ||
          budget.budget_area?.toString().includes(lowerCaseSearchTerm) ||
          budget.budget_level?.toString().includes(lowerCaseSearchTerm) ||
          budget.budget_subarea?.toLowerCase().includes(lowerCaseSearchTerm)
        )
      })
    }

    // Filter by date
    if (searchDate) {
      result = result.filter((budget) => {
        if (!budget.createdAt) return false
        return budget.createdAt.startsWith(searchDate)
      })
    }

    // Filter by archive status
    result = result.filter((budget) => budget.budget_isarchived === isArchive)

    // Sort
    if (sortConfig.key) {
      if (sortConfig.key === "project_name") {
        result.sort((a, b) => {
          if (a.project.project_name < b.project.project_name) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (a.project.project_name > b.project.project_name) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        })
      } else if (sortConfig.key === "area_name") {
        result.sort((a, b) => {
          const areaA = a.project.area_obj_ref.find((area) => area._id === a.budget_area)?.areas.area_name || ""
          const areaB = b.project.area_obj_ref.find((area) => area._id === b.budget_area)?.areas.area_name || ""
          if (areaA < areaB) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (areaA > areaB) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        })
      } else if (sortConfig.key === "level_name") {
        result.sort((a, b) => {
          const levelA =
            a.project.area_obj_ref
              .find((area) => area._id === a.budget_area)
              ?.areas.levels.find((level) => level._id === a.budget_area_level)?.level_name || ""
          const levelB =
            b.project.area_obj_ref
              .find((area) => area._id === b.budget_area)
              ?.areas.levels.find((level) => level._id === b.budget_area_level)?.level_name || ""
          if (levelA < levelB) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (levelA > levelB) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        })
      } else if (sortConfig.key === "subarea_name") {
        result.sort((a, b) => {
          const subareaA =
            a.project.area_obj_ref
              .find((area) => area._id === a.budget_area)
              ?.areas.levels.find((level) => level._id === a.budget_area_level)
              ?.subareas.find((subarea) => subarea._id === a.budget_area_subarea)?.subarea_name || ""
          const subareaB =
            b.project.area_obj_ref
              .find((area) => area._id === b.budget_area)
              ?.areas.levels.find((level) => level._id === b.budget_area_level)
              ?.subareas.find((subarea) => subarea._id === b.budget_area_subarea)?.subarea_name || ""
          if (subareaA < subareaB) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (subareaA > subareaB) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        })
      } else {
        result.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        })
      }
    }

    setFilteredData(result)
    setCurrentPage(1)
  }, [budgetState, isArchive, searchTerm, searchDate, sortConfig])

  const pageCount = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Process budget data
  useEffect(() => {

    budgetState.forEach(budget => {
        // Ensure that budgetState and its entries are available before processing
        if (!budget || !budget.entries || budget.entries.length === 0) {
            // If entries are missing or empty, don't proceed with processing
            setIsLoadingState(true); // Set loading state if data isn't ready yet
        return;
        }
    
        // If budget.entries is available, process the data
        const processedBudgetData = processBudgetData(budget)
    
        setBudgetData(processedBudgetData)    
    })
    
    setIsLoadingState(false) // Set loading to false once data processing is done

  }, [budgetState]);

  if (isLoadingState) {
    return <LoadingScreen />
  }

  if (errorState) {
    if (
      errorState.includes("Session expired") ||
      errorState.includes("jwt expired") ||
      errorState.includes("jwt malformed")
    ) {
      return <SessionExpired />
    }
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorState}</span>
        </div>
      </div>
    )
  }

  console.log("budgetState", budgetState)
  console.log("budgetData", budgetData)
  console.log("filteredData", filteredData)

  return localUser && Object.keys(localUser).length > 0 ? (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header and New Invoice */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Budget</h1>
            <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition duration-300 ease-in-out"
                onClick={() => navigate(`/EmpirePMS/budget/create`)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                NEW BUDGET
            </button>
          </div>

          {/* Search and Date Filter */}
          <div className="flex mb-6 space-x-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search budgets..."
                className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="absolute right-3 top-2.5 text-gray-400 size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>

            <div className="relative">
              <input
                type="date"
                className="p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchDate}
                onChange={handleSearchDateChange}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex">
            <button
              className={`mr-2 px-6 py-2 rounded-t-lg font-medium transition-colors duration-200 ${
                !isArchive ? "bg-white text-blue-600 shadow-inner" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              onClick={() => setIsArchive(false)}
            >
              Current
            </button>
            <button
              className={`px-6 py-2 rounded-t-lg font-medium transition-colors duration-200 ${
                isArchive ? "bg-white text-blue-600 shadow-inner" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              onClick={() => setIsArchive(true)}
            >
              Archive
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                  <th className="p-3 cursor-pointer" onClick={() => requestSort("budget_name")}>
                    Budget Name
                    {sortConfig.key === "budget_name" &&
                      (sortConfig.direction === "ascending" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="inline ml-1 size-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="inline ml-1 size-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      ))}
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => requestSort("project_name")}>
                    Project
                    {sortConfig.key === "project_name" &&
                      (sortConfig.direction === "ascending" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="inline ml-1 size-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="inline ml-1 size-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      ))}
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => requestSort("area_name")}>
                    Area
                    {sortConfig.key === "area_name" &&
                      (sortConfig.direction === "ascending" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="inline ml-1 size-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="inline ml-1 size-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      ))}
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => requestSort("level_name")}>
                    Level
                    {sortConfig.key === "level_name" &&
                      (sortConfig.direction === "ascending" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="inline ml-1 size-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="inline ml-1 size-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      ))}
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => requestSort("subarea_name")}>
                    Subarea
                    {sortConfig.key === "subarea_name" &&
                      (sortConfig.direction === "ascending" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="inline ml-1 size-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="inline ml-1 size-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      ))}
                  </th>
                  <th className="p-3">Total Budget</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((budget) => (
                    <tr
                      key={budget._id}
                      onClick={() => handleTableClick(budget._id)}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="p-3 text-blue-600 font-medium hover:underline">{budget.budget_name}</td>
                      <td className="p-3 text-gray-600">{budget.project.project_name}</td>
                      <td className="p-3 text-gray-600">
                        {budget.project.area_obj_ref.find((area) => area._id === budget.budget_area)?.areas.area_name ||
                          "N/A"}
                      </td>
                      <td className="p-3 text-gray-600">
                        {budget.project.area_obj_ref
                          .find((area) => area._id === budget.budget_area)
                          ?.areas.levels.find((level) => level._id === budget.budget_area_level)?.level_name || "N/A"}
                      </td>
                      <td className="p-3 text-gray-600">
                        {budget.project.area_obj_ref
                          .find((area) => area._id === budget.budget_area)
                          ?.areas.levels.find((level) => level._id === budget.budget_area_level)
                          ?.subareas.find((subarea) => subarea._id === budget.budget_area_subarea)?.subarea_name ||
                          "N/A"}
                      </td>
                      <td className="p-3 text-green-600 font-medium">
                        {/* Calculate total budget here if needed */}$
                        {budgetData.total}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No budgets found matching your criteria.
                      <span className="text-blue-500 ml-2 hover:underline hover:cursor-pointer" onClick={() => {setSearchTerm(""); setSearchDate("") }}>Clear filter</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginatedData.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                {Math.min(filteredData.length, currentPage * itemsPerPage)} of {filteredData.length} entries
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 text-gray-600 disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                {pageCount <= 5 ? (
                  [...Array(pageCount)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))
                ) : (
                  <>
                    {[...Array(Math.min(3, pageCount))].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded ${
                          currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    {currentPage > 3 && <span className="px-2 py-1">...</span>}
                    {currentPage > 3 && currentPage < pageCount - 1 && (
                      <button
                        onClick={() => setCurrentPage(currentPage)}
                        className="px-3 py-1 rounded bg-blue-600 text-white"
                      >
                        {currentPage}
                      </button>
                    )}
                    {currentPage < pageCount - 2 && <span className="px-2 py-1">...</span>}
                    {currentPage < pageCount - 1 && (
                      <button
                        onClick={() => setCurrentPage(pageCount)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageCount ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {pageCount}
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(pageCount, prev + 1))}
                  disabled={currentPage === pageCount}
                  className="px-3 py-1 rounded bg-gray-200 text-gray-600 disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default Budget

