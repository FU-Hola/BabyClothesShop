import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, InputGroup, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import authApi from '../../api/authApi';
import authBanner from '../../../../shared/assets/auth-banner.png';
import registerSchema from './registerSchema';
import styles from './RegisterForm.module.css';

const RegisterForm = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const {
        register,
        handleSubmit,
        trigger,
        getFieldState,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
        mode: 'onTouched',
        reValidateMode: 'onChange',
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const registerField = (name) =>
        register(name, {
            onChange: () => {
                if (serverError) setServerError('');
                if (name === 'password' && getFieldState('confirmPassword').isTouched) {
                    void trigger('confirmPassword');
                }
            },
        });

    const onSubmit = async ({ fullName, email, password }) => {
        setServerError('');
        try {
            await authApi.register({
                fullName,
                email,
                password,
            });

            navigate('/login', {
                state: {
                    message: 'Đăng ký thành công! Vui lòng đăng nhập.',
                    email,
                },
            });
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Đăng ký không thành công. Vui lòng thử lại sau!';
            setServerError(msg);
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

                    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                                    placeholder="Nguyễn Văn A"
                                    {...registerField('fullName')}
                                    autoComplete="name"
                                    isInvalid={!!errors.fullName}
                                    disabled={isSubmitting}
                                    className="bg-light border-start-0 rounded-end-3 py-2"
                                />
                                <Form.Control.Feedback type="invalid" className="small">
                                    {errors.fullName?.message}
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
                                    placeholder="example@gmail.com"
                                    {...registerField('email')}
                                    autoComplete="email"
                                    isInvalid={!!errors.email}
                                    disabled={isSubmitting}
                                    className="bg-light border-start-0 rounded-end-3 py-2"
                                />
                                <Form.Control.Feedback type="invalid" className="small">
                                    {errors.email?.message}
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
                                    placeholder="Tối thiểu 6 ký tự"
                                    {...registerField('password')}
                                    autoComplete="new-password"
                                    isInvalid={!!errors.password}
                                    disabled={isSubmitting}
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
                                    {errors.password?.message}
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
                                    placeholder="Nhập lại mật khẩu"
                                    {...registerField('confirmPassword')}
                                    autoComplete="new-password"
                                    isInvalid={!!errors.confirmPassword}
                                    disabled={isSubmitting}
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
                                    {errors.confirmPassword?.message}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                            className={`${styles.submitButton} w-100 py-2 mt-3 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2`}
                        >
                            {isSubmitting ? (
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
