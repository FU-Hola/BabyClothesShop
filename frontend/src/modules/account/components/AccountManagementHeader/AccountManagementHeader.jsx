import { Breadcrumb, Button } from 'react-bootstrap';
import { Plus } from 'lucide-react';
import styles from './AccountManagementHeader.module.css';

const AccountManagementHeader = ({ onAddAccount }) => (
    <header className="d-flex flex-column flex-sm-row align-items-sm-end justify-content-between gap-3 mb-4">
        <div>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item>Quản trị</Breadcrumb.Item>
                <Breadcrumb.Item active>Tài khoản</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className={styles.title}>Quản lý tài khoản</h1>
            <p className={styles.description}>
                Theo dõi người dùng, phân quyền và kiểm soát trạng thái truy cập.
            </p>
        </div>
        <Button className={`${styles.addButton} d-inline-flex align-items-center justify-content-center gap-2`} onClick={onAddAccount}>
            <Plus size={18} aria-hidden="true" />
            Thêm tài khoản
        </Button>
    </header>
);

export default AccountManagementHeader;
