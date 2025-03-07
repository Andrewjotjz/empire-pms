const Iframe = () => {
    return (
        <>
            <div style={{
                width: "100%", 
                display: "flex", 
                justifyContent: "center", 
                padding: "20px", // Added padding for spacing
                marginBottom: "20px", // Space between iframes
            }}>
                <iframe
                    style={{
                        background: "#FFFFFF",
                        border: "none",
                        borderRadius: "2px",
                        boxShadow: "0 2px 10px 0 rgba(70, 76, 79, .2)",
                        width: "90%", // Adjust for responsiveness
                        height: "500px",
                    }}
                    src="https://charts.mongodb.com/charts-project-0-jmzbyjh/embed/charts?id=4505f528-8aab-40c5-9864-719148efbf8c&maxDataAge=3600&theme=light&autoRefresh=true"
                ></iframe>
            </div>

            <div style={{
                width: "100%", 
                display: "flex", 
                justifyContent: "center", 
                padding: "20px", // Added padding for spacing
            }}>
                <iframe
                    style={{
                        background: "#21313C",
                        border: "none",
                        borderRadius: "2px",
                        boxShadow: "0 2px 10px 0 rgba(70, 76, 79, .2)",
                        width: "90%", // Adjust for responsiveness
                        height: "500px", // Consistent height
                    }}
                    src="https://charts.mongodb.com/charts-project-0-jmzbyjh/embed/charts?id=5ae45303-7b6f-495e-8a83-ce7fc1a77068&maxDataAge=3600&theme=dark&autoRefresh=true"
                ></iframe>
            </div>
        </>
    );
};

export default Iframe;
