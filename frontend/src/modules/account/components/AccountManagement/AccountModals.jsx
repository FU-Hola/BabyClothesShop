import { Alert, Badge, Button, Col, ListGroup, Modal, Row, Spinner } from 'react-bootstrap';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { getAccountInitials } from '../../utils/accountFormatters';
import styles from './AccountModals.module.css';

const StatusBadge = ({ account }) => {
    if (account.deletedAt) return <Badge bg="secondary">Đã xóa</Badge>;
    return <Badge bg={account.status === 'active' ? 'success' : 'warning'}>{account.status === 'active' ? 'Hoạt động' : 'Đã khóa'}</Badge>;
};

export const AccountDetailModal = ({ account, fields, title, onClose }) => (
    <Modal show={Boolean(account)} onHide={onClose} centered size="lg" contentClassName={styles.modal}>
        <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
            {account && (
                <>
                    <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                        <div className="d-flex align-items-center gap-3">
                            <span className={styles.avatar}>{getAccountInitials(account.fullName)}</span>
                            <span><strong className="d-block">{account.fullName}</strong><small className="text-muted">{account.email}</small></span>
                        </div>
                        <StatusBadge account={account} />
                    </div>
                    <ListGroup variant="flush" className={styles.details}>
                        <Row className="g-0">
                            {fields.map(({ label, value }) => (
                                <Col md={6} key={label}>
                                    <ListGroup.Item className={styles.item}><small>{label}</small><strong>{value || 'Chưa cập nhật'}</strong></ListGroup.Item>
                                </Col>
                            ))}
                        </Row>
                    </ListGroup>
                </>
            )}
        </Modal.Body>
    </Modal>
);

export const AccountDeleteModal = ({ account, deleting, entityLabel, onClose, onConfirm }) => (
    <Modal show={Boolean(account)} onHide={onClose} centered backdrop={deleting ? 'static' : true} keyboard={!deleting} dialogClassName={styles.deleteDialog} contentClassName={styles.modal}>
        <Modal.Header className={styles.deleteHeader} closeButton={!deleting}><Modal.Title className="visually-hidden">Xóa mềm {entityLabel}</Modal.Title></Modal.Header>
        <Modal.Body className={styles.deleteBody}>
            <span className={styles.deleteIcon}><Trash2 size={27} aria-hidden="true" /></span>
            <h2>Xóa mềm {entityLabel}?</h2>
            <p>Tài khoản sẽ bị vô hiệu hóa nhưng vẫn có thể khôi phục:</p>
            {account && (
                <div className="d-flex align-items-center gap-2 p-3 border rounded-3 bg-light text-start">
                    <span className={styles.avatar}>{getAccountInitials(account.fullName)}</span>
                    <span><strong className="d-block">{account.fullName}</strong><small className="text-muted">{account.email}</small></span>
                </div>
            )}
            <Alert variant="warning" className="d-flex align-items-center justify-content-center gap-2 mt-3 mb-0 py-2 small border-0">
                <AlertTriangle size={17} aria-hidden="true" />
                <span>Tài khoản không thể đăng nhập cho đến khi được khôi phục.</span>
            </Alert>
        </Modal.Body>
        <Modal.Footer className={styles.deleteFooter}>
            <Button variant="light" onClick={onClose} disabled={deleting}>Giữ tài khoản</Button>
            <Button variant="danger" onClick={onConfirm} disabled={deleting}>
                {deleting ? <Spinner animation="border" size="sm" className="me-2" /> : <Trash2 size={16} className="me-2" aria-hidden="true" />}
                Xác nhận xóa mềm
            </Button>
        </Modal.Footer>
    </Modal>
);
