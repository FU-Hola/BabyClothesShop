import { Badge, Button, Col, Modal, Row } from 'react-bootstrap';
import { ContactRound, Mail, UserRound } from 'lucide-react';
import { getAccountInitials } from '../../utils/accountFormatters';
import styles from './AccountDetailModal.module.css';

const roleLabels = {
    admin: 'Quản trị viên',
    staff: 'Nhân viên',
    customer: 'Khách hàng',
};

const AccountStatusBadge = ({ account }) => {
    if (account.deletedAt) return <Badge className={styles.deletedBadge}>Đã xóa</Badge>;
    return account.status === 'active'
        ? <Badge className={styles.activeBadge}>Đang hoạt động</Badge>
        : <Badge className={styles.blockedBadge}>Đã khóa</Badge>;
};

const AccountDetailModal = ({ account, fields, title, onClose }) => (
    <Modal
        show={Boolean(account)}
        onHide={onClose}
        centered
        scrollable
        size="lg"
        contentClassName={styles.modal}
    >
        <Modal.Header closeButton className={styles.header}>
            <span className={styles.headerIcon}>
                <UserRound size={23} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div>
                <Modal.Title>{title}</Modal.Title>
                <p>Xem thông tin hồ sơ và trạng thái tài khoản</p>
            </div>
        </Modal.Header>
        <Modal.Body className={styles.body}>
            {account && (
                <div className={styles.content}>
                    <section className={styles.profileCard} aria-label="Tổng quan tài khoản">
                        <div className={styles.profileIdentity}>
                            <span className={styles.profileAvatar}>
                                {getAccountInitials(account.fullName)}
                            </span>
                            <div className={styles.profileText}>
                                <h2>{account.fullName}</h2>
                                <span className={styles.email}>
                                    <Mail size={15} aria-hidden="true" />
                                    {account.email}
                                </span>
                            </div>
                        </div>
                        <div className={styles.badges}>
                            <Badge className={styles.roleBadge}>
                                {roleLabels[account.role] || account.role}
                            </Badge>
                            <AccountStatusBadge account={account} />
                        </div>
                    </section>

                    <section aria-labelledby="account-information-title">
                        <div className={styles.sectionHeading}>
                            <span className={styles.sectionIcon}>
                                <ContactRound size={18} aria-hidden="true" />
                            </span>
                            <div>
                                <h3 id="account-information-title">Thông tin chi tiết</h3>
                                <p>Các thông tin được ghi nhận trên hệ thống</p>
                            </div>
                        </div>
                        <dl className={styles.details}>
                            <Row className="g-3">
                                {fields.map(({ label, value }) => (
                                    <Col md={6} key={label}>
                                        <div className={styles.item}>
                                            <dt>{label}</dt>
                                            <dd>{value || 'Chưa cập nhật'}</dd>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </dl>
                    </section>
                </div>
            )}
        </Modal.Body>
        <Modal.Footer className={styles.footer}>
            <Button variant="outline-secondary" onClick={onClose}>Đóng</Button>
        </Modal.Footer>
    </Modal>
);

export default AccountDetailModal;
