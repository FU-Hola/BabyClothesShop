import { Alert, Button, Modal, Spinner } from 'react-bootstrap';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { getAccountInitials } from '../../utils/accountFormatters';
import styles from './AccountModals.module.css';

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
