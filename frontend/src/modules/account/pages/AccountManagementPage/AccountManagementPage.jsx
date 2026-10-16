import { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import {
    LockKeyhole,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    Trash2,
    UnlockKeyhole,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';
import accountApi from '../../api/accountApi';
import AccountFormModal from '../../components/AccountFormModal/AccountFormModal';
import styles from './AccountManagementPage.module.css';

const initialStats = { total: 0, admins: 0, customers: 0, active: 0, blocked: 0 };

const getCurrentUserId = () => {
    try {
        return JSON.parse(localStorage.getItem('user'))?.id;
    } catch {
        return null;
    }
};

const formatDate = (value) =>
    new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(value));

const getInitials = (name) =>
    name
        .split(' ')
        .slice(-2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();

const AccountManagementPage = () => {
    const currentUserId = getCurrentUserId();
    const [accounts, setAccounts] = useState([]);
    const [stats, setStats] = useState(initialStats);
    const [pagination, setPagination] = useState({ page: 1, pageSize: 8, total: 0, totalPages: 1 });
    const [filters, setFilters] = useState({ search: '', role: 'all', status: 'all', page: 1 });
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formAccount, setFormAccount] = useState(undefined);
    const [accountToDelete, setAccountToDelete] = useState(null);

    const loadAccounts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await accountApi.getAccounts({ ...filters, pageSize: 8 });
            setAccounts(response.items);
            setStats(response.stats);
            setPagination(response.pagination);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Không thể tải danh sách tài khoản.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        let ignore = false;

        accountApi
            .getAccounts({ ...filters, pageSize: 8 })
            .then((response) => {
                if (ignore) return;
                setAccounts(response.items);
                setStats(response.stats);
                setPagination(response.pagination);
            })
            .catch((requestError) => {
                if (!ignore) {
                    setError(requestError.response?.data?.message || 'Không thể tải danh sách tài khoản.');
                }
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [filters]);

    const updateFilter = (name, value) => {
        setLoading(true);
        setFilters((current) => ({ ...current, [name]: value, page: 1 }));
    };

    const changePage = (page) => {
        setLoading(true);
        setFilters((current) => ({ ...current, page }));
    };

    const handleSearch = (event) => {
        event.preventDefault();
        updateFilter('search', searchValue.trim());
    };

    const handleSaved = (message) => {
        setFormAccount(undefined);
        setSuccess(message);
        void loadAccounts();
    };

    const handleToggleStatus = async (account) => {
        setActionLoadingId(account.id);
        setError('');
        setSuccess('');
        try {
            const nextStatus = account.status === 'active' ? 'blocked' : 'active';
            const response = await accountApi.updateAccount(account.id, {
                fullName: account.fullName,
                email: account.email,
                role: account.role,
                status: nextStatus,
            });
            setSuccess(response.message);
            await loadAccounts();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản.');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async () => {
        if (!accountToDelete) return;

        setActionLoadingId(accountToDelete.id);
        setError('');
        try {
            const response = await accountApi.deleteAccount(accountToDelete.id);
            setAccountToDelete(null);
            setSuccess(response.message);
            await loadAccounts();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Không thể xóa tài khoản.');
        } finally {
            setActionLoadingId(null);
        }
    };

    const statItems = [
        { label: 'Tổng tài khoản', value: stats.total, icon: Users, tone: 'blue' },
        { label: 'Quản trị viên', value: stats.admins, icon: ShieldCheck, tone: 'purple' },
        { label: 'Đang hoạt động', value: stats.active, icon: UserCheck, tone: 'green' },
        { label: 'Đã khóa', value: stats.blocked, icon: UserX, tone: 'orange' },
    ];

    return (
        <section className={styles.page}>
            <div className={styles.pageHeading}>
                <div>
                    <p className={styles.breadcrumb}>Quản trị / Tài khoản</p>
                    <h2>Quản lý tài khoản</h2>
                    <p>Theo dõi người dùng, phân quyền và kiểm soát trạng thái truy cập.</p>
                </div>
                <Button className={styles.addButton} onClick={() => setFormAccount(null)}>
                    <Plus size={18} aria-hidden="true" />
                    Thêm tài khoản
                </Button>
            </div>

            <div className={styles.statsGrid}>
                {statItems.map(({ label, value, icon: Icon, tone }) => (
                    <article className={styles.statCard} key={label}>
                        <span className={`${styles.statIcon} ${styles[tone]}`}>
                            <Icon size={21} aria-hidden="true" />
                        </span>
                        <span>
                            <small>{label}</small>
                            <strong>{value}</strong>
                        </span>
                    </article>
                ))}
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <div className={styles.panel}>
                <div className={styles.toolbar}>
                    <Form className={styles.searchForm} role="search" onSubmit={handleSearch}>
                        <Search size={18} aria-hidden="true" />
                        <Form.Control
                            type="search"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Tìm theo tên hoặc email..."
                            aria-label="Tìm tài khoản"
                        />
                    </Form>
                    <Form.Select
                        value={filters.role}
                        onChange={(event) => updateFilter('role', event.target.value)}
                        aria-label="Lọc theo vai trò"
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="admin">Quản trị viên</option>
                        <option value="customer">Khách hàng</option>
                    </Form.Select>
                    <Form.Select
                        value={filters.status}
                        onChange={(event) => updateFilter('status', event.target.value)}
                        aria-label="Lọc theo trạng thái"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="blocked">Đã khóa</option>
                    </Form.Select>
                    <Button variant="light" className={styles.refreshButton} onClick={() => void loadAccounts()} aria-label="Tải lại">
                        <RefreshCw size={18} aria-hidden="true" />
                    </Button>
                </div>

                <div className={styles.tableWrap}>
                    <Table responsive hover className={styles.accountTable}>
                        <thead>
                            <tr>
                                <th>Tài khoản</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th className="text-end">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && accounts.map((account) => {
                                const isCurrentAccount = String(account.id) === String(currentUserId);
                                const isActionLoading = actionLoadingId === account.id;
                                return (
                                    <tr key={account.id}>
                                        <td>
                                            <div className={styles.accountIdentity}>
                                                <span className={styles.accountAvatar}>{getInitials(account.fullName)}</span>
                                                <span>
                                                    <strong>{account.fullName}</strong>
                                                    <small>{account.email}</small>
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge className={account.role === 'admin' ? styles.adminBadge : styles.customerBadge}>
                                                {account.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <span className={`${styles.status} ${account.status === 'active' ? styles.activeStatus : styles.blockedStatus}`}>
                                                {account.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className={styles.dateCell}>{formatDate(account.createdAt)}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Button variant="light" onClick={() => setFormAccount(account)} aria-label={`Sửa ${account.fullName}`} title="Chỉnh sửa">
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    onClick={() => void handleToggleStatus(account)}
                                                    disabled={isCurrentAccount || isActionLoading}
                                                    aria-label={`${account.status === 'active' ? 'Khóa' : 'Mở khóa'} ${account.fullName}`}
                                                    title={isCurrentAccount ? 'Không thể khóa tài khoản đang dùng' : account.status === 'active' ? 'Khóa' : 'Mở khóa'}
                                                >
                                                    {isActionLoading ? <Spinner animation="border" size="sm" /> : account.status === 'active' ? <LockKeyhole size={16} /> : <UnlockKeyhole size={16} />}
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    className={styles.deleteButton}
                                                    onClick={() => setAccountToDelete(account)}
                                                    disabled={isCurrentAccount || isActionLoading}
                                                    aria-label={`Xóa ${account.fullName}`}
                                                    title={isCurrentAccount ? 'Không thể xóa tài khoản đang dùng' : 'Xóa'}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>

                    {loading && (
                        <div className={styles.stateMessage}>
                            <Spinner animation="border" size="sm" />
                            <span>Đang tải danh sách tài khoản...</span>
                        </div>
                    )}
                    {!loading && accounts.length === 0 && (
                        <div className={styles.stateMessage}>Không tìm thấy tài khoản phù hợp.</div>
                    )}
                </div>

                <div className={styles.paginationBar}>
                    <span>Hiển thị {accounts.length} / {pagination.total} tài khoản</span>
                    <div>
                        <Button
                            variant="light"
                            disabled={pagination.page <= 1 || loading}
                            onClick={() => changePage(pagination.page - 1)}
                        >
                            Trước
                        </Button>
                        <span>Trang {pagination.page} / {pagination.totalPages}</span>
                        <Button
                            variant="light"
                            disabled={pagination.page >= pagination.totalPages || loading}
                            onClick={() => changePage(pagination.page + 1)}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            </div>

            {formAccount !== undefined && (
                <AccountFormModal
                    account={formAccount}
                    onClose={() => setFormAccount(undefined)}
                    onSaved={handleSaved}
                />
            )}

            <Modal show={Boolean(accountToDelete)} onHide={() => setAccountToDelete(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xóa tài khoản</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn chắc chắn muốn xóa tài khoản <strong>{accountToDelete?.fullName}</strong>? Thao tác này không thể hoàn tác.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setAccountToDelete(null)}>Hủy</Button>
                    <Button variant="danger" onClick={() => void handleDelete()} disabled={Boolean(actionLoadingId)}>
                        {actionLoadingId && <Spinner animation="border" size="sm" className="me-2" />}
                        Xóa tài khoản
                    </Button>
                </Modal.Footer>
            </Modal>
        </section>
    );
};

export default AccountManagementPage;
