import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

export const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    //let user = {}
    const [user,setUser] = useState({})
    const navigate = useNavigate();

    const getDocuments = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/users/documents", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDocuments(response.data);
        } catch (error) {
            handleAuthError(error);
        }
    };

    const getUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
            //user = response.data;
        } catch (error) {
            handleAuthError(error);
        }
    };


    const handleAuthError = async (error) => {
        if (error.response?.status === 403) {
            try {
                const newToken = await axios.post("http://localhost:4000/users/token", {
                    token: localStorage.getItem("refreshToken"),
                });
                if (newToken) {
                    localStorage.setItem("token", newToken.data.accessToken);
                    getDocuments();
                    getUserProfile();
                    return;
                }
            } catch {
                navigate("/");
            }
        }
        console.error("Error:", error);
    };

    useEffect(() => {
        getDocuments();
        getUserProfile();
    }, []);

    const createNewDoc = async ()=>{
        try{
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:5000/users/createNewDoc", 
                {emailId:user.emailId},
                {headers: { Authorization: `Bearer ${token}` }}
            )
            
            if (response.status === 201) {
                navigate(`/document/${response.data._id}`); // Redirect to the new document
            }
        }
        catch(error){
            if (error.response?.status === 403) {
                try {
                    const newToken = await axios.post("http://localhost:4000/users/token", {
                        token: localStorage.getItem("refreshToken"),
                    });
                    if (newToken) {
                        localStorage.setItem("token", newToken.data.accessToken);
                        createNewDoc()
                        return;
                    }
                } catch {
                    navigate("/");
                }
            }
            console.error("Error:", error);
        }
    }

    const filteredDocs = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard">
            <header className="title-bar">
                <h1 className="title">LetterPad</h1>
                <button className="profile-btn">
                    <i className="bi bi-person-circle"></i>
                    <span><p>{user.userName}</p></span>
                </button>
            </header>
            <hr className="divider" />

            <div className="new-doc-section">
                <button className="new-doc-btn" onClick={createNewDoc}>
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
