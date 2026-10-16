import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, Info, LockKeyhole, Mail, Pencil, Plus, Save, ShieldCheck, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import accountApi from '../../api/accountApi';
import accountSchema from '../../schemas/accountSchema';
import styles from './AccountFormModal.module.css';

const AccountFormModal = ({ account, onClose, onSaved }) => {
    const isEditing = Boolean(account);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(accountSchema(isEditing)),
        defaultValues: {
            fullName: account?.fullName || '',
            email: account?.email || '',
            password: '',
            role: account?.role || 'customer',
            status: account?.status || 'active',
        },
    });

    const onSubmit = async (formData) => {
        try {
            const payload = { ...formData };
            if (isEditing && !payload.password) delete payload.password;

            const response = isEditing
                ? await accountApi.updateAccount(account.id, payload)
                : await accountApi.createAccount(payload);
            onSaved(response.message);
        } catch (error) {
            setError('root.server', {
                message: error.response?.data?.message || 'Không thể lưu tài khoản. Vui lòng thử lại.',
            });
        }
    };

    return (
        <Modal
            show
            onHide={onClose}
            centered
            backdrop={isSubmitting ? 'static' : true}
            dialogClassName={styles.dialog}
            contentClassName={styles.modalContent}
        >
            <Form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header className={styles.header} closeButton={!isSubmitting}>
                    <div className={styles.headerContent}>
                        <span className={styles.headerIcon}>
                            {isEditing ? <Pencil size={22} aria-hidden="true" /> : <Plus size={24} aria-hidden="true" />}
                        </span>
                        <div>
                            <Modal.Title className={styles.title}>
                                {isEditing ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
                            </Modal.Title>
                            <p className={styles.subtitle}>
                            {isEditing ? 'Cập nhật thông tin và quyền truy cập.' : 'Tạo tài khoản cho khách hàng hoặc quản trị viên.'}
                            </p>
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body className={styles.body}>
                    {errors.root?.server && (
                        <Alert className={styles.errorAlert} variant="danger">
                            {errors.root.server.message}
                        </Alert>
                    )}

                    <section className={styles.section}>
                        <div className={styles.sectionHeading}>
                            <User size={18} aria-hidden="true" />
                            <span>Thông tin tài khoản</span>
                        </div>
                        <Row className="g-3">
                            <Col md={6}>
                            <Form.Group controlId="accountFullName">
                                <Form.Label className={styles.label}>Họ và tên <span>*</span></Form.Label>
                                <div className={styles.controlWrap}>
                                    <User className={styles.fieldIcon} size={17} aria-hidden="true" />
                                    <Form.Control
                                        className={styles.iconControl}
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        autoComplete="name"
                                        isInvalid={!!errors.fullName}
                                        disabled={isSubmitting}
                                        {...register('fullName')}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.fullName?.message}
                                    </Form.Control.Feedback>
                                </div>
                            </Form.Group>
                            </Col>
                            <Col md={6}>
                            <Form.Group controlId="accountEmail">
                                <Form.Label className={styles.label}>Email <span>*</span></Form.Label>
                                <div className={styles.controlWrap}>
                                    <Mail className={styles.fieldIcon} size={17} aria-hidden="true" />
                                    <Form.Control
                                        className={styles.iconControl}
                                        type="email"
                                        placeholder="account@example.com"
                                        autoComplete="email"
                                        isInvalid={!!errors.email}
                                        disabled={isSubmitting}
                                        {...register('email')}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email?.message}
                                    </Form.Control.Feedback>
                                </div>
                            </Form.Group>
                            </Col>
                            <Col xs={12}>
                            <Form.Group controlId="accountPassword">
                                <Form.Label className={styles.label}>
                                    Mật khẩu {!isEditing && <span>*</span>}
                                </Form.Label>
                                <div className={styles.controlWrap}>
                                    <LockKeyhole className={styles.fieldIcon} size={17} aria-hidden="true" />
                                    <Form.Control
                                        className={styles.iconControl}
                                        type="password"
                                        placeholder={isEditing ? 'Để trống nếu không thay đổi mật khẩu' : 'Tối thiểu 6 ký tự'}
                                        autoComplete="new-password"
                                        isInvalid={!!errors.password}
                                        disabled={isSubmitting}
                                        {...register('password')}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password?.message}
                                    </Form.Control.Feedback>
                                </div>
                                {isEditing && (
                                    <p className={styles.fieldHint}>
                                        <Info size={14} aria-hidden="true" />
                                        Chỉ nhập khi bạn muốn đặt mật khẩu mới cho tài khoản này.
                                    </p>
                                )}
                            </Form.Group>
                            </Col>
                        </Row>
                    </section>

                    <section className={`${styles.section} ${styles.accessSection}`}>
                        <div className={styles.sectionHeading}>
                            <ShieldCheck size={18} aria-hidden="true" />
                            <span>Phân quyền và trạng thái</span>
                        </div>
                        <Row className="g-3">
                            <Col md={6}>
                            <Form.Group controlId="accountRole">
                                <Form.Label className={styles.label}>Vai trò</Form.Label>
                                <Form.Select className={styles.select} disabled={isSubmitting} {...register('role')}>
                                    <option value="customer">Khách hàng</option>
                                    <option value="admin">Quản trị viên</option>
                                </Form.Select>
                            </Form.Group>
                            </Col>
                            <Col md={6}>
                            <Form.Group controlId="accountStatus">
                                <Form.Label className={styles.label}>Trạng thái</Form.Label>
                                <Form.Select className={styles.select} disabled={isSubmitting} {...register('status')}>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="blocked">Đã khóa</option>
                                </Form.Select>
                            </Form.Group>
                            </Col>
                        </Row>
                        <p className={styles.accessHint}>
                            <CircleCheck size={15} aria-hidden="true" />
                            Quản trị viên có quyền truy cập trung tâm quản trị và quản lý tài khoản.
                        </p>
                    </section>
                </Modal.Body>
                <Modal.Footer className={styles.footer}>
                    <Button className={styles.cancelButton} variant="light" type="button" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button className={styles.submitButton} variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Spinner animation="border" size="sm" className="me-2" />}
                        {!isSubmitting && <Save size={17} className="me-2" aria-hidden="true" />}
                        {isEditing ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AccountFormModal;
