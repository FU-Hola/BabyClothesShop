import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, UserRoundPlus } from 'lucide-react';
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

    const fields = [
        { name: 'fullName', label: 'Họ và tên *', type: 'text', md: 6 },
        { name: 'email', label: 'Email *', type: 'email', md: 6 },
        { name: 'phone', label: 'Số điện thoại', type: 'tel', md: 6 },
        { name: 'employeeCode', label: 'Mã nhân viên *', type: 'text', md: 6 },
        { name: 'position', label: 'Chức danh *', type: 'text', md: 6 },
        ...(!isEditing ? [{ name: 'password', label: 'Mật khẩu ban đầu *', type: 'password', md: 6 }] : []),
    ];

    return (
        <Modal show onHide={onClose} centered size="lg" backdrop={isSubmitting ? 'static' : true} contentClassName={styles.modal}>
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton={!isSubmitting} className={styles.header}>
                    <span className={styles.icon}><UserRoundPlus size={22} aria-hidden="true" /></span>
                    <div><Modal.Title>{isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}</Modal.Title><p>{isEditing ? 'Cập nhật hồ sơ công việc của nhân viên.' : 'Tạo tài khoản đăng nhập ban đầu cho nhân viên.'}</p></div>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {errors.root?.server && <Alert variant="danger">{errors.root.server.message}</Alert>}
                    <Row className="g-3">
                        {fields.map(({ name, label, type, md }) => (
                            <Col md={md} key={name}>
                                <Form.Group controlId={`staff-${name}`}>
                                    <Form.Label>{label}</Form.Label>
                                    <Form.Control type={type} autoComplete={type === 'password' ? 'new-password' : undefined} isInvalid={!!errors[name]} disabled={isSubmitting} {...register(name)} />
                                    <Form.Control.Feedback type="invalid">{errors[name]?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
                <Modal.Footer className={styles.footer}>
                    <Button variant="light" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
                    <Button type="submit" disabled={isSubmitting} className="d-inline-flex align-items-center">
                        {isSubmitting ? <Spinner animation="border" size="sm" className="me-2" /> : <Save size={17} className="me-2" aria-hidden="true" />}
                        {isEditing ? 'Lưu thay đổi' : 'Tạo nhân viên'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default StaffFormModal;
