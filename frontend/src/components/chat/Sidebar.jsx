import { LogOut, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import IconButton from '../ui/IconButton';
import SearchBar from '../ui/SearchBar';
import ChatItem from './ChatItem';

const Sidebar = ({ contacts, activeContactId, onSelectContact, searchQuery, setSearchQuery }) => {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col h-full bg-white border-r border-zinc-200">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                    <Avatar src={user?.avatar} name={user?.name || 'User'} size="md" status="online" />
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-900 truncate">{user?.name || 'User'}</h3>
                        <p className="text-xs text-zinc-500 truncate">{user?.email || 'No email'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <IconButton title="New chat"><MessageSquarePlus size={20} /></IconButton>
                    <IconButton onClick={logout} title="Logout" className="hover:text-red-600">
                        <LogOut size={20} />
                    </IconButton>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-3 py-3 border-b border-zinc-200 bg-zinc-50">
                <SearchBar 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search users..."
                />
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
                {contacts.length > 0 ? (
                    <div className="space-y-1 p-2">
                        {contacts.map((contact) => (
                            <ChatItem
                                key={contact.id}
                                contact={contact}
                                isActive={contact.id === activeContactId}
                                onClick={() => onSelectContact(contact.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-sm text-zinc-500 mb-2">No users found</p>
                        <p className="text-xs text-zinc-400">Try a different search or check back later</p>
                    </div>
                )}
            </div>

            {/* User Count */}
            <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-500 text-center">
                {contacts.length === 1 ? '1 user' : `${contacts.length} users`}
            </div>
        </div>
    );
};

export default Sidebar;