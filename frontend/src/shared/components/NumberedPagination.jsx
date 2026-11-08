import { Pagination } from "react-bootstrap";

function getPageNumbers(currentPage, totalPages) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const startPage = Math.min(Math.max(currentPage - 1, 2), totalPages - 3);
    const endPage = startPage + 2;
    const pages = [1];

    if (startPage > 2) pages.push("start-gap");
    for (let page = startPage; page <= endPage; page++) {
        pages.push(page);
    }
    if (endPage < totalPages - 1) pages.push("end-gap");
    pages.push(totalPages);

    return pages;
}

export default function NumberedPagination({ currentPage, totalPages, onPageChange, busy = false }) {
    if (totalPages <= 1) return null;

    return (
        <Pagination size="sm" className="mb-0 flex-shrink-0" aria-label="Chọn trang">
            <Pagination.Prev disabled={busy || currentPage <= 1}
                             onClick={() => onPageChange(currentPage - 1)}>
                Trước
            </Pagination.Prev>
            {getPageNumbers(currentPage, totalPages).map((page) => (
                typeof page === "number" ? (
                    <Pagination.Item key={page} active={page === currentPage}
                                     disabled={busy}
                                     aria-label={`Trang ${page}`}
                                     aria-current={page === currentPage ? "page" : undefined}
                                     onClick={() => onPageChange(page)}>
                        {page}
                    </Pagination.Item>
                ) : <Pagination.Ellipsis key={page} disabled />
            ))}
            <Pagination.Next disabled={busy || currentPage >= totalPages}
                             onClick={() => onPageChange(currentPage + 1)}>
                Sau
            </Pagination.Next>
        </Pagination>
    );
}
