import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, InputGroup, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import authApi from '../../api/authApi';
import authBanner from '../../../../shared/assets/auth-banner.png';
import styles from './LoginForm.module.css';

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const registeredEmail = location.state?.email || '';
    const [notice, setNotice] = useState(location.state?.message || '');

    const [formData, setFormData] = useState({
        email: registeredEmail,
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (serverError) setServerError('');
        if (notice) setNotice('');
    };

    const validate = () => {
        const newErrors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập địa chỉ email';
        } else if (!emailRegex.test(formData.email.trim())) {
            newErrors.email = 'Email không hợp lệ (ví dụ: ten@gmail.com)';
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setNotice('');

        if (!validate()) return;

        setLoading(true);
        try {
            const data = await authApi.login({
                email: formData.email.trim(),
                password: formData.password,
            });

            if (data.token) {
                localStorage.setItem('accessToken', data.token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            const destination = location.state?.from || (data.user?.role === 'admin' ? '/admin/accounts' : '/');
            navigate(destination, { replace: true });
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin!';
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
                        <h3 className="fw-bold mb-2">Chào mừng bạn quay lại</h3>
                        <p className="small text-white-50 mb-0">
                            Đăng nhập để theo dõi đơn hàng và tận hưởng những ưu đãi dành riêng cho bé yêu.
                        </p>
                    </div>
                </Col>

                <Col md={7} className="p-4 p-sm-5 bg-white d-flex flex-column justify-content-center">
                    <div className="text-center mb-4">
                        <Badge className={`${styles.memberBadge} px-3 py-2 rounded-pill fw-semibold mb-2`}>
                            Thành viên
                        </Badge>
                        <h1 className="h2 fw-bold text-primary mb-1">Đăng nhập</h1>
                        <p className="text-muted small mb-0">
                            Nhập tài khoản để tiếp tục mua sắm cho bé yêu
                        </p>
                    </div>

                    {serverError && (
                        <Alert variant="danger" className="d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                            <AlertCircle size={18} className="flex-shrink-0" aria-hidden="true" />
                            <span>{serverError}</span>
                        </Alert>
                    )}

                    {notice && (
                        <Alert variant="success" className="d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                            <CheckCircle2 size={18} className="flex-shrink-0" aria-hidden="true" />
                            <span>{notice}</span>
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit} noValidate>
                        <Form.Group className="mb-3" controlId="loginEmail">
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

                        <Form.Group className="mb-3" controlId="loginPassword">
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
                                    placeholder="Nhập mật khẩu"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
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

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                            className={`${styles.submitButton} w-100 py-2 mt-3 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2`}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" />
                                    <span>Đang đăng nhập...</span>
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </Button>
                    </Form>

                    <div className="text-center mt-4 text-muted small">
                        <span>Chưa có tài khoản? </span>
                        <Link to="/register" className="fw-semibold text-primary text-decoration-none">
                            Đăng ký ngay
                        </Link>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default LoginForm;
