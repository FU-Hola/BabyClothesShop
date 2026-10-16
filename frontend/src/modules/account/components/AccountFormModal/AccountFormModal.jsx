import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import accountApi from '../../api/accountApi';
import accountSchema from '../../schemas/accountSchema';

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
        <Modal show onHide={onClose} centered size="lg" backdrop={isSubmitting ? 'static' : true}>
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton={!isSubmitting}>
                    <div>
                        <Modal.Title>{isEditing ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}</Modal.Title>
                        <p className="text-muted small mb-0 mt-1">
                            {isEditing ? 'Cập nhật thông tin và quyền truy cập.' : 'Tạo tài khoản cho khách hàng hoặc quản trị viên.'}
                        </p>
                    </div>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {errors.root?.server && <Alert variant="danger">{errors.root.server.message}</Alert>}
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group controlId="accountFullName">
                                <Form.Label>Họ và tên</Form.Label>
                                <Form.Control
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
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="accountEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
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
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="accountPassword">
                                <Form.Label>
                                    Mật khẩu {isEditing && <span className="text-muted fw-normal">(không đổi nếu để trống)</span>}
                                </Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder={isEditing ? 'Để trống nếu không thay đổi' : 'Tối thiểu 6 ký tự'}
                                    autoComplete="new-password"
                                    isInvalid={!!errors.password}
                                    disabled={isSubmitting}
                                    {...register('password')}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.password?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="accountRole">
                                <Form.Label>Vai trò</Form.Label>
                                <Form.Select disabled={isSubmitting} {...register('role')}>
                                    <option value="customer">Khách hàng</option>
                                    <option value="admin">Quản trị viên</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="accountStatus">
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Select disabled={isSubmitting} {...register('status')}>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="blocked">Đã khóa</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" type="button" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Spinner animation="border" size="sm" className="me-2" />}
                        {isEditing ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AccountFormModal;
