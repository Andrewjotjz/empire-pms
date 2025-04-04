"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Archive, Layers, Mail, Phone, Plus, Search, User, Users, Briefcase, X } from "lucide-react"
import SessionExpired from "../components/SessionExpired"
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton"
import UnauthenticatedSkeleton from "./loaders/UnauthenticateSkeleton"

const itemsPerPage = 10

const Employee = () => {
  // Component state declaration
  const localUser = JSON.parse(localStorage.getItem("localUser"))
  
  const [employeeState, setEmployeeState] = useState([])
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [isArchive, setIsArchive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "employee_last_name", direction: "ascending" })
  const [currentPage, setCurrentPage] = useState(1)

  // Component router
  const navigate = useNavigate()

  // Component functions and variables
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const filterEmployees = () => {
    return employeeState.filter((employee) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()

      return (
        employee.employee_last_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        employee.employee_first_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        employee.employee_email.toLowerCase().includes(lowerCaseSearchTerm) ||
        employee.employee_mobile_phone.toString().includes(lowerCaseSearchTerm) ||
        employee.employee_roles.toLowerCase().includes(lowerCaseSearchTerm) ||
        employee.projects.some((project) => project.project_name.toLowerCase().includes(lowerCaseSearchTerm))
      )
    })
  }

  const handleAddClick = () => {
    navigate("/EmpirePMS/employee/create")
  }

  const handleTableClick = (id) => navigate(`/EmpirePMS/employee/${id}`, { state: id })

  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortedEmployees = (employees) => {
    if (!sortConfig.key) return employees

    return [...employees].sort((a, b) => {
      let aValue, bValue

      if (sortConfig.key === "name") {
        aValue = `${a.employee_last_name} ${a.employee_first_name}`
        bValue = `${b.employee_last_name} ${b.employee_first_name}`
      } else if (sortConfig.key === "email") {
        aValue = a.employee_email
        bValue = b.employee_email
      } else if (sortConfig.key === "contact") {
        aValue = a.employee_mobile_phone
        bValue = b.employee_mobile_phone
      } else if (sortConfig.key === "role") {
        aValue = a.employee_roles
        bValue = b.employee_roles
      } else if (sortConfig.key === "projects") {
        aValue = a.projects.length
        bValue = b.projects.length
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

  // Fetch employees
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchEmployeeDetails = async () => {
      setIsLoadingState(true)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch employees")
        }

        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setIsLoadingState(false)
        setEmployeeState(data)
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

    fetchEmployeeDetails()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [])

  const filteredEmployees = getSortedEmployees(
    filterEmployees().filter((employee) => employee.employee_isarchived === isArchive),
  )

  const pageCount = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
          </div>

          {/* Search and Add Button */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              { searchTerm === "" ? (<Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />) : (<X className="absolute right-3 top-2.5 text-gray-400 h-5 w-5 hover:scale-105 hover:cursor-pointer" onClick={() => setSearchTerm("")}/>) }
            </div>

            <button
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">ADD EMPLOYEE</span>
            </button>
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
            {Array.isArray(employeeState) && employeeState.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                        <th className="p-3 cursor-pointer" onClick={() => requestSort("name")}>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Name
                            {sortConfig.key === "name" && (
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
                        <th className="p-3 cursor-pointer hidden md:table-cell" onClick={() => requestSort("email")}>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                            {sortConfig.key === "email" && (
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
                        <th className="p-3 cursor-pointer" onClick={() => requestSort("contact")}>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            Contact
                            {sortConfig.key === "contact" && (
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
                        <th className="p-3 cursor-pointer hidden md:table-cell" onClick={() => requestSort("role")}>
                          <div className="flex items-center">
                            Role
                            {sortConfig.key === "role" && (
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
                        <th className="p-3 cursor-pointer" onClick={() => requestSort("projects")}>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            Projects
                            {sortConfig.key === "projects" && (
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
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEmployees.map((employee) => (
                        <tr
                          key={employee._id}
                          onClick={() => handleTableClick(employee._id)}
                          className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        >
                          <td className="p-3">
                            <div className="font-medium text-blue-600 hover:underline">
                              {`${employee.employee_first_name} ${employee.employee_last_name}`}
                            </div>
                          </td>
                          <td className="p-3 hidden md:table-cell text-gray-600">{employee.employee_email}</td>
                          <td className="p-3 text-gray-600">{employee?.employee_mobile_phone || "none"}</td>
                          <td className="p-3 hidden md:table-cell">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                employee.employee_roles.includes("Admin")
                                  ? "bg-purple-100 text-purple-800"
                                  : employee.employee_roles.includes("Manager")
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {employee.employee_roles}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {employee.projects.length > 0 ? (
                                employee.projects.slice(0, 2).map((project, index) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-lg border border-gray-200"
                                  >
                                    {project.project_name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs">No projects</span>
                              )}
                              {employee.projects.length > 2 && (
                                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-lg border border-gray-200">
                                  +{employee.projects.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredEmployees.length > 0 && (
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Showing {Math.min(filteredEmployees.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                        {Math.min(filteredEmployees.length, currentPage * itemsPerPage)} of {filteredEmployees.length}{" "}
                        employees
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
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No employees found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isArchive
                    ? "There are no archived employees matching your criteria."
                    : "There are no active employees matching your criteria."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
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

export default Employee

