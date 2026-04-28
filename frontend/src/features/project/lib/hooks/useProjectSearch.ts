import { useProjectStore } from "@/entities/project/model/project.store";
import { useMemo, useState } from "react";

export const useProjectSearch = () => {
    const { projects } = useProjectStore();
    const [searchTerm, setSearchTerm] = useState('');

    const suggestions = useMemo(() => {
        if (searchTerm.length < 1) return [];
        return projects.filter(p => 
            p.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, projects]);

    return { searchTerm, setSearchTerm, suggestions };
};