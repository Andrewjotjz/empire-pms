"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, Tag, ArrowUp, ArrowDown } from "lucide-react"
import SessionExpired from "../components/SessionExpired"
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton"
import UnauthenticatedSkeleton from "./loaders/UnauthenticateSkeleton"

const Alias = () => {
  // Component state declaration
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  const [aliasState, setAliasState] = useState([])
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "alias_name", direction: "ascending" })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(70) // Increased to show more items

  // Component router
  const navigate = useNavigate()

  // Component functions and variables
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const filterAlias = () => {
    return aliasState.filter((alias) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      return alias.alias_name.toLowerCase().includes(lowerCaseSearchTerm)
    })
  }

  const handleItemClick = (id) => navigate(`/EmpirePMS/alias/${id}/edit`)

  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortedAliases = (aliases) => {
    if (!sortConfig.key) return aliases

    return [...aliases].sort((a, b) => {
      const aValue = a.alias_name
      const bValue = b.alias_name

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  // Fetch aliases
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchAlias = async () => {
      setIsLoadingState(true)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/alias`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch aliases")
        }

        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setIsLoadingState(false)
        setAliasState(data)
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

    fetchAlias()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [])

  const filteredAliases = getSortedAliases(filterAlias())
  const pageCount = Math.ceil(filteredAliases.length / itemsPerPage)
  const paginatedAliases = filteredAliases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (isLoadingState) {
    return <EmployeePageSkeleton />
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

  return localUser && Object.keys(localUser).length > 0 ? (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-4">
            <Tag className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Alias Management</h1>
          </div>

          {/* Search and Items Per Page */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-grow">
              <div className="absolute right-3 top-2.5 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search aliases..."
                className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <X
                  className="absolute right-3 top-2.5 text-gray-400 h-4 w-4 hover:scale-105 hover:cursor-pointer"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            <select
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value={20}>20 per page</option>
              <option value={30}>30 per page</option>
              <option value={50}>50 per page</option>
              <option value={70}>70 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          {/* Compact Alias List */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-medium text-gray-700">{filteredAliases.length} Aliases Found</h2>
              <button
                onClick={() => requestSort("alias_name")}
                className="flex items-center text-sm text-gray-600 hover:text-blue-600"
              >
                Sort
                {sortConfig.direction === "ascending" ? (
                  <ArrowUp className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDown className="ml-1 h-3 w-3" />
                )}
              </button>
            </div>

            {filteredAliases.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-2 gap-y-0">
                  {paginatedAliases.map((alias) => (
                    <div
                      key={alias._id}
                      onClick={() => handleItemClick(alias._id)}
                      className="py-2 px-3 border-b hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                    >
                      <span className="text-blue-600 hover:underline">{alias.alias_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-white rounded-lg border">
                <Tag className="h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-base font-medium text-gray-900">No aliases found</h3>
                <p className="mt-1 text-sm text-gray-500">There are no active aliases matching your criteria.</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredAliases.length > 0 && (
            <div className="bg-gray-50 px-3 py-2 border rounded-lg text-sm">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-xs text-gray-600">
                  Showing {Math.min(filteredAliases.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                  {Math.min(filteredAliases.length, currentPage * itemsPerPage)} of {filteredAliases.length} aliases
                </p>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded bg-gray-200 text-gray-600 disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  {pageCount <= 5 ? (
                    [...Array(pageCount)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-2 py-1 rounded ${
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
                          className={`px-2 py-1 rounded ${
                            currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      {currentPage > 3 && <span className="px-1 py-1">...</span>}
                      {currentPage > 3 && currentPage < pageCount - 1 && (
                        <button
                          onClick={() => setCurrentPage(currentPage)}
                          className="px-2 py-1 rounded bg-blue-600 text-white"
                        >
                          {currentPage}
                        </button>
                      )}
                      {currentPage < pageCount - 2 && <span className="px-1 py-1">...</span>}
                      {currentPage < pageCount - 1 && (
                        <button
                          onClick={() => setCurrentPage(pageCount)}
                          className={`px-2 py-1 rounded ${
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
                    className="px-2 py-1 rounded bg-gray-200 text-gray-600 disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
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

export default Alias
