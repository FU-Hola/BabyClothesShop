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
            ...(!isEditing && { role: 'STORE_STAFF' }),
        },
    });

    const onSubmit = async (formData) => {
        const profileData = {
            fullName: formData.fullName,
            phone: formData.phone,
            employeeCode: formData.employeeCode,
            position: formData.position,
        };
        try {
            const response = isEditing
                ? await accountApi.updateAccount('staff', staff.id, profileData)
                : await accountApi.createAccount('staff', {
                    ...profileData,
                    email: formData.email,
                    role: formData.role,
                });
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
            contentClassName={`${styles.modal} overflow-hidden`}
        >
            <Form className={`${styles.form} d-flex flex-column overflow-hidden`} onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton={!isSubmitting} className="flex-shrink-0 d-flex align-items-center gap-3 px-4 py-3 bg-light">
                    <span className={styles.headerIcon}>
                        <HeaderIcon size={23} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <div className={styles.heading}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <Modal.Title>{isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</Modal.Title>
                            <Badge bg="primary">Nhân viên</Badge>
                        </div>
                        <p className="small text-muted mb-0">
                            {isEditing
                                ? 'Cập nhật thông tin cá nhân và hồ sơ công việc.'
                                : 'Tạo hồ sơ cùng tài khoản đăng nhập cho nhân viên.'}
                        </p>
                    </div>
                </Modal.Header>
                <Modal.Body className={`${styles.body} flex-grow-1 overflow-y-auto p-4`}>
                    {errors.root?.server && (
                        <Alert variant="danger" className="mb-4">
                            {errors.root.server.message}
                        </Alert>
                    )}

                    <fieldset className="border-0 p-0 mb-4" disabled={isSubmitting}>
                        <legend className={`${styles.sectionHeader} d-flex align-items-center gap-2 mb-3`}>
                            <span className={styles.sectionIcon}>
                                <UserRoundPen size={18} aria-hidden="true" />
                            </span>
                            <span className="d-flex flex-column">
                                <strong>Thông tin cá nhân</strong>
                                <small className="text-muted fw-normal">Thông tin liên hệ cơ bản của nhân viên</small>
                            </span>
                        </legend>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group controlId="staff-fullName">
                                    <Form.Label className="fw-semibold small mb-1">
                                        Họ và tên
                                        <span className="text-danger ms-1" aria-hidden="true">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        className="bg-light"
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
                                    <Form.Label className="fw-semibold small mb-1">
                                        Email
                                        {!isEditing && <span className="text-danger ms-1" aria-hidden="true">*</span>}
                                    </Form.Label>
                                    <Form.Control
                                        className="bg-light"
                                        type="email"
                                        placeholder="Nhập địa chỉ email"
                                        autoComplete="email"
                                        readOnly={isEditing}
                                        aria-describedby="staff-email-help"
                                        aria-required={!isEditing}
                                        isInvalid={Boolean(errors.email)}
                                        disabled={isSubmitting}
                                        {...register('email')}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email?.message}
                                    </Form.Control.Feedback>
                                    <Form.Text id="staff-email-help">
                                        Email dùng để đăng nhập và không thể thay đổi sau khi tạo.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="staff-phone">
                                    <Form.Label className="fw-semibold small mb-1">Số điện thoại</Form.Label>
                                    <Form.Control
                                        className="bg-light"
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

                    <fieldset className="border-0 p-0 mb-4" disabled={isSubmitting}>
                        <legend className={`${styles.sectionHeader} d-flex align-items-center gap-2 mb-3`}>
                            <span className={styles.sectionIcon}>
                                <BriefcaseBusiness size={18} aria-hidden="true" />
                            </span>
                            <span className="d-flex flex-column">
                                <strong>Thông tin công việc</strong>
                                <small className="text-muted fw-normal">Mã định danh và vị trí làm việc</small>
                            </span>
                        </legend>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group controlId="staff-employeeCode">
                                    <Form.Label className="fw-semibold small mb-1">
                                        Mã nhân viên
                                        <span className="text-danger ms-1" aria-hidden="true">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        className="bg-light"
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
                                    <Form.Label className="fw-semibold small mb-1">
                                        Chức danh
                                        <span className="text-danger ms-1" aria-hidden="true">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        className="bg-light"
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
                                    <Form.Group controlId="staff-role">
                                        <Form.Label className="fw-semibold small mb-1">
                                            Quyền nhân viên
                                            <span className="text-danger ms-1" aria-hidden="true">*</span>
                                        </Form.Label>
                                        <Form.Select
                                            className="bg-light"
                                            isInvalid={Boolean(errors.role)}
                                            disabled={isSubmitting}
                                            aria-required="true"
                                            {...register('role')}
                                        >
                                            <option value="STORE_STAFF">Nhân viên bán hàng</option>
                                            <option value="WAREHOUSE_STAFF">Nhân viên kho</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.role?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            )}
                        </Row>
                    </fieldset>

                    <Alert variant="light" className={`${styles.note} d-flex align-items-start gap-2 mb-0`}>
                        <Info size={17} aria-hidden="true" />
                        <span>
                            {isEditing
                                ? 'Email đăng nhập, vai trò và mật khẩu không được thay đổi tại màn hình này.'
                                : 'Hệ thống sẽ gửi link thiết lập mật khẩu đến email của nhân viên.'}
                        </span>
                    </Alert>
                </Modal.Body>
                <Modal.Footer className="flex-shrink-0 px-4 py-3 bg-light">
                    <Button variant="outline-secondary" onClick={onClose} disabled={isSubmitting} className="px-4">
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="d-inline-flex align-items-center justify-content-center gap-2 px-4">
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
