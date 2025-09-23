import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
axios.defaults.withCredentials = true;
export default function Home() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => navigate("/login"));
    axios
      .get("/chat/getChats")
      .then((res) => setChats(res.data.chats || []))
      .catch(() => toast.error("Failed to load chats"));
  }, [navigate]);
  useEffect(() => {
    const socket = io("http://localhost:3000", { withCredentials: true });
    socketRef.current = socket;
    socket.on("ai-response", (data) => {
      if (data.chat === activeChat?._id) {
        setMessages((prev) => [...prev, { role: "model", content: data.content }]);
      }
    });
    return () => socket.disconnect();
  }, [activeChat]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const handleSelectChat = async (chat) => {
    setActiveChat(chat);
    setSidebarOpen(false);
    try {
      const res = await axios.get(`/chat/messages/${chat._id}`);
      setMessages(res.data.messages || []);
    } catch {
      setMessages([]);
    }
  };
  const handleNewChat = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return toast.error("Enter a chat title");
    try {
      const res = await axios.post("/chat/create-chat", { title: newTitle.trim() });
      const createdChat = res.data.chat;
      setChats((prev) => [createdChat, ...prev]);
      await handleSelectChat(createdChat);
      setNewTitle("");
      setSidebarOpen(false);
    } catch (err) {
      toast.error("Could not create chat");
    }
  };
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;
    const msg = { chat: activeChat._id, content: message.trim() };
    console.log("sending message payload:", msg);
    setMessages((prev) => [...prev, { role: "user", content: msg.content }]);
    socketRef.current?.emit("ai-message", msg);
    setMessage("");
  };
  const handleLogout = async () => {
    try {
      await axios.get("/auth/logout");
      toast.success("Logged out");
      navigate("/login");
    } catch {}
  };
  const Sidebar = (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full p-4">
      <form onSubmit={handleNewChat} className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Chat title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-gray-800 px-2 py-1 rounded text-sm"
        />
        <button type="submit" className="bg-blue-600 text-black px-2 py-1 rounded hover:bg-blue-500">
          +
        </button>
      </form>
      <div className="flex-1 overflow-y-auto">
        {chats.length > 0 ? (
          chats.map((c) => (
            <button
              key={c._id}
              onClick={() => handleSelectChat(c)}
              className={`block w-full text-left px-3 py-2 rounded mb-1 hover:bg-gray-800 ${
                activeChat?._id === c._id ? "bg-gray-800" : ""
              }`}
            >
              {c.title || "Untitled Chat"}
            </button>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No chats yet</p>
        )}
      </div>
      {user && (
        <div className="mt-6 border-t border-gray-700 pt-3">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="avatar" className="w-8 h-8 rounded-full mb-2" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-black flex items-center justify-center mb-2 font-bold">
              {user.username?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <p className="text-sm font-medium">{user.username}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      )}
    </aside>
  );
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button className="md:hidden mr-2" onClick={() => setSidebarOpen((v) => !v)}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-bold text-lg">Aurora GPT</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1 border border-blue-500 text-blue-400 rounded hover:bg-blue-500 hover:text-black"
        >
          Logout
        </button>
      </header>
      <div className="flex flex-1 h-[calc(100dvh-56px)]">
        {/* Sidebar for desktop */}
        <div className="hidden md:block h-full">{Sidebar}</div>
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 flex">
            <div className="bg-black/60 w-full h-full" onClick={() => setSidebarOpen(false)}></div>
            <div className="z-40 h-full">{Sidebar}</div>
          </div>
        )}
        <main className="flex-1 flex flex-col">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-bold mb-2">Welcome to Aurora GPT</h2>
              <p className="text-gray-400 mb-4">Create a chat to start messaging.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`px-3 py-2 rounded-lg max-w-[70%] ${
                        m.role === "user" ? "bg-blue-600 text-black" : "bg-gray-800 text-white"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-gray-800 p-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-500 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
