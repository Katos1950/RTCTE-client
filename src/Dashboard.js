import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

export const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const getDocuments = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/users/documents", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDocuments(response.data);
        } catch (error) {
            if (error.response?.status === 403) {
                try {
                    const newToken = await axios.post("http://localhost:4000/users/token", {
                        token: localStorage.getItem("refreshToken"),
                    });
                    if (newToken) {
                        localStorage.setItem("token", newToken.data.accessToken);
                        return getDocuments();
                    }
                } catch {
                    navigate("/");
                }
            }
            console.error("Error fetching documents:", error);
        }
    };

    useEffect(() => {
        getDocuments();
    }, []);

    const filteredDocs = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard">
            <header className="title-bar">
                <h1 className="title">LetterPad</h1>
                <button className="profile-btn">
                    <i className="bi bi-person-circle"></i>
                </button>
            </header>
            <hr className="divider" />

            <div className="new-doc-section">
                <button className="new-doc-btn">
                    <img src="/blank.jpg" alt="New Document" className="doc-icon" />
                    <span>Blank Document</span>
                </button>
            </div>
            <hr className="divider" />

            <div className="search-bar">
                <i className="bi bi-search search-icon"></i>
                <input
                    type="search"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="documents-list">
                {filteredDocs.length > 0 ? (
                    filteredDocs.map((doc) => (
                        <button 
                            key={doc._id} 
                            className="document-btn" 
                            onClick={() => navigate(`/document/${doc._id}`)}
                        >
                            {doc.name}
                        </button>
                    ))
                ) : (
                    <p className="no-docs-message">No documents found.</p>
                )}
            </div>
        </div>
    );
};
