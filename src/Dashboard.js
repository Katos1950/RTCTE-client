import { useEffect, useState, useRef} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

export const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal,setShowModal] = useState(false);
    const [docName,setDocName] = useState("")
    const [createDocError,setCreateDocError] = useState("")
    const [user,setUser] = useState({})
    const [filterType,setFilterType]= useState('A');
    const [menuOpen,setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const [currentName,setCurrentName] = useState("")
    const [renDoc,setRenDoc] = useState("")
    const [isRenaming,setIsRenaming] = useState(false)
    const [isSharing,setIsSharing] = useState(false);
    const [sharedEmail,setSharedEmail] = useState("")
    const [role, setRole] = useState("viewer");
    const navigate = useNavigate();

    const openModal = ()=> setShowModal(true);
    const closeModal = ()=> {
        setDocName("")
        setCreateDocError("")
        setShowModal(false);
        setIsRenaming(false)
        setIsSharing(false)
        setRenDoc("")
        setSharedEmail("")
        setCurrentName("")
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const checkIfDocExists =()=>{
        if(isRenaming){
            if(renDoc==="")
                setCreateDocError("Name is required")
            else if(documents.find(doc => doc.name === renDoc)){
                setCreateDocError("Document already exists")
            }
            else{
                setCreateDocError("");
                renameDoc()
                closeModal()
            }    
        }
        else{
            if(docName==="")
                setCreateDocError("Name is required")
            else if(documents.find(doc => doc.name === docName)){
                setCreateDocError("Document already exists")
            }
            else{
                setCreateDocError("");
                createNewDoc();
            }
        }
    }

    const isSharedEmailValid = async ()=>{
        if(sharedEmail==="")
                setCreateDocError("email is required")
        else if(documents.find(doc => doc.createdBy === sharedEmail)){
                setCreateDocError("The file is already yours!")
        }
        else{
            try {
                setCreateDocError("");
                const token = localStorage.getItem("token");

                const response = await axios.get("http://localhost:5000/users/find", {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { emailId: sharedEmail }
                });

                if(response.status===200){
                    const docId = documents.find(doc=> doc.name === currentName)._id
                    const response2 = await axios.post("http://localhost:5000/users/allowUser", {
                        documentId: docId,
                        emailId: sharedEmail,
                        role: role
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
                closeModal()
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setCreateDocError("Enter a valid registered email.");
                }
                else{
                handleAuthError(error,()=>{
                    isSharedEmailValid()
                });
                }
            }
        }
    }

    const getDocuments = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/users/documents", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDocuments(response.data);
        } catch (error) {
            handleAuthError(error,()=>{
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
            //user = response.data;
        } catch (error) {
            handleAuthError(error,()=>{
                getDocuments();
                getUserProfile();
            });
        }
    };


    const handleAuthError = async (error,fn) => {
        if (error.response?.status === 403) {
            try {
                const newToken = await axios.post("http://localhost:4000/users/token", {
                    token: localStorage.getItem("refreshToken"),
                });
                if (newToken) {
                    localStorage.setItem("token", newToken.data.accessToken);
                    fn()
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
                {emailId:user.emailId, name:docName},
                {headers: { Authorization: `Bearer ${token}` }}
            )
            
            if (response.status === 201) {
                navigate(`/document/${response.data._id}`); // Redirect to the new document
            }
        }
        catch(error){
            handleAuthError(error,createNewDoc)
        }
    }

    const filteredDocs = ()=>{
        if(filterType==='A'){
            return documents.filter((doc) =>
            doc.name.toLowerCase().includes(searchQuery.toLowerCase()))
        }
        else if(filterType === 'C'){
            return documents.filter((doc) =>
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) 
                &&
                doc.createdBy === user.emailId)
        }
        else if(filterType === 'S'){
            return documents.filter((doc) =>
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) 
                &&
                doc.allowedUsers.some(person => person.emailId === user.emailId))
        }
        else return []   
    }

    const deleteDoc = async (documentName)=>{
        try{
            const token = localStorage.getItem("token");
            const response = await axios.delete("http://localhost:5000/users/documents/del", {
                headers: { Authorization: `Bearer ${token}` },
                data: { emailId: user.emailId, name: documentName }
            })
            getDocuments()
        }
        catch(error){
            handleAuthError(error,()=>deleteDoc(documentName))
        }
    }

    const renameDoc = async ()=>{
        try{
            const token = localStorage.getItem("token");
            const response = await axios.put(
                "http://localhost:5000/users/documents/rename",
                { emailId: user.emailId, name: currentName, newName: renDoc }, // Body data
                { headers: { Authorization: `Bearer ${token}` } } // Headers separately
              );
              getDocuments()
        }
        catch(error){
            handleAuthError(error,renameDoc)
        }
    }

    const logout = async () => {
        await axios.delete("http://localhost:4000/users/logout", {
            data: { token: localStorage.getItem("refreshToken") },
        });
        navigate("/");
    }

    return (
        <div className="dashboard">
            <header className="title-bar">
                <h1 className="title">LetterPad</h1>
                <div className="profile-container">
                    <button
                        ref={buttonRef}
                        className="profile-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <i className="bi bi-person-circle"></i>
                    </button>
                    {menuOpen && (
                        <div ref={menuRef} className="profile-menu">
                            <p className="menu-item">{user.userName}</p>
                            <button className="menu-item">Edit Profile</button>
                            <button className="menu-item">Requests</button>
                            <button className="menu-item" onClick={logout}>Logout</button>
                        </div>
                    )}
                </div>
            </header>
            <style jsx>{`
                .profile-container {
                    position: relative;
                }
                .profile-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: black;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    min-width: 150px;
                }
                .menu-item {
                    padding: 10px;
                    border: none;
                    background: none;
                    text-align: left;
                    cursor: pointer;
                }
                .menu-item:hover {
                    background: lightgray;
                }
            `}</style>
            <hr className="divider" />

            <div className="new-doc-section">
                <button className="new-doc-btn" onClick={openModal}>
                {/* <button className="new-doc-btn" onClick={createNewDoc}> */}
                    <img src="/blank.jpg" alt="New Document" className="doc-icon" />
                    <span>Blank Document</span>
                </button>
            </div>

            {showModal && (
              <div
                id="default-modal"
                tabIndex="-1"
                
                className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-gray-800 bg-opacity-50"
              >
                <div className="relative p-4 w-full max-w-sm rounded-lg shadow bg-gray-800">
                  <div className="p-4 space-y-4">
                    <p className="text-2xl leading-relaxed text-white">
                      {isSharing ? "Share with(email)?" : isRenaming?"Rename to?":"Name of the document?"}
                    </p>

                    <div className="flex items-center justify-center p-4 md:p-5 border-t  rounded-b border-gray-400">
                        <input type="text" 
                        placeholder="name" 
                        value={isSharing? sharedEmail : isRenaming?renDoc:docName}
                        onChange={(e) => {
                            if(isRenaming)
                                setRenDoc(e.target.value)
                            else if(isSharing)
                                setSharedEmail(e.target.value)
                            else
                                setDocName(e.target.value)
                        }}></input>
                        
                        {isSharing &&
                            <select
                                className="w-full p-2 border rounded-md"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                            </select>
                        }
                    </div>
                    { createDocError && <p className="text-red-600">{createDocError}</p>}


                    <div className="flex items-center justify-center p-4 md:p-5  rounded-b border-gray-400">
                    <button
                      className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-8 py-3 text-center"
                      onClick={closeModal}
                    >
                        Cancel
                    </button>

                    <button
                      className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-8 py-3 text-center"
                      onClick={isSharing ? isSharedEmailValid : checkIfDocExists}
                    >
                      OK
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

            <hr className="divider" />

            <div className="w-full flex flex-row">
                <button className="px-1 m-1 border-2 border-solid border-gray-900" onClick={()=>setFilterType('A')}>All</button>
                <button className="px-1 m-1 border-2 border-solid border-gray-900" onClick={()=>setFilterType('C')}>Created By You</button>
                <button className="px-1 m-1 border-2 border-solid border-gray-900" onClick={()=>setFilterType('S')}>Shared With You</button>
            </div>

            <div className="w-full flex flex-row ml-2 mt-2">
                <p className="w-3/5">Name</p>
                <p className="w-2/5">Created By</p>
            </div>

            <div className="documents-list">
                {filteredDocs().length > 0 ? (
                    filteredDocs().map((doc) => (
                        <button 
                            key={doc._id} 
                            className="document-btn" 
                            onClick={() => navigate(`/document/${doc._id}`)}
                        >
                            <div className="flex flex-row">
                                <div className="w-3/5">
                                    {doc.name}
                                </div>
                                <div className="w-2/5">
                                    {doc.createdBy}
                                </div>
                                {
                                    (doc.createdBy===user.emailId)?
                                        <span className="w-10 flex flex-row justify-center items-center border-2 border-solid border-black" onClick={(e)=>{
                                            e.stopPropagation(); // Prevents the button click from firing
                                            setCurrentName(doc.name)
                                            setIsRenaming(true)
                                            openModal()
                                            }}>
                                            <i className="bi bi-pen"></i>
                                        </span>
                                        :
                                        <span className="w-10 flex flex-row justify-center items-center border-2 border-solid border-gray-400 text-gray-400 cursor-not-allowed" title="You cannot delete this document">
                                        <i className="bi bi-pen"></i>
                                        </span>                                   
                                }
                                
                                {
                                    (doc.createdBy===user.emailId)?
                                        <span className="w-10 flex flex-row justify-center items-center border-2 border-solid border-black" onClick={(e)=>{
                                            e.stopPropagation(); // Prevents the button click from firing
                                            setCurrentName(doc.name)
                                            setIsSharing(true)
                                            openModal()
                                            }}>
                                            <i className="bi bi-share"></i>
                                        </span>
                                        :
                                        <span className="w-10 flex flex-row justify-center items-center border-2 border-solid border-gray-400 text-gray-400 cursor-not-allowed">
                                        <i className="bi bi-share"></i>
                                        </span>                                   
                                }

                                {
                                    (doc.createdBy===user.emailId)?
                                        <span className="w-10 flex flex-row justify-center items-center border-2 border-solid border-black" onClick={(e)=>{
                                            e.stopPropagation(); // Prevents the button click from firing
                                            deleteDoc(doc.name)}}>
                                            <i className="bi bi-trash"></i>
                                        </span>
                                        :
                                        <span className="w-10 flex flex-row justify-center items-center border-2 border-solid border-gray-400 text-gray-400 cursor-not-allowed" title="You cannot delete this document">
                                        <i className="bi bi-trash"></i>
                                        </span>                                   
                                }
                            </div>
                        </button>  
                    ))
                ) : (
                    <p className="no-docs-message">No documents found.</p>
                )}
            </div>
        </div>
    );
};
