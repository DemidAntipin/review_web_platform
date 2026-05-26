import { useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import s from './LogsPage.module.scss';
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { useActivityLogStore } from "@/entities/logs/model/logs.store";
import { Loader } from "@/shared/ui/loader/Loader";
import { LogFilters } from "@/entities/logs/ui/LogFilters/LogFilters";
import { LogTable } from "@/entities/logs/ui/LogTable/LogTable";

export const LogsPage = () => {
    const { setPageTitle } = useOutletContext<any>();
    const [searchParams] = useSearchParams();
    const { isLoading, fetchLogs, page, getTotalPages, setPage, filters, sort } = useActivityLogStore();

    const totalPages = getTotalPages();

    useEffect(() => {
        setPageTitle("Журнал активности");
    }, [setPageTitle]);

    useEffect(() => {
        const urlPage = Number(searchParams.get('page')) || 1;

        if (urlPage !== page) {
            setPage(urlPage);
        }

        fetchLogs();
    }, [searchParams, filters, sort]);

    return (
        <div className={s.container}>
            <LogFilters 
                onSearch={(f) => useActivityLogStore.getState().setFilters(f)} 
                isLoading={isLoading} 
            />
            {isLoading ? (
                <Loader />
            ) : (
                <LogTable />
            )}

            <footer className={s.footer}>
                {totalPages > 1 && (
                    <Pagination total={totalPages} current={page} />
                )}
            </footer>
        </div>
    );
};