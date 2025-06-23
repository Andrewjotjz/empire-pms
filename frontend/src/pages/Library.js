"use client"

import { useState } from "react"
import LibraryList from "./LibraryList2.js"
import LibraryUpload from "./LibraryUpload2.js"

export default function App() {
  const [currentView, setCurrentView] = useState("library")
  const [uploadCallback, setUploadCallback] = useState(null)

  const handleUploadClick = (addResourceCallback) => {
    setUploadCallback(() => addResourceCallback)
    setCurrentView("upload")
  }

  const handleBackToLibrary = () => {
    setCurrentView("library")
  }

  const handleUpload = (newResource) => {
    if (uploadCallback) {
      uploadCallback(newResource)
    }
    setCurrentView("library")
  }

  return (
    <div>
      {currentView === "library" ? (
        <LibraryList onUploadClick={handleUploadClick} />
      ) : (
        <LibraryUpload onBack={handleBackToLibrary} onUpload={handleUpload} />
      )}
    </div>
  )
}
