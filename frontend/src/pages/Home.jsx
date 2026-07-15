import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow';
import Sidebar from '../components/chat/Sidebar';
import BottomBar from '../components/layout/BottomBar';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';

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
        setSearchQuery
    } = useChat();

    // For mobile: track if sidebar is visible
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/auth');
        }
    }, [loading, navigate, user]);

    // Auto hide sidebar when a contact is selected on mobile
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
                {/* Sidebar - Hidden on mobile when chat is open */}
                <div className={`
                    ${showSidebar ? 'flex' : 'hidden'} 
                    md:flex 
                    w-full md:w-96 
                    flex-shrink-0 
                    border-r border-zinc-800
                    overflow-hidden
                `}>
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

                {/* Chat Area */}
                <div className="flex-1 flex flex-col min-h-0 relative pb-16">
                    {activeContact ? (
                        <ChatWindow 
                            activeContact={activeContact} 
                            onSendMessage={sendMessage}
                            onBack={() => setShowSidebar(true)}   // Back button on mobile
                        />
                    ) : (
                        // Empty state when no chat selected
                        <div className="flex-1 flex items-center justify-center bg-white px-4">
                            <div className="text-center">
                                <div className="mx-auto w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-6 border border-zinc-200">
                                    💬
                                </div>
                                <h3 className="text-xl font-medium text-zinc-600">Select a conversation</h3>
                                <p className="text-zinc-500 mt-2">Choose someone from the list to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <BottomBar />
        </div>
    );
};

export default Home;