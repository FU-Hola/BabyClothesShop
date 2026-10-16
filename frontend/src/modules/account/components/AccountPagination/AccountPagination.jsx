import { Button, ButtonGroup, Card } from 'react-bootstrap';
import styles from './AccountPagination.module.css';

const AccountPagination = ({ count, loading, pagination, onPageChange }) => (
    <Card.Footer className={`${styles.footer} d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3`}>
        <span>Hiển thị {count} / {pagination.total} tài khoản</span>
        <div className="d-flex align-items-center gap-3">
            <ButtonGroup aria-label="Phân trang danh sách tài khoản">
                <Button
                    variant="light"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => onPageChange(pagination.page - 1)}
                >
                    Trước
                </Button>
                <Button variant="light" disabled className={styles.pageIndicator}>
                    Trang {pagination.page} / {pagination.totalPages}
                </Button>
                <Button
                    variant="light"
                    disabled={pagination.page >= pagination.totalPages || loading}
                    onClick={() => onPageChange(pagination.page + 1)}
                >
                    Sau
                </Button>
            </ButtonGroup>
        </div>
    </Card.Footer>
);

export default AccountPagination;
