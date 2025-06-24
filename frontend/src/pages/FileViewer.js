"use client"

import { useState, useEffect } from "react"
import { X, Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from "lucide-react"

export default function FileViewer({ isOpen, onClose, file }) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [fileBlob, setFileBlob] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)

  useEffect(() => {
    if (isOpen && file) {
      setIsLoading(true)
      setZoom(100)
      setRotation(0)
      setCurrentPage(1)
      loadFileForViewing()
    }

    return () => {
      // Clean up blob URL when component unmounts or file changes
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [isOpen, file])

  const loadFileForViewing = async () => {
    if (!file || !file.downloadUrl) {
      setIsLoading(false)
      return
    }

    try {
      // Fetch the file as blob to avoid download headers
      const response = await fetch(file.downloadUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to load file")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      setFileBlob(blob)
      setFileUrl(url)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading file:", error)
      setIsLoading(false)
    }
  }

  if (!isOpen || !file) return null

  const handleDownload = () => {
    if (fileBlob) {
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = file.originalName || file.fileName || `${file.title}.pdf`
      link.click()
    } else {
      // Fallback to original download method
      const link = document.createElement("a")
      link.href = file.downloadUrl
      link.download = file.originalName || file.fileName || `${file.title}.pdf`
      link.click()
    }
  }

  const renderFileContent = () => {
    if (!fileUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Failed to load file for preview</p>
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Download className="h-4 w-4" />
              Download to View
            </button>
          </div>
        </div>
      )
    }

    const mimeType = file.mimeType || "application/pdf"

    if (mimeType.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center h-full">
          <img
            src={fileUrl || "/placeholder.svg"}
            alt={file.title}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      )
    }

    if (mimeType === "application/pdf") {
      return (
        <div className="h-full w-full">
          <iframe
            src={`${fileUrl}#page=${currentPage}&zoom=${zoom}`}
            className="w-full h-full border-0"
            title={file.title}
            onLoad={() => setIsLoading(false)}
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </div>
      )
    }

    if (mimeType.startsWith("text/")) {
      return (
        <div className="p-6 h-full overflow-auto">
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            title={file.title}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      )
    }

    // Fallback for unsupported file types
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Preview not available for this file type</p>
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Download className="h-4 w-4" />
            Download to View
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{file.title}</h2>
            <p className="text-sm text-gray-600">
              {file.supplier} • {file.fileSize}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mx-4">
            {file.pages && file.pages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {file.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(file.pages || 1, currentPage + 1))}
                  disabled={currentPage >= (file.pages || 1)}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="p-1 rounded hover:bg-gray-200"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="p-1 rounded hover:bg-gray-200"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setRotation((rotation + 90) % 360)}
              className="p-1 rounded hover:bg-gray-200"
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            <button onClick={handleDownload} className="p-1 rounded hover:bg-gray-200" title="Download">
              <Download className="h-4 w-4" />
            </button>
          </div>

          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          {renderFileContent()}
        </div>
      </div>
    </div>
  )
}

// "use client"

// import { useState, useEffect } from "react"
// import { X, Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from "lucide-react"

// export default function FileViewer({ isOpen, onClose, file }) {
//   const [zoom, setZoom] = useState(100)
//   const [rotation, setRotation] = useState(0)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     if (isOpen && file) {
//       setIsLoading(true)
//       setZoom(100)
//       setRotation(0)
//       setCurrentPage(1)
//     }
//   }, [isOpen, file])

//   if (!isOpen || !file) return null

//   const handleDownload = () => {
//     const link = document.createElement("a")
//     link.href = file.downloadUrl
//     link.download = `${file.title}.pdf`
//     link.click()
//   }

//   const renderFileContent = () => {
//     const mimeType = file.mimeType || "application/pdf"

//     if (mimeType.startsWith("image/")) {
//       return (
//         <div className="flex items-center justify-center h-full">
//           <img
//             src={file.downloadUrl || "/placeholder.svg"}
//             alt={file.title}
//             style={{
//               transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
//               maxWidth: "100%",
//               maxHeight: "100%",
//               objectFit: "contain",
//             }}
//             onLoad={() => setIsLoading(false)}
//             onError={() => setIsLoading(false)}
//           />
//         </div>
//       )
//     }

//     if (mimeType === "application/pdf") {
//       return (
//         <div className="h-full w-full">
//           <iframe
//             src={`${file.downloadUrl}#page=${currentPage}&zoom=${zoom}`}
//             className="w-full h-full border-0"
//             title={file.title}
//             onLoad={() => setIsLoading(false)}
//           />
//         </div>
//       )
//     }

//     if (mimeType.startsWith("text/")) {
//       return (
//         <div className="p-6 h-full overflow-auto">
//           <iframe
//             src={file.downloadUrl}
//             className="w-full h-full border-0"
//             title={file.title}
//             onLoad={() => setIsLoading(false)}
//           />
//         </div>
//       )
//     }
    
//   console.log("file", file)

//     // Fallback for unsupported file types
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="text-center">
//           <div className="text-gray-400 mb-4">
//             <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
//               <path
//                 fillRule="evenodd"
//                 d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </div>
//           <p className="text-gray-600 mb-4">Preview not available for this file type</p>
//           <button
//             onClick={handleDownload}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
//           >
//             <Download className="h-4 w-4" />
//             Download to View
//           </button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
//           <div className="flex-1">
//             <h2 className="text-lg font-semibold text-gray-900 truncate">{file.title}</h2>
//             <p className="text-sm text-gray-600">
//               {file.supplier} • {file.fileSize}
//             </p>
//           </div>

//           {/* Controls */}
//           <div className="flex items-center gap-2 mx-4">
//             {file.pages && file.pages > 1 && (
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                   disabled={currentPage <= 1}
//                   className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </button>
//                 <span className="text-sm text-gray-600">
//                   {currentPage} / {file.pages}
//                 </span>
//                 <button
//                   onClick={() => setCurrentPage(Math.min(file.pages || 1, currentPage + 1))}
//                   disabled={currentPage >= (file.pages || 1)}
//                   className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>
//             )}

//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setZoom(Math.max(25, zoom - 25))}
//                 className="p-1 rounded hover:bg-gray-200"
//                 title="Zoom Out"
//               >
//                 <ZoomOut className="h-4 w-4" />
//               </button>
//               <span className="text-sm text-gray-600 min-w-[3rem] text-center">{zoom}%</span>
//               <button
//                 onClick={() => setZoom(Math.min(200, zoom + 25))}
//                 className="p-1 rounded hover:bg-gray-200"
//                 title="Zoom In"
//               >
//                 <ZoomIn className="h-4 w-4" />
//               </button>
//             </div>

//             <button
//               onClick={() => setRotation((rotation + 90) % 360)}
//               className="p-1 rounded hover:bg-gray-200"
//               title="Rotate"
//             >
//               <RotateCw className="h-4 w-4" />
//             </button>

//             <button onClick={handleDownload} className="p-1 rounded hover:bg-gray-200" title="Download">
//               <Download className="h-4 w-4" />
//             </button>
//           </div>

//           <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
//             <X className="h-4 w-4" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="flex-1 relative bg-gray-100">
//           {isLoading && (
//             <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//             </div>
//           )}
//           {renderFileContent()}
//         </div>
//       </div>
//     </div>
//   )
// }
