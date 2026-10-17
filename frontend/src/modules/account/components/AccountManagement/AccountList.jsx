import { useState } from 'react';
import { Badge, Button, ButtonGroup, Card, Col, Form, InputGroup, Row, Spinner, Table } from 'react-bootstrap';
import { Eye, LockKeyhole, Pencil, RefreshCw, RotateCcw, Search, Trash2, UnlockKeyhole } from 'lucide-react';
import { formatAccountDate, getAccountInitials } from '../../utils/accountFormatters';
import styles from './AccountList.module.css';

const AccountIdentity = ({ account }) => (
    <div className={styles.identity}>
        <span className={styles.avatar}>{getAccountInitials(account.fullName)}</span>
        <span>
            <strong>{account.fullName}</strong>
            <small>{account.email}</small>
        </span>
    </div>
);

const AccountStatus = ({ account }) => {
    if (account.deletedAt) return <Badge className={styles.deleted}>Đã xóa</Badge>;
    return account.status === 'active'
        ? <Badge className={styles.active}>Hoạt động</Badge>
        : <Badge className={styles.blocked}>Đã khóa</Badge>;
};

const AccountActions = ({ account, allowEdit, loading, onDelete, onEdit, onRestore, onToggleStatus, onView }) => {
    if (account.deletedAt) {
        return (
            <div className={styles.actions}>
                <Button variant="light" onClick={() => onView(account)} aria-label={`Xem ${account.fullName}`} title="Xem chi tiết">
                    <Eye size={16} aria-hidden="true" />
                </Button>
                <Button variant="light" className={styles.restoreButton} onClick={() => onRestore(account)} disabled={loading} aria-label={`Khôi phục ${account.fullName}`} title="Khôi phục">
                    {loading ? <Spinner animation="border" size="sm" /> : <RotateCcw size={16} aria-hidden="true" />}
                </Button>
            </div>
        );
    }

    const active = account.status === 'active';
    return (
        <div className={styles.actions}>
            <Button variant="light" onClick={() => onView(account)} aria-label={`Xem ${account.fullName}`} title="Xem chi tiết">
                <Eye size={16} aria-hidden="true" />
            </Button>
            {allowEdit && (
                <Button variant="light" onClick={() => onEdit(account)} aria-label={`Sửa ${account.fullName}`} title="Chỉnh sửa">
                    <Pencil size={16} aria-hidden="true" />
                </Button>
            )}
            <Button variant="light" onClick={() => onToggleStatus(account)} disabled={loading} aria-label={`${active ? 'Khóa' : 'Mở khóa'} ${account.fullName}`} title={active ? 'Khóa' : 'Mở khóa'}>
                {loading && <Spinner animation="border" size="sm" />}
                {!loading && active && <LockKeyhole size={16} aria-hidden="true" />}
                {!loading && !active && <UnlockKeyhole size={16} aria-hidden="true" />}
            </Button>
            <Button variant="light" className={styles.deleteButton} onClick={() => onDelete(account)} disabled={loading} aria-label={`Xóa mềm ${account.fullName}`} title="Xóa mềm">
                <Trash2 size={16} aria-hidden="true" />
            </Button>
        </div>
    );
};

const AccountList = ({
    accounts,
    actionLoadingId,
    config,
    filters,
    loading,
    pagination,
    onDelete,
    onEdit,
    onFilterChange,
    onPageChange,
    onRefresh,
    onRestore,
    onToggleStatus,
    onView,
}) => {
    const [searchValue, setSearchValue] = useState(filters.search);
    const staffView = config.accountType === 'staff';

    const handleSearch = (event) => {
        event.preventDefault();
        onFilterChange('search', searchValue.trim());
    };

    return (
        <Card className={styles.panel}>
            <Card.Header className={styles.toolbar}>
                <Form role="search" onSubmit={handleSearch}>
                    <Row className="g-2">
                        <Col xs={12} lg>
                            <InputGroup className={styles.control}>
                                <InputGroup.Text><Search size={18} aria-hidden="true" /></InputGroup.Text>
                                <Form.Control type="search" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder={config.searchPlaceholder} aria-label="Tìm tài khoản" />
                            </InputGroup>
                        </Col>
                        <Col xs={12} sm={6} lg="auto">
                            <Form.Select className={styles.select} value={filters.status} onChange={(event) => onFilterChange('status', event.target.value)} aria-label="Lọc theo trạng thái">
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="blocked">Đã khóa</option>
                                <option value="deleted">Đã xóa</option>
                            </Form.Select>
                        </Col>
                        <Col xs="auto">
                            <Button type="button" variant="light" className={styles.refreshButton} onClick={onRefresh} disabled={loading} aria-label="Tải lại" title="Tải lại">
                                <RefreshCw size={18} aria-hidden="true" />
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Header>

            <Card.Body className={styles.tableBody}>
                <Table responsive hover className={styles.table}>
                    <thead>
                        <tr>
                            <th>{config.singularLabel}</th>
                            {staffView && <th>Mã nhân viên</th>}
                            <th>{staffView ? 'Chức danh' : 'Điện thoại'}</th>
                            <th>Trạng thái</th>
                            <th>{staffView ? 'Ngày tạo' : 'Ngày đăng ký'}</th>
                            <th className="text-end">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && accounts.map((account) => (
                            <tr key={account.id}>
                                <td><AccountIdentity account={account} /></td>
                                {staffView && <td className="text-nowrap">{account.employeeCode}</td>}
                                <td>{staffView ? account.position : account.phone || 'Chưa cập nhật'}</td>
                                <td><AccountStatus account={account} /></td>
                                <td className="text-nowrap">{formatAccountDate(account.createdAt)}</td>
                                <td>
                                    <AccountActions
                                        account={account}
                                        allowEdit={config.canEdit}
                                        loading={actionLoadingId === account.id}
                                        onDelete={onDelete}
                                        onEdit={onEdit}
                                        onRestore={onRestore}
                                        onToggleStatus={onToggleStatus}
                                        onView={onView}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {loading && <div className={styles.state} role="status"><Spinner animation="border" size="sm" /><span>Đang tải danh sách...</span></div>}
                {!loading && accounts.length === 0 && <div className={styles.state}>Không tìm thấy {config.itemLabel} phù hợp.</div>}
            </Card.Body>

            <Card.Footer className={`${styles.footer} d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3`}>
                <span>Hiển thị {accounts.length} / {pagination.total} {config.itemLabel}</span>
                <ButtonGroup aria-label={`Phân trang ${config.itemLabel}`}>
                    <Button variant="light" disabled={pagination.page <= 1 || loading} onClick={() => onPageChange(pagination.page - 1)}>Trước</Button>
                    <Button variant="light" disabled className={styles.pageIndicator}>Trang {pagination.page} / {pagination.totalPages}</Button>
                    <Button variant="light" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => onPageChange(pagination.page + 1)}>Sau</Button>
                </ButtonGroup>
            </Card.Footer>
        </Card>
    );
};

export default AccountList;
