

export const useFetchInvoiceFiles = () => {
    const fetchInvoiceFiles = async (invoiceId) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/invoice-file/retrieve-all/${invoiceId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`, // Add JWT token if required
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch files.');
            }

            const data = await res.json();
            return data.files;
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    return {fetchInvoiceFiles}
};
