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

export default function CatalogPagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <Pagination size="sm" className="mb-0 flex-shrink-0">
            <Pagination.Prev disabled={currentPage === 1}
                             onClick={() => onPageChange(currentPage - 1)}>
                Trước
            </Pagination.Prev>
            {getPageNumbers(currentPage, totalPages).map((page) => (
                typeof page === "number" ? (
                    <Pagination.Item key={page} active={page === currentPage}
                                     onClick={() => onPageChange(page)}>
                        {page}
                    </Pagination.Item>
                ) : <Pagination.Ellipsis key={page} disabled />
            ))}
            <Pagination.Next disabled={currentPage === totalPages}
                             onClick={() => onPageChange(currentPage + 1)}>
                Sau
            </Pagination.Next>
        </Pagination>
    );
}
