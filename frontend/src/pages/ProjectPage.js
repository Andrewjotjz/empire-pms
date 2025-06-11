"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Archive, Briefcase, Layers, MapPin, Phone, Plus, Search, User, Users, X } from "lucide-react"
import SessionExpired from "../components/SessionExpired"
import ProjectPageSkeleton from "./loaders/ProjectPageSkeleton"
import UnauthenticatedSkeleton from "./loaders/UnauthenticateSkeleton"

const itemsPerPage = 10

const Project = () => {
  // Component state declaration
  const [projectState, setProjectState] = useState([])
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [isArchive, setIsArchive] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "project_name", direction: "ascending" })
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRow, setExpandedRow] = useState(null)

  // Component router
  const navigate = useNavigate()

  // Component functions and variables
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  const handleAddClick = () => {
    navigate("/EmpirePMS/project/create")
  }

  const handleTableClick = (id) => navigate(`/EmpirePMS/project/${id}`, { state: id })

  const toggleExpandRow = (id, e) => {
    e.stopPropagation()
    setExpandedRow(expandedRow === id ? null : id)
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1)
  }

  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Filter and sort function
  const getFilteredProjects = () => {
    const filtered = (Array.isArray(projectState) ? projectState : [])
      .filter((project) => project.project_isarchived === isArchive)
      .filter((project) => {
        const query = searchQuery.toLowerCase()
        return (
          project.project_name.toLowerCase().includes(query) ||
          project.project_address.toLowerCase().includes(query) ||
          project.employees.some(
            (employee) =>
              employee.employee_first_name.toLowerCase().includes(query) ||
              employee.employee_last_name.toLowerCase().includes(query),
          )
        )
      })

    // Sort the filtered projects
    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        let aValue, bValue

        if (sortConfig.key === "project_name") {
          aValue = a.project_name
          bValue = b.project_name
        } else if (sortConfig.key === "project_address") {
          aValue = a.project_address
          bValue = b.project_address
        } else if (sortConfig.key === "contact_person") {
          const aForeman = a.employees.find((emp) => emp.employee_roles === "Foreman")
          const bForeman = b.employees.find((emp) => emp.employee_roles === "Foreman")
          aValue = aForeman ? `${aForeman.employee_first_name} ${aForeman.employee_last_name}` : ""
          bValue = bForeman ? `${bForeman.employee_first_name} ${bForeman.employee_last_name}` : ""
        } else if (sortConfig.key === "employee_count") {
          aValue = a.employees.length
          bValue = b.employees.length
        } else {
          aValue = a[sortConfig.key]
          bValue = b[sortConfig.key]
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
        })

        if (!res.ok) {
          throw new Error("Network response was not ok")
        }

        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setIsLoadingState(false)
        setProjectState(data)
        setErrorState(null)
      } catch (error) {
        setErrorState(error.message)
      } finally {
        setIsLoadingState(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = getFilteredProjects()
  const pageCount = Math.ceil(filteredProjects.length / itemsPerPage)
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (isLoadingState) {
    return <ProjectPageSkeleton />
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
          </div>

          {/* Search and Add Button */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by project name, address or employee..."
                className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              { searchQuery === "" ? (<Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />) : (<X className="absolute right-3 top-2.5 text-gray-400 h-5 w-5 hover:scale-105 hover:cursor-pointer" onClick={() => setSearchQuery("")}/>) }
            </div>

            {localUser.employee_roles === "Admin" && <button
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">ADD PROJECT</span>
            </button>}
          </div>

          {/* Tabs */}
          <div className="flex">
            <button
              className={`mr-2 px-6 py-2 rounded-t-lg font-medium transition-colors duration-200 flex items-center ${
                !isArchive ? "bg-white text-blue-600 shadow-inner" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              onClick={() => setIsArchive(false)}
            >
              <Layers className="h-4 w-4 mr-2" />
              Current
            </button>
            <button
              className={`px-6 py-2 rounded-t-lg font-medium transition-colors duration-200 flex items-center ${
                isArchive ? "bg-white text-blue-600 shadow-inner" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              onClick={() => setIsArchive(true)}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archived
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredProjects.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                        <th className="p-3 cursor-pointer" onClick={() => requestSort("project_name")}>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            Project Name
                            {sortConfig.key === "project_name" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="ml-1 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "m4.5 15.75 7.5-7.5 7.5 7.5"
                                      : "m19.5 8.25-7.5 7.5-7.5-7.5"
                                  }
                                />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th
                          className="p-3 cursor-pointer hidden md:table-cell"
                          onClick={() => requestSort("project_address")}
                        >
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            Address
                            {sortConfig.key === "project_address" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="ml-1 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "m4.5 15.75 7.5-7.5 7.5 7.5"
                                      : "m19.5 8.25-7.5 7.5-7.5-7.5"
                                  }
                                />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th
                          className="p-3 cursor-pointer hidden lg:table-cell"
                          onClick={() => requestSort("contact_person")}
                        >
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Contact Person
                            {sortConfig.key === "contact_person" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="ml-1 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "m4.5 15.75 7.5-7.5 7.5 7.5"
                                      : "m19.5 8.25-7.5 7.5-7.5-7.5"
                                  }
                                />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => requestSort("employee_count")}>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Team
                            {sortConfig.key === "employee_count" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="ml-1 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "m4.5 15.75 7.5-7.5 7.5 7.5"
                                      : "m19.5 8.25-7.5 7.5-7.5-7.5"
                                  }
                                />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th className="p-3 text-center">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProjects.map((project) => (
                        <>
                          <tr
                            key={project._id}
                            className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                          >
                            <td className="p-3">
                              <div 
                                className="font-medium text-blue-600 hover:underline"
                                onClick={() => handleTableClick(project._id)}
                              >
                                {project.project_name}
                              </div>
                            </td>
                            <td className="p-3 hidden md:table-cell text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                <span className="truncate max-w-xs">{project.project_address}</span>
                              </div>
                            </td>
                            <td className="p-3 hidden lg:table-cell text-gray-600">
                              {project.employees
                                .filter((employee) => employee.employee_roles === "Foreman")
                                .map((employee, index) => (
                                  <div key={index} className="flex items-center">
                                    <User className="h-4 w-4 mr-1 text-gray-400" />
                                    <span>
                                      {employee.employee_first_name} {employee.employee_last_name}
                                    </span>
                                  </div>
                                ))}
                              {!project.employees.some((employee) => employee.employee_roles === "Foreman") && (
                                <span className="text-gray-400 text-sm">No foreman assigned</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                  {project.employees.length} {project.employees.length === 1 ? "member" : "members"}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={(e) => toggleExpandRow(project._id, e)}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                              >
                                {expandedRow === project._id ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="inline size-5"
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
                                    className="inline size-5"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                  </svg>
                                )}
                              </button>
                            </td>
                          </tr>
                          {expandedRow === project._id && (
                            <tr className="bg-gray-50">
                              <td colSpan="5" className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white p-3 rounded shadow-sm">
                                    <div className="flex items-center text-gray-700 mb-2">
                                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="font-medium">Full Address</span>
                                    </div>
                                    <p className="text-sm text-gray-600 ml-6">{project.project_address}</p>
                                  </div>

                                  <div className="bg-white p-3 rounded shadow-sm">
                                    <div className="flex items-center text-gray-700 mb-2">
                                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="font-medium">Project Team</span>
                                    </div>
                                    <div className="ml-6 grid grid-cols-1 gap-2">
                                      {project.employees.length > 0 ? (
                                        project.employees.map((employee, index) => (
                                          <div
                                            key={index}
                                            className="flex justify-between items-center text-sm border-b border-gray-100 pb-1"
                                          >
                                            <div>
                                              <span className="font-medium">
                                                {employee.employee_first_name} {employee.employee_last_name}
                                              </span>
                                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                                                {employee.employee_roles}
                                              </span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                              <Phone className="h-3 w-3 mr-1" />
                                              {employee.employee_mobile_phone}
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-sm text-gray-500">No team members assigned</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredProjects.length > itemsPerPage && (
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Showing {Math.min(filteredProjects.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                        {Math.min(filteredProjects.length, currentPage * itemsPerPage)} of {filteredProjects.length}{" "}
                        projects
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
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isArchive
                    ? "There are no archived projects matching your criteria."
                    : "There are no active projects matching your criteria."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default Project

