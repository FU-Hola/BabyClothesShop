import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Badge, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { BriefcaseBusiness, Info, Save, UserRoundPen, UserRoundPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import accountApi from '../../api/accountApi';
import staffSchema from '../../schemas/staffSchema';
import styles from './StaffFormModal.module.css';

const StaffFormModal = ({ staff, onClose, onSaved }) => {
    const isEditing = Boolean(staff);
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(staffSchema(isEditing)),
        defaultValues: {
            fullName: staff?.fullName || '',
            email: staff?.email || '',
            phone: staff?.phone || '',
            employeeCode: staff?.employeeCode || '',
            position: staff?.position || '',
            ...(!isEditing && { password: '' }),
        },
    });

    const onSubmit = async (formData) => {
        const profileData = {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            employeeCode: formData.employeeCode,
            position: formData.position,
        };
        try {
            const response = isEditing
                ? await accountApi.updateAccount('staff', staff.id, profileData)
                : await accountApi.createAccount('staff', { ...profileData, password: formData.password });
            onSaved(response.message);
        } catch (error) {
            setError('root.server', { message: error.response?.data?.message || 'Không thể lưu thông tin nhân viên.' });
        }
    };

    const HeaderIcon = isEditing ? UserRoundPen : UserRoundPlus;

    return (
        <Modal
            show
            onHide={onClose}
            centered
            scrollable
            size="lg"
            backdrop={isSubmitting ? 'static' : true}
            keyboard={!isSubmitting}
            contentClassName={styles.modal}
        >
            <Form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton={!isSubmitting} className={styles.header}>
                    <span className={styles.headerIcon}>
                        <HeaderIcon size={23} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <div className={styles.heading}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <Modal.Title>{isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</Modal.Title>
                            <Badge className={styles.roleBadge}>Nhân viên</Badge>
                        </div>
                        <p>
                            {isEditing
                                ? 'Cập nhật thông tin cá nhân và hồ sơ công việc.'
                                : 'Tạo hồ sơ cùng tài khoản đăng nhập cho nhân viên.'}
                        </p>
                    </div>
                </Modal.Header>
                <Modal.Body className={styles.body}>
                    {errors.root?.server && (
                        <Alert variant="danger" className={styles.serverAlert}>
                            {errors.root.server.message}
                        </Alert>
                    )}

                    <fieldset className={styles.section} disabled={isSubmitting}>
                        <legend className={styles.sectionHeader}>
                            <span className={styles.sectionIcon}>
                                <UserRoundPen size={18} aria-hidden="true" />
                            </span>
                            <span>
                                <strong>Thông tin cá nhân</strong>
                                <small>Thông tin liên hệ cơ bản của nhân viên</small>
                            </span>
                        </legend>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group controlId="staff-fullName">
                                    <Form.Label className={styles.label}>
                                        Họ và tên
                                        <span className={styles.required} aria-hidden="true">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        className={styles.control}
                                        type="text"
                                        placeholder="Nhập họ và tên"
                                        autoComplete="name"
                                        isInvalid={Boolean(errors.fullName)}
                                        disabled={isSubmitting}
                                        aria-required="true"
                                        {...register('fullName')}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.fullName?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="staff-email">
                                    <Form.Label className={styles.label}>
                                        Email
                                        <span className={styles.required} aria-hidden="true">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        className={styles.control}
                                        type="email"
                                        placeholder="Nhập địa chỉ email"
                                        autoComplete="email"
                                        isInvalid={Boolean(errors.email)}
                                        disabled={isSubmitting}
                                        aria-required="true"
                                        {...register('email')}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="staff-phone">
                                    <Form.Label className={styles.label}>Số điện thoại</Form.Label>
                                    <Form.Control
                                        className={styles.control}
                                        type="tel"
                                        placeholder="Nhập số điện thoại"
                                        autoComplete="tel"
                                        isInvalid={Boolean(errors.phone)}
                                        disabled={isSubmitting}
                                        {...register('phone')}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.phone?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </fieldset>

                    <fieldset className={styles.section} disabled={isSubmitting}>
                        <legend className={styles.sectionHeader}>
                            <span className={styles.sectionIcon}>
                                <BriefcaseBusiness size={18} aria-hidden="true" />
                            </span>
                            <span>
                                <strong>Thông tin công việc</strong>
                                <small>Mã định danh và vị trí làm việc</small>
                            </span>
                        </legend>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group controlId="staff-employeeCode">
                                    <Form.Label className={styles.label}>
                                        Mã nhân viên
                                        <span className={styles.required} aria-hidden="true">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        className={styles.control}
                                        type="text"
                                        placeholder="Nhập mã nhân viên"
                                        autoComplete="off"
                                        isInvalid={Boolean(errors.employeeCode)}
                                        disabled={isSubmitting}
                                        aria-required="true"
                                        {...register('employeeCode')}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.employeeCode?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="staff-position">
                                    <Form.Label className={styles.label}>
                                        Chức danh
                                        <span className={styles.required} aria-hidden="true">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        className={styles.control}
                                        type="text"
                                        placeholder="Nhập chức danh"
                                        autoComplete="organization-title"
                                        isInvalid={Boolean(errors.position)}
                                        disabled={isSubmitting}
                                        aria-required="true"
                                        {...register('position')}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.position?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            {!isEditing && (
                                <Col md={6}>
                                    <Form.Group controlId="staff-password">
                                        <Form.Label className={styles.label}>
                                            Mật khẩu ban đầu
                                            <span className={styles.required} aria-hidden="true">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            className={styles.control}
                                            type="password"
                                            placeholder="Tối thiểu 6 ký tự"
                                            autoComplete="new-password"
                                            isInvalid={Boolean(errors.password)}
                                            disabled={isSubmitting}
                                            aria-required="true"
                                            {...register('password')}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.password?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            )}
                        </Row>
                    </fieldset>

                    <Alert variant="light" className={styles.note}>
                        <Info size={17} aria-hidden="true" />
                        <span>
                            {isEditing
                                ? 'Vai trò và mật khẩu không được thay đổi tại màn hình này.'
                                : 'Nhân viên có thể dùng email và mật khẩu ban đầu để đăng nhập.'}
                        </span>
                    </Alert>
                </Modal.Body>
                <Modal.Footer className={styles.footer}>
                    <Button variant="outline-secondary" onClick={onClose} disabled={isSubmitting} className={styles.cancelButton}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                        {isSubmitting
                            ? <Spinner animation="border" size="sm" aria-hidden="true" />
                            : <Save size={17} aria-hidden="true" />}
                        {isEditing ? 'Lưu thay đổi' : 'Tạo nhân viên'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default StaffFormModal;
