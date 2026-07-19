import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatWindow from "../components/chat/ChatWindow";
import Sidebar from "../components/chat/Sidebar";
import BottomBar from "../components/layout/BottomBar";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";

const Home = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const {
        contacts,
        activeContact,
        selectContact,
        sendMessage,
        activeContactId,
        searchQuery,
        setSearchQuery,
    } = useChat();

    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/auth");
        }
    }, [loading, navigate, user]);

    useEffect(() => {
        if (activeContact && window.innerWidth < 768) {
            setShowSidebar(false);
        }
    }, [activeContact]);

    if (loading || !user) {
        return null;
    }

    return (
        <div className="h-screen bg-white flex flex-col overflow-hidden">
            <Navbar />

            <div className="flex-1 flex overflow-hidden relative pb-16">
                {/* Sidebar - hidden on mobile once a chat is open */}
                <div
                    className={`
                        ${showSidebar ? "flex" : "hidden"}
                        md:flex
                        w-full md:w-96
                        flex-shrink-0
                        border-r border-zinc-200
                        overflow-hidden
                    `}
                >
                    <Sidebar
                        contacts={contacts}
                        activeContactId={activeContactId}
                        onSelectContact={(contact) => {
                            selectContact(contact);
                            if (window.innerWidth < 768) setShowSidebar(false);
                        }}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                </div>

                {/* Chat Area - ChatWindow owns its own empty state */}
                <div className={`${showSidebar ? "hidden md:flex" : "flex"} flex-1 flex-col min-h-0`}>
                    <ChatWindow
                        activeContact={activeContact}
                        onSendMessage={sendMessage}
                        onBack={() => setShowSidebar(true)}
                    />
                </div>
            </div>

            <BottomBar />
        </div>
    );
};

export default Home;
