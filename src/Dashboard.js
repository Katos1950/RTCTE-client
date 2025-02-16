import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

export const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [docName, setDocName] = useState("");
    const [createDocError, setCreateDocError] = useState("");
    const [user, setUser] = useState({});
    const [filterType, setFilterType] = useState("A");
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const [currentName, setCurrentName] = useState("");
    const [renDoc, setRenDoc] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [sharedEmail, setSharedEmail] = useState("");
    const [role, setRole] = useState("viewer");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);
    const navigate = useNavigate();

    const openModal = () => setShowModal(true);
    const closeModal = () => {
        setDocName("");
        setCreateDocError("");
        setShowModal(false);
        setIsRenaming(false);
        setIsSharing(false);
        setRenDoc("");
        setSharedEmail("");
        setCurrentName("");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const checkIfDocExists = () => {
        if (isRenaming) {
            if (renDoc === "") setCreateDocError("Name is required");
            else if (documents.find((doc) => doc.name === renDoc)) {
                setCreateDocError("Document already exists");
            } else {
                setCreateDocError("");
                renameDoc();
                closeModal();
            }
        } else {
            if (docName === "") setCreateDocError("Name is required");
            else if (documents.find((doc) => doc.name === docName)) {
                setCreateDocError("Document already exists");
            } else {
                setCreateDocError("");
                createNewDoc();
            }
        }
    };

    const isSharedEmailValid = async () => {
        if (sharedEmail === "") setCreateDocError("Email is required");
        else if (documents.find((doc) => doc.createdBy === sharedEmail)) {
            setCreateDocError("The file is already yours!");
        } else {
            try {
                setCreateDocError("");
                const token = localStorage.getItem("token");

                const response = await axios.get("http://localhost:5000/users/find", {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { emailId: sharedEmail },
                });

                if (response.status === 200) {
                    const docId = documents.find((doc) => doc.name === currentName)._id;
                    await axios.post(
                        "http://localhost:5000/users/allowUser",
                        {
                            documentId: docId,
                            emailId: sharedEmail,
                            role: role,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
                closeModal();
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setCreateDocError("Enter a valid registered email.");
                } else {
                    handleAuthError(error, isSharedEmailValid);
                }
            }
        }
    };

    const getDocuments = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/users/documents", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDocuments(response.data);
        } catch (error) {
            handleAuthError(error, () => {
                getDocuments();
                getUserProfile();
            });
        }
    };

    const getUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
        } catch (error) {
            handleAuthError(error, () => {
                getDocuments();
                getUserProfile();
            });
        }
    };

    const handleAuthError = async (error, fn) => {
        if (error.response?.status === 403) {
            try {
                const newToken = await axios.post("http://localhost:4000/users/token", {
                    token: localStorage.getItem("refreshToken"),
                });
                if (newToken) {
                    localStorage.setItem("token", newToken.data.accessToken);
                    fn();
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

    const createNewDoc = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/users/createNewDoc",
                { emailId: user.emailId, name: docName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                navigate(`/document/${response.data._id}`);
            }
        } catch (error) {
            handleAuthError(error, createNewDoc);
        }
    };

    const filteredDocs = () => {
        const filtered = documents.filter((doc) =>
            doc.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filterType === "C") {
            return filtered.filter((doc) => doc.createdBy === user.emailId);
        } else if (filterType === "S") {
            return filtered.filter((doc) =>
                doc.allowedUsers.some((person) => person.emailId === user.emailId)
            );
        }
        return filtered;
    };

    const deleteDoc = async (documentName) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete("http://localhost:5000/users/documents/del", {
                headers: { Authorization: `Bearer ${token}` },
                data: { emailId: user.emailId, name: documentName },
            });
            getDocuments();
        } catch (error) {
            handleAuthError(error, () => deleteDoc(documentName));
        }
    };

    const renameDoc = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                "http://localhost:5000/users/documents/rename",
                { emailId: user.emailId, name: currentName, newName: renDoc },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getDocuments();
        } catch (error) {
            handleAuthError(error, renameDoc);
        }
    };

    const logout = async () => {
        await axios.delete("http://localhost:4000/users/logout", {
            data: { token: localStorage.getItem("refreshToken") },
        });
        navigate("/");
    };

    return (
        <div className="dashboard">
            <header className="app-header">
                <div className="header-content">
                    <h1 className="app-title">
                        <span className="logo-icon">✎</span>
                        LetterPad
                    </h1>
                    <div className="profile-container">
                        <button
                            ref={buttonRef}
                            className="profile-btn"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <div className="avatar">
                                <i className="bi bi-person-circle"></i>
                            </div>
                        </button>
                        {menuOpen && (
                            <div ref={menuRef} className="profile-menu">
                                <div className="menu-header">
                                    <div className="avatar-lg">
                                        <i className="bi bi-person-circle"></i>
                                    </div>
                                    <div className="user-info">
                                        <h3>{user.userName}</h3>
                                        <p>{user.emailId}</p>
                                    </div>
                                </div>
                                {/* <button className="menu-item">
                                    <i className="bi bi-pencil-square"></i> Edit Profile
                                </button>
                                <button className="menu-item">
                                    <i className="bi bi-envelope-paper"></i> Requests
                                </button> */}
                                <button className="menu-item" onClick={logout}>
                                    <i className="bi bi-box-arrow-right"></i> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="doc-actions">
                    <button className="create-btn" onClick={openModal}>
                        <span className="plus-icon">+</span>
                        New Document
                    </button>
                    <div className="search-container">
                        <i className="bi bi-search search-icon"></i>
                        <input
                            type="search"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="filter-tabs">
                    <button
                        className={`tab ${filterType === "A" ? "active" : ""}`}
                        onClick={() => setFilterType("A")}
                    >
                        All Documents
                    </button>
                    <button
                        className={`tab ${filterType === "C" ? "active" : ""}`}
                        onClick={() => setFilterType("C")}
                    >
                        My Documents
                    </button>
                    <button
                        className={`tab ${filterType === "S" ? "active" : ""}`}
                        onClick={() => setFilterType("S")}
                    >
                        Shared With Me
                    </button>
                </div>

                <div className="documents-list">
                    {filteredDocs().length > 0 ? (
                        filteredDocs().map((doc) => (
                            <div key={doc._id} className="document-card" onClick={()=> navigate(`/document/${doc._id}`)}>
                                <div className="doc-info">
                                    <h3>{doc.name}</h3>
                                    <p>Created by: {doc.createdBy}</p>
                                </div>
                                <div className="doc-actions">
                                    {doc.createdBy === user.emailId && (
                                        <>
                                            <button
                                                className="action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentName(doc.name);
                                                    setIsRenaming(true);
                                                    openModal();
                                                }}
                                            >
                                                <i className="bi bi-pen"></i>
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentName(doc.name);
                                                    setIsSharing(true);
                                                    openModal();
                                                }}
                                            >
                                                <i className="bi bi-share"></i>
                                            </button>
                                            <button
                                                className="action-btn danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDocToDelete(doc.name);
                                                    setShowDeleteConfirmation(true);
                                                }}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-docs-message">No documents found.</p>
                    )}
                </div>
            </main>

            {/* Modal for creating/renaming/sharing */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>
                            {isSharing
                                ? "Share with (email)?"
                                : isRenaming
                                ? "Rename to?"
                                : "Name of the document?"}
                        </h2>
                        <input
                            type="text"
                            placeholder={isSharing ? "Enter email" : "Enter name"}
                            value={isSharing ? sharedEmail : isRenaming ? renDoc : docName}
                            onChange={(e) =>
                                isSharing
                                    ? setSharedEmail(e.target.value)
                                    : isRenaming
                                    ? setRenDoc(e.target.value)
                                    : setDocName(e.target.value)
                            }
                        />
                        {isSharing && (
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                            </select>
                        )}
                        {createDocError && <p className="error-message">{createDocError}</p>}
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={isSharing ? isSharedEmailValid : checkIfDocExists}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal for Deleting */}
            {showDeleteConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Delete Document</h2>
                        <p>Are you sure you want to delete this document? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowDeleteConfirmation(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={() => {
                                    deleteDoc(docToDelete);
                                    setShowDeleteConfirmation(false);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};