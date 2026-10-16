import { Card, Spinner, Table } from 'react-bootstrap';
import AccountTableRow from '../AccountTableRow/AccountTableRow';
import styles from './AccountTable.module.css';

const AccountTable = ({
    accounts,
    actionLoadingId,
    currentUserId,
    loading,
    onDelete,
    onEdit,
    onToggleStatus,
}) => (
    <Card.Body className={styles.body}>
        <Table responsive hover className={styles.table}>
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
                {!loading && accounts.map((account) => (
                    <AccountTableRow
                        key={account.id}
                        account={account}
                        actionLoading={actionLoadingId === account.id}
                        currentAccount={String(account.id) === String(currentUserId)}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onToggleStatus={onToggleStatus}
                    />
                ))}
            </tbody>
        </Table>

        {loading && (
            <div className={styles.state} role="status">
                <Spinner animation="border" size="sm" />
                <span>Đang tải danh sách tài khoản...</span>
            </div>
        )}
        {!loading && accounts.length === 0 && (
            <div className={styles.state}>Không tìm thấy tài khoản phù hợp.</div>
        )}
    </Card.Body>
);

export default AccountTable;
