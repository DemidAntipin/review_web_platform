import { useShallow } from "zustand/react/shallow";
import { useKanbanStore } from "../model/kanban.store";
import { TaskFilters } from "./TaskFilters/TaskFilters";
import { SearchInput } from "@/shared/ui/search_input/SearchInput";
import { useReviewerStore } from "@/entities/reviewer/model/reviewer.store";
import { useMemo } from "react";

export const KanbanControls = () => {
    const kanbanData = useKanbanStore(useShallow((state) => ({
        tasks: state.tasks,
        searchQuery: state.searchQuery,
        setSearchQuery: state.setSearchQuery,
        selectedTypes: state.selectedTypes,
        selectedPriorities: state.selectedPriorities,
        selectedReviewers: state.selectedReviewers,
        selectedComments: state.selectedComments,
        toggleType: state.toggleType,
        togglePriority: state.togglePriority,
        toggleReviewer: state.toggleReviewer,
        toggleComment: state.toggleComment,
        resetFilters: state.resetFilters,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
        setSort: state.setSort,
        showHidden: state.showHidden,
        setShowHidden: state.setShowHidden
    })));

    const reviewersList = useReviewerStore((state) => state.reviewers);

    const filterOptions = useMemo(() => {
        const types = new Set<string>();
        const priorities = new Set<string>();
        const taskRelationMap = new Map<number, Set<number>>();

        for (const t of kanbanData.tasks) {
            if (t.type) types.add(t.type);
            if (t.priority) priorities.add(t.priority);
            
            if (t.reviewer_id) {
                if (!taskRelationMap.has(t.reviewer_id)) {
                    taskRelationMap.set(t.reviewer_id, new Set());
                }
                if (t.comment_id) {
                    taskRelationMap.get(t.reviewer_id)?.add(t.comment_id);
                }
            }
        }

        const reviewersLookup = new Map(reviewersList.map(r => [r.id, r]));

        const reviewersData = Array.from(taskRelationMap.entries()).map(([rId, cIds]) => {
            const reviewerInfo = reviewersLookup.get(rId);
            
            return {
                id: rId,
                name: reviewerInfo?.name || `Рецензент ${rId}`,
                comments: Array.from(cIds).map(cId => {
                    const commentInfo = reviewerInfo?.comments.find(c => c.id === cId);
                    return {
                        id: cId,
                        text: commentInfo?.content_md 
                            ? (commentInfo.content_md.length > 40 
                                ? commentInfo.content_md.substring(0, 40) + "..." 
                                : commentInfo.content_md)
                            : `Замечание ${cId}`
                    };
                }).sort((a, b) => a.id - b.id)
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        return {
            types: Array.from(types).sort(),
            priorities: Array.from(priorities),
            reviewersData
        };
    }, [kanbanData.tasks, reviewersList]);

    return (
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <SearchInput 
                value={kanbanData.searchQuery}
                onChange={kanbanData.setSearchQuery} 
                placeholder="Поиск задач..."
            />
            <TaskFilters 
                {...filterOptions}
                selectedTypes={kanbanData.selectedTypes}
                selectedPriorities={kanbanData.selectedPriorities}
                selectedReviewers={kanbanData.selectedReviewers}
                selectedComments={kanbanData.selectedComments}
                onTypeChange={kanbanData.toggleType}
                onPriorityChange={kanbanData.togglePriority}
                onReviewerChange={kanbanData.toggleReviewer}
                onCommentChange={kanbanData.toggleComment}
                sortField={kanbanData.sortField}
                sortDirection={kanbanData.sortDirection}
                onSortChange={kanbanData.setSort}
                onReset={kanbanData.resetFilters}
                onToggleHidden={() => kanbanData.setShowHidden(!kanbanData.showHidden)}
                showHidden={kanbanData.showHidden}
            />
        </div>
    );
};