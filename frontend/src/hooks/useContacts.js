import { useMemo, useState } from 'react';

const useContacts = (contacts) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) return contacts;
        return contacts.filter((contact) =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [contacts, searchQuery]);

    return {
        searchQuery,
        setSearchQuery,
        filteredContacts,
    };
};

export default useContacts;