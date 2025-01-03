import { useState } from "react";

const FileUpload = ({invoice_id}) => {
    // Component state
    const [files, setFiles] = useState(null);

    // Component functions
    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!files || files.length === 0) {
            return alert("Please select at least one file.");
        }
    
        const formData = new FormData();
        Array.from(files).forEach((file) => {
            console.log("formData object showing:", formData)
            formData.append("invoices", file); // 'invoices' must match the backend key
            console.log("After appending file, formData object showing:", formData)
        });

        formData.append("id", invoice_id);
    
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/invoice-file/upload`, {
                credentials: "include", // Include cookies for authentication
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Add JWT token
                },
                method: "POST",
                body: formData, // FormData is handled correctly by the browser
            });
    
            if (!res.ok) {
                const errorData = await res.json(); // Parse error details if available
                throw new Error(errorData.message || "Failed to upload files.");
            }
    
            const data = await res.json();
            // console.log("Response data:", data);

            alert(`${data.message}\n${data.urls.join("\n")}`);
        } catch (error) {
            alert(error.message);
        }
    };
    


    return ( 
        <div>
            <h1>Upload File</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" name="invoices" multiple onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
        </div>
     );
}
 
export default FileUpload;