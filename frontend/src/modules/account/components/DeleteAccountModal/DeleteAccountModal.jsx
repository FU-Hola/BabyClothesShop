import { Alert, Button, Modal, Spinner } from 'react-bootstrap';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { getAccountInitials } from '../../utils/accountFormatters';
import styles from './DeleteAccountModal.module.css';

const DeleteAccountModal = ({ account, deleting, onClose, onConfirm }) => (
    <Modal
        show={Boolean(account)}
        onHide={onClose}
        centered
        backdrop={deleting ? 'static' : true}
        keyboard={!deleting}
        dialogClassName={styles.dialog}
        contentClassName={styles.modal}
    >
        <Modal.Header className={styles.header} closeButton={!deleting}>
            <Modal.Title className="visually-hidden">Xóa tài khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.body}>
            <span className={styles.icon}>
                <Trash2 size={27} aria-hidden="true" />
            </span>
            <h2>Xóa tài khoản?</h2>
            <p>Bạn đang chuẩn bị xóa vĩnh viễn tài khoản sau:</p>

            {account && (
                <div className={`${styles.preview} d-flex align-items-center gap-2`}>
                    <span className={styles.avatar}>{getAccountInitials(account.fullName)}</span>
                    <span>
                        <strong>{account.fullName}</strong>
                        <small>{account.email}</small>
                    </span>
                </div>
            )}

            <Alert variant="warning" className={`${styles.warning} d-flex align-items-center justify-content-center gap-2`}>
                <AlertTriangle size={17} aria-hidden="true" />
                <span>Hành động này không thể hoàn tác.</span>
            </Alert>
        </Modal.Body>
        <Modal.Footer className={styles.footer}>
            <Button variant="light" onClick={onClose} disabled={deleting}>
                Giữ tài khoản
            </Button>
            <Button variant="danger" onClick={onConfirm} disabled={deleting}>
                {deleting && <Spinner animation="border" size="sm" className="me-2" />}
                {!deleting && <Trash2 size={16} className="me-2" aria-hidden="true" />}
                Xác nhận xóa
            </Button>
        </Modal.Footer>
    </Modal>
);

export default DeleteAccountModal;
