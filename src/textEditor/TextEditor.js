import React, { useCallback, useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from "socket.io-client";
import { useParams } from 'react-router-dom';
import "./TextEditor.css";
import { useNavigate } from "react-router-dom";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  ["image", "blockquote", "code-block"],
  ["clean"]
];

export const TextEditor = () => {
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const { id: documentId, emailId:emailId } = useParams();
  const [activeUsers, setActiveUsers] = useState([]);
  const [showActiveUsers,setShowActiveUsers] = useState(false)
  const SAVE_INTERVAL_MS = 2000;
  const navigate = useNavigate();
  
  const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowActiveUsers(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !quill) return;

    socket.once("load-document", content => {
      quill.setContents(content); // Load Quill Delta object
      quill.enable();
  });

    socket.emit("get-document", {documentId,emailId});
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (!socket || !quill) return;

    const handler = delta => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (!socket || !quill) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (!socket || !quill) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (!socket) return;

    // Listen for active users updates
    const handler = (users) => {
      setActiveUsers(users);  // Update the active users list
    };

    socket.on("update-active-users", handler);

    return () => {
      socket.off("update-active-users", handler); // Cleanup the listener
    };
  }, [socket]);


  const editorRef = useCallback(wrapper => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  return (
    <div className='w-full h-full relative'>
      <div className='w-full h-10 flex flex-row justify-between items-center relative'>
        <i onClick={() => { navigate("/dashboard") }} className="p-3 bi bi-arrow-left-circle w-4/12 text-2xl"></i>
        <p className='w-4/12 text-center text-2xl'>LetterPad</p>
        <div className='relative w-4/12 text-right' ref={dropdownRef}>
          <i onClick={() => setShowActiveUsers(!showActiveUsers)} className="p-3 bi bi-people text-2xl cursor-pointer"></i>
          {showActiveUsers && (
            <div className='absolute right-0 mt-2 w-auto bg-purple-500 text-white p-2 rounded shadow-lg z-10'>
              {activeUsers.map((user)=><p>{user}</p>)}       
            </div>
          )}
        </div>
      </div>
      <div className='container' ref={editorRef}></div>
    </div>
  );
  
};
