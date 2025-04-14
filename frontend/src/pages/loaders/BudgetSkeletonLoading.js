import { Filter, Download, DollarSign, BarChart, AlertCircle, Search } from "lucide-react"

export default function BudgetSkeletonLoading() {
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                  {index === 3 && <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mt-1"></div>}
                </div>
                <div
                  className={`p-3 ${index === 1 ? "bg-blue-50" : index === 2 ? "bg-green-50" : "bg-gray-100"} rounded-full`}
                >
                  {index === 1 ? (
                    <DollarSign className="h-6 w-6 text-blue-500" />
                  ) : index === 2 ? (
                    <BarChart className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Selector */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex space-x-4 mb-4 md:mb-0">
              {["Summary", "By Type"].map((tab, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${index === 0 ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
                >
                  {tab}
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <div className="block w-full h-9 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white"></div>
            </div>
          </div>
        </div>

        {/* Detailed View - Table Skeleton */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Budget
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actual
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Variance
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary View - Visual Chart Skeleton */}
        <div className="hidden bg-white p-6 rounded-lg shadow mt-6">
          <div className="h-6 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-6">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-300 animate-pulse"
                        style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

