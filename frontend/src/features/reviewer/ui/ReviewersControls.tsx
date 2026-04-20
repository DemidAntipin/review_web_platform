import { useReviewerStore } from "@/entities/reviewer/model/reviewer.store";
import { SearchInput } from "@/shared/ui/search_input/SearchInput";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { ReviewerFilters } from "./ReviewerFilters/ReviewerFilters";

export const ReviewerControls = () => {
    const store = useReviewerStore(useShallow((state) => ({
        reviewers: state.reviewers,
        searchQuery: state.searchQuery,
        setSearchQuery: state.setSearchQuery,
        selectedTypes: state.selectedTypes,
        selectedPriorities: state.selectedPriorities,
        toggleType: state.toggleType,
        togglePriority: state.togglePriority,
        resetFilters: state.resetFilters,
        showHidden: state.showHidden,
        setShowHidden: state.setShowHidden,
        selectedReviewerIds: state.selectedReviewerIds,
        toggleReviewerSelection: state.toggleReviewerSelection
    })));

    const filterOptions = useMemo(() => {
        const types = new Set<string>();
        const priorities = new Set<string>();
        store.reviewers.forEach(r => {
            r.comments.forEach(c => {
                if (c.type) types.add(c.type);
                if (c.priority) priorities.add(c.priority);
            });
        });
        return {
            types: Array.from(types).sort(),
            priorities: Array.from(priorities).sort(),
            reviewers: Array.from(store.reviewers).sort()
        };
    }, [store.reviewers]);

    return (
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <SearchInput 
                value={store.searchQuery}
                onChange={store.setSearchQuery} 
                placeholder="Поиск по замечаниям..."
            />
            <ReviewerFilters
                showHidden={store.showHidden}
                onToggleHidden={() => store.setShowHidden(!store.showHidden)}
                selectedTypes={store.selectedTypes}
                selectedPriorities={store.selectedPriorities}
                onTypeChange={store.toggleType}
                onPriorityChange={store.togglePriority}
                onReset={store.resetFilters} 
                types={filterOptions.types} 
                priorities={filterOptions.priorities} 
                reviewersList={filterOptions.reviewers}
                selectedReviewerIds={store.selectedReviewerIds}
                onReviewerChange={store.toggleReviewerSelection}
            />
        </div>
    );
};