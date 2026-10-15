import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, InputGroup, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import authApi from '../../api/authApi';
import authBanner from '../../../../shared/assets/auth-banner.png';
import styles from './RegisterForm.module.css';

const RegisterForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name] || (name === 'password' && errors.confirmPassword)) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
                ...(name === 'password' ? { confirmPassword: '' } : {}),
            }));
        }
        if (serverError) setServerError('');
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ và tên';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập địa chỉ email';
        } else if (!emailRegex.test(formData.email.trim())) {
            newErrors.email = 'Email không hợp lệ (ví dụ: ten@gmail.com)';
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!validate()) return;

        setLoading(true);
        try {
            await authApi.register({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            navigate('/login', {
                state: {
                    message: 'Đăng ký thành công! Vui lòng đăng nhập.',
                    email: formData.email.trim(),
                },
            });
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Đăng ký không thành công. Vui lòng thử lại sau!';
            setServerError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`${styles.card} border-0 shadow-lg rounded-4 overflow-hidden`}>
            <Row className="g-0">
                <Col md={5} className={`${styles.bannerSide} d-none d-md-block position-relative bg-primary`}>
                    <img
                        src={authBanner}
                        alt="BaBy Clothes Shop - Thời trang bé yêu"
                        className="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
                    />
                    <div
                        className={`position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-4 p-lg-5 text-white ${styles.bannerOverlay}`}
                    >
                        <Badge
                            className={`align-self-start mb-3 px-3 py-2 rounded-pill text-uppercase ${styles.brandBadge}`}
                        >
                            BaBy Clothes Shop
                        </Badge>
                        <h3 className="fw-bold mb-2">Nâng niu từng khoảnh khắc bé yêu</h3>
                        <p className="small text-white-50 mb-0">
                            Trang phục mềm mại, an toàn từ sợi bông tự nhiên cho nụ cười rạng rỡ của bé.
                        </p>
                    </div>
                </Col>

                <Col md={7} className="p-4 p-sm-5 bg-white d-flex flex-column justify-content-center">
                    <div className="text-center mb-4">
                        <Badge className={`${styles.memberBadge} px-3 py-2 rounded-pill fw-semibold mb-2`}>
                            Thành viên mới
                        </Badge>
                        <h1 className="h2 fw-bold text-primary mb-1">Đăng ký tài khoản</h1>
                        <p className="text-muted small mb-0">
                            Tạo tài khoản để nhận nhiều ưu đãi khi mua sắm cho bé yêu
                        </p>
                    </div>

                    {serverError && (
                        <Alert variant="danger" className="d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                            <AlertCircle size={18} className="flex-shrink-0" aria-hidden="true" />
                            <span>{serverError}</span>
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit} noValidate>
                        <Form.Group className="mb-3" controlId="registerFullName">
                            <Form.Label className="fw-semibold small text-primary mb-1">
                                Họ và tên *
                            </Form.Label>
                            <InputGroup hasValidation>
                                <InputGroup.Text className="bg-light border-end-0 text-secondary rounded-start-3">
                                    <User size={18} aria-hidden="true" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    isInvalid={!!errors.fullName}
                                    disabled={loading}
                                    className="bg-light border-start-0 rounded-end-3 py-2"
                                />
                                <Form.Control.Feedback type="invalid" className="small">
                                    {errors.fullName}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="registerEmail">
                            <Form.Label className="fw-semibold small text-primary mb-1">
                                Email *
                            </Form.Label>
                            <InputGroup hasValidation>
                                <InputGroup.Text className="bg-light border-end-0 text-secondary rounded-start-3">
                                    <Mail size={18} aria-hidden="true" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="example@gmail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    isInvalid={!!errors.email}
                                    disabled={loading}
                                    className="bg-light border-start-0 rounded-end-3 py-2"
                                />
                                <Form.Control.Feedback type="invalid" className="small">
                                    {errors.email}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="registerPassword">
                            <Form.Label className="fw-semibold small text-primary mb-1">
                                Mật khẩu *
                            </Form.Label>
                            <InputGroup hasValidation>
                                <InputGroup.Text className="bg-light border-end-0 text-secondary rounded-start-3">
                                    <Lock size={18} aria-hidden="true" />
                                </InputGroup.Text>
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Tối thiểu 6 ký tự"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    isInvalid={!!errors.password}
                                    disabled={loading}
                                    className="bg-light border-start-0 border-end-0 py-2"
                                />
                                <Button
                                    variant="outline-secondary"
                                    className="bg-light border-start-0 text-secondary rounded-end-3 d-flex align-items-center"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    type="button"
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </Button>
                                <Form.Control.Feedback type="invalid" className="small">
                                    {errors.password}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="registerConfirmPassword">
                            <Form.Label className="fw-semibold small text-primary mb-1">
                                Xác nhận mật khẩu *
                            </Form.Label>
                            <InputGroup hasValidation>
                                <InputGroup.Text className="bg-light border-end-0 text-secondary rounded-start-3">
                                    <Lock size={18} aria-hidden="true" />
                                </InputGroup.Text>
                                <Form.Control
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    isInvalid={!!errors.confirmPassword}
                                    disabled={loading}
                                    className="bg-light border-start-0 border-end-0 py-2"
                                />
                                <Button
                                    variant="outline-secondary"
                                    className="bg-light border-start-0 text-secondary rounded-end-3 d-flex align-items-center"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    type="button"
                                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </Button>
                                <Form.Control.Feedback type="invalid" className="small">
                                    {errors.confirmPassword}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                            className={`${styles.submitButton} w-100 py-2 mt-3 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2`}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" />
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                'Đăng ký'
                            )}
                        </Button>
                    </Form>

                    <div className="text-center mt-4 text-muted small">
                        <span>Đã có tài khoản? </span>
                        <Link to="/login" className="fw-semibold text-primary text-decoration-none">
                            Đăng nhập ngay
                        </Link>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default RegisterForm;
