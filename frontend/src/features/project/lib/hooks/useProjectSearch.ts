import { useProjectStore } from "@/entities/project/model/project.store";
import { useEffect, useState } from "react";
import { ProjectSuggestion } from "../../api/member.api";

export const useProjectSearch = (isEdit: boolean) => {
    const { projects } = useProjectStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);

    useEffect(() => {
        if (isEdit || searchTerm.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const handler = setTimeout(() => {
            const lowerTerm = searchTerm.toLowerCase();
            
            const filtered = projects.filter(p => 
                p.title.toLowerCase().includes(lowerTerm)
            );

            setSuggestions(filtered);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, projects, isEdit]);

    return { 
        searchTerm, 
        setSearchTerm, 
        suggestions 
    };
};