import { useCallback, useEffect, useState } from 'react';
import { Alert, Card } from 'react-bootstrap';
import accountApi from '../../api/accountApi';
import AccountFilters from '../../components/AccountFilters/AccountFilters';
import AccountFormModal from '../../components/AccountFormModal/AccountFormModal';
import AccountManagementHeader from '../../components/AccountManagementHeader/AccountManagementHeader';
import AccountPagination from '../../components/AccountPagination/AccountPagination';
import AccountStats from '../../components/AccountStats/AccountStats';
import AccountTable from '../../components/AccountTable/AccountTable';
import DeleteAccountModal from '../../components/DeleteAccountModal/DeleteAccountModal';
import styles from './AccountManagementPage.module.css';

const initialStats = { total: 0, admins: 0, customers: 0, active: 0, blocked: 0 };

const getCurrentUserId = () => {
    try {
        return JSON.parse(localStorage.getItem('user'))?.id;
    } catch {
        return null;
    }
};

const AccountManagementPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [stats, setStats] = useState(initialStats);
    const [pagination, setPagination] = useState({ page: 1, pageSize: 8, total: 0, totalPages: 1 });
    const [filters, setFilters] = useState({ search: '', role: 'all', status: 'all', page: 1 });
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formAccount, setFormAccount] = useState(undefined);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [currentUserId] = useState(getCurrentUserId);

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
            const response = await accountApi.updateAccount(account.id, {
                fullName: account.fullName,
                email: account.email,
                role: account.role,
                status: account.status === 'active' ? 'blocked' : 'active',
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

    const deleting = Boolean(accountToDelete && actionLoadingId === accountToDelete.id);

    return (
        <section className={styles.page}>
            <AccountManagementHeader onAddAccount={() => setFormAccount(null)} />
            <AccountStats stats={stats} />

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Card className={styles.panel}>
                <AccountFilters
                    filters={filters}
                    loading={loading}
                    onFilterChange={updateFilter}
                    onRefresh={() => void loadAccounts()}
                />
                <AccountTable
                    accounts={accounts}
                    actionLoadingId={actionLoadingId}
                    currentUserId={currentUserId}
                    loading={loading}
                    onDelete={setAccountToDelete}
                    onEdit={setFormAccount}
                    onToggleStatus={(account) => void handleToggleStatus(account)}
                />
                <AccountPagination
                    count={accounts.length}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={changePage}
                />
            </Card>

            {formAccount !== undefined && (
                <AccountFormModal
                    account={formAccount}
                    onClose={() => setFormAccount(undefined)}
                    onSaved={handleSaved}
                />
            )}

            <DeleteAccountModal
                account={accountToDelete}
                deleting={deleting}
                onClose={() => {
                    if (!deleting) setAccountToDelete(null);
                }}
                onConfirm={() => void handleDelete()}
            />
        </section>
    );
};

export default AccountManagementPage;
