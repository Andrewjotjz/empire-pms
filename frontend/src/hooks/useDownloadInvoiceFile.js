export const useDownloadInvoiceFile = () => {
    const downloadInvoiceFile = async (fileId) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/invoice-file/retrieve-single/${fileId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`, // Add JWT token if required
                },
            });

            if (!res.ok) {
                throw new Error(`Failed to download the file. Status: ${res.status}`);
            }

            // Get the blob from the response
            const blob = await res.blob();

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary anchor element to trigger the download
            const a = document.createElement('a');
            a.href = url;

            // Extract filename from the Content-Disposition header (optional)
            const contentDisposition = res.headers.get('Content-Disposition');
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1]?.replace(/['"]/g, '') // Extract filename
                : 'downloaded_file'; // Fallback filename

            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Clean up temporary elements and URLs
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('An error occurred while downloading the file.');
        }
    };

    return { downloadInvoiceFile };
};
