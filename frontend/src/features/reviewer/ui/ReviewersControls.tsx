import { useReviewerStore } from "@/entities/reviewer/model/reviewer.store";
import { SearchInput } from "@/shared/ui/search_input/SearchInput";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { ReviewerFilters } from "./ReviewerFilters/ReviewerFilters";
import { PRIORITY_MAP, TYPE_MAP } from "@/entities/task/model/types";
import { COMMENT_PRIORITY_MAP, COMMENT_TYPE_MAP } from "@/entities/reviewer/model/types";

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
        return {
            types: Object.values(COMMENT_TYPE_MAP),
            priorities: Object.values(COMMENT_PRIORITY_MAP),
            reviewers: store.reviewers
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