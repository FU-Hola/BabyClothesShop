import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Trash2, UserCheck, UsersRound, UserX } from 'lucide-react';
import accountApi from '../../api/accountApi';
import AccountList from '../../components/AccountManagement/AccountList';
import { AccountDeleteModal, AccountDetailModal } from '../../components/AccountManagement/AccountModals';
import AccountSummary from '../../components/AccountManagement/AccountSummary';
import StaffFormModal from '../../components/AccountManagement/StaffFormModal';
import { formatAccountDate, formatAccountDateTime, formatGender } from '../../utils/accountFormatters';
import styles from './AccountManagementPage.module.css';

const initialStats = { total: 0, active: 0, blocked: 0, deleted: 0 };

const createStatItems = (totalLabel) => [
    { key: 'total', label: totalLabel, icon: UsersRound, tone: 'blue' },
    { key: 'active', label: 'Đang hoạt động', icon: UserCheck, tone: 'green' },
    { key: 'blocked', label: 'Đã khóa', icon: UserX, tone: 'orange' },
    { key: 'deleted', label: 'Đã xóa mềm', icon: Trash2, tone: 'purple' },
];

const accountConfigs = {
    staff: {
        accountType: 'staff',
        section: 'Nhân viên',
        title: 'Quản lý nhân viên',
        description: 'Quản lý hồ sơ, trạng thái truy cập và vòng đời tài khoản nhân viên.',
        singularLabel: 'Nhân viên',
        itemLabel: 'nhân viên',
        canCreate: true,
        canEdit: true,
        searchPlaceholder: 'Tìm tên, email, mã hoặc chức danh...',
        statItems: createStatItems('Tổng nhân viên'),
        getDetailFields: (account) => [
            { label: 'Email', value: account.email },
            { label: 'Số điện thoại', value: account.phone },
            { label: 'Mã nhân viên', value: account.employeeCode },
            { label: 'Chức danh', value: account.position },
            { label: 'Ngày tạo', value: formatAccountDateTime(account.createdAt) },
            { label: 'Cập nhật gần nhất', value: formatAccountDateTime(account.updatedAt) },
            { label: 'Đăng nhập gần nhất', value: formatAccountDateTime(account.lastLoginAt) },
            { label: 'Ngày xóa mềm', value: account.deletedAt ? formatAccountDateTime(account.deletedAt) : 'Chưa xóa' },
        ],
    },
    customer: {
        accountType: 'customer',
        section: 'Khách hàng',
        title: 'Quản lý khách hàng',
        description: 'Theo dõi và kiểm soát quyền truy cập; thông tin cá nhân chỉ được xem.',
        singularLabel: 'Khách hàng',
        itemLabel: 'khách hàng',
        canCreate: false,
        canEdit: false,
        searchPlaceholder: 'Tìm tên, email, điện thoại hoặc địa chỉ...',
        statItems: createStatItems('Tổng khách hàng'),
        getDetailFields: (account) => [
            { label: 'Email', value: account.email },
            { label: 'Số điện thoại', value: account.phone },
            { label: 'Ngày sinh', value: account.dateOfBirth ? formatAccountDate(account.dateOfBirth) : 'Chưa cập nhật' },
            { label: 'Giới tính', value: formatGender(account.gender) },
            { label: 'Địa chỉ', value: account.address },
            { label: 'Ngày đăng ký', value: formatAccountDateTime(account.createdAt) },
            { label: 'Đăng nhập gần nhất', value: formatAccountDateTime(account.lastLoginAt) },
            { label: 'Ngày xóa mềm', value: account.deletedAt ? formatAccountDateTime(account.deletedAt) : 'Chưa xóa' },
        ],
    },
};

const AccountManagementPage = ({ accountType }) => {
    const config = accountConfigs[accountType];
    const [accounts, setAccounts] = useState([]);
    const [stats, setStats] = useState(initialStats);
    const [pagination, setPagination] = useState({ page: 1, pageSize: 8, total: 0, totalPages: 1 });
    const [filters, setFilters] = useState({ search: '', status: 'all', page: 1 });
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formAccount, setFormAccount] = useState(undefined);
    const [detailAccount, setDetailAccount] = useState(null);
    const [accountToDelete, setAccountToDelete] = useState(null);

    const loadAccounts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await accountApi.getAccounts(accountType, { ...filters, pageSize: 8 });
            setAccounts(response.items);
            setStats(response.stats);
            setPagination(response.pagination);
        } catch (requestError) {
            setError(requestError.response?.data?.message || `Không thể tải danh sách ${config.itemLabel}.`);
        } finally {
            setLoading(false);
        }
    }, [accountType, config.itemLabel, filters]);

    useEffect(() => {
        let ignore = false;
        accountApi.getAccounts(accountType, { ...filters, pageSize: 8 })
            .then((response) => {
                if (ignore) return;
                setAccounts(response.items);
                setStats(response.stats);
                setPagination(response.pagination);
            })
            .catch((requestError) => {
                if (!ignore) setError(requestError.response?.data?.message || `Không thể tải danh sách ${config.itemLabel}.`);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [accountType, config.itemLabel, filters]);

    const updateFilter = (name, value) => {
        setLoading(true);
        setFilters((current) => ({ ...current, [name]: value, page: 1 }));
    };

    const changePage = (page) => {
        setLoading(true);
        setFilters((current) => ({ ...current, page }));
    };

    const runAccountAction = async (account, request) => {
        setActionLoadingId(account.id);
        setError('');
        setSuccess('');
        try {
            const response = await request();
            setSuccess(response.message);
            await loadAccounts();
            return true;
        } catch (requestError) {
            setError(requestError.response?.data?.message || `Không thể cập nhật ${config.singularLabel.toLowerCase()}.`);
            return false;
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async () => {
        if (!accountToDelete) return;
        const deleted = await runAccountAction(
            accountToDelete,
            () => accountApi.softDelete(accountType, accountToDelete.id)
        );
        if (deleted) setAccountToDelete(null);
    };

    return (
        <section className={styles.page}>
            <AccountSummary config={config} stats={stats} onAdd={() => setFormAccount(null)} />
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <AccountList
                key={accountType}
                accounts={accounts}
                actionLoadingId={actionLoadingId}
                config={config}
                filters={filters}
                loading={loading}
                pagination={pagination}
                onDelete={setAccountToDelete}
                onEdit={setFormAccount}
                onFilterChange={updateFilter}
                onPageChange={changePage}
                onRefresh={() => void loadAccounts()}
                onRestore={(account) => void runAccountAction(account, () => accountApi.restore(accountType, account.id))}
                onToggleStatus={(account) => void runAccountAction(account, () => accountApi.updateStatus(accountType, account.id, account.status === 'active' ? 'blocked' : 'active'))}
                onView={setDetailAccount}
            />

            {config.canCreate && formAccount !== undefined && (
                <StaffFormModal
                    staff={formAccount}
                    onClose={() => setFormAccount(undefined)}
                    onSaved={(message) => {
                        setFormAccount(undefined);
                        setSuccess(message);
                        void loadAccounts();
                    }}
                />
            )}
            <AccountDetailModal account={detailAccount} fields={detailAccount ? config.getDetailFields(detailAccount) : []} title={`Chi tiết ${config.singularLabel.toLowerCase()}`} onClose={() => setDetailAccount(null)} />
            <AccountDeleteModal account={accountToDelete} deleting={accountToDelete?.id === actionLoadingId} entityLabel={config.singularLabel.toLowerCase()} onClose={() => { if (!actionLoadingId) setAccountToDelete(null); }} onConfirm={() => void handleDelete()} />
        </section>
    );
};

export default AccountManagementPage;
