import { Badge, Button, Spinner } from 'react-bootstrap';
import { LockKeyhole, Pencil, Trash2, UnlockKeyhole } from 'lucide-react';
import { formatAccountDate, getAccountInitials } from '../../utils/accountFormatters';
import styles from './AccountTableRow.module.css';

const AccountTableRow = ({
    account,
    actionLoading,
    currentAccount,
    onDelete,
    onEdit,
    onToggleStatus,
}) => {
    const isActive = account.status === 'active';
    const toggleLabel = isActive ? 'Khóa' : 'Mở khóa';
    const disabledTitle = currentAccount ? `Không thể ${toggleLabel.toLowerCase()} tài khoản đang dùng` : toggleLabel;

    return (
        <tr>
            <td>
                <div className={styles.identity}>
                    <span className={styles.avatar}>{getAccountInitials(account.fullName)}</span>
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
                <span className={`${styles.status} ${isActive ? styles.activeStatus : styles.blockedStatus}`}>
                    {isActive ? 'Hoạt động' : 'Đã khóa'}
                </span>
            </td>
            <td className={styles.date}>{formatAccountDate(account.createdAt)}</td>
            <td>
                <div className="d-flex justify-content-end gap-1">
                    <Button
                        variant="light"
                        className={styles.actionButton}
                        onClick={() => onEdit(account)}
                        aria-label={`Sửa ${account.fullName}`}
                        title="Chỉnh sửa"
                    >
                        <Pencil size={16} aria-hidden="true" />
                    </Button>
                    <Button
                        variant="light"
                        className={styles.actionButton}
                        onClick={() => onToggleStatus(account)}
                        disabled={currentAccount || actionLoading}
                        aria-label={`${toggleLabel} ${account.fullName}`}
                        title={disabledTitle}
                    >
                        {actionLoading && <Spinner animation="border" size="sm" />}
                        {!actionLoading && isActive && <LockKeyhole size={16} aria-hidden="true" />}
                        {!actionLoading && !isActive && <UnlockKeyhole size={16} aria-hidden="true" />}
                    </Button>
                    <Button
                        variant="light"
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => onDelete(account)}
                        disabled={currentAccount || actionLoading}
                        aria-label={`Xóa ${account.fullName}`}
                        title={currentAccount ? 'Không thể xóa tài khoản đang dùng' : 'Xóa'}
                    >
                        <Trash2 size={16} aria-hidden="true" />
                    </Button>
                </div>
            </td>
        </tr>
    );
};

export default AccountTableRow;
