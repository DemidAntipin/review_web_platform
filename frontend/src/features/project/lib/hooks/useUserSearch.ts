import { useState, useEffect } from 'react';
import { searchUsers, UserSuggestion } from '../../api/member.api';

export const useUserSearch = (isEdit: boolean) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isEdit || searchTerm.length < 2) {
            setSuggestions([]);
            return;
        }

        const handler = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await searchUsers(searchTerm);
                setSuggestions(results);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, isEdit]);

    return { searchTerm, setSearchTerm, suggestions, setSuggestions, isLoading };
};