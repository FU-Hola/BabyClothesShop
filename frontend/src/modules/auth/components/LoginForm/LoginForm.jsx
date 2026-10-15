import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import authApi from '../../api/authApi';
import authBanner from '../../../../shared/assets/auth-banner.png';
import styles from './LoginForm.module.css';

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy thông báo hoặc email đã đăng ký thành công nếu được chuyển từ trang register sang
    const registeredEmail = location.state?.email || '';
    const redirectNotice = location.state?.message || '';

    const [formData, setFormData] = useState({
        email: registeredEmail,
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState(redirectNotice);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (serverError) setServerError('');
        if (successMessage) setSuccessMessage('');
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
        setSuccessMessage('');

        if (!validate()) return;

        setLoading(true);
        try {
            const data = await authApi.login({
                email: formData.email.trim(),
                password: formData.password,
            });

            // Lưu JWT token và thông tin user vào localStorage
            if (data.token) {
                localStorage.setItem('accessToken', data.token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
            setTimeout(() => {
                navigate('/');
            }, 1000);
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
        <div className={styles.card}>
            {/* Cột trái: Ảnh banner thời trang bé yêu */}
            <div className={styles.bannerSide}>
                <img
                    src={authBanner}
                    alt="BaBy Clothes Shop - Thời trang bé yêu"
                    className={styles.bannerImg}
                />
                <div className={styles.bannerOverlay}>
                    <div className={styles.bannerContent}>
                        <span className={styles.bannerTag}>BaBy Clothes Shop</span>
                        <h2 className={styles.bannerHeading}>Chào mừng bạn quay lại</h2>
                        <p className={styles.bannerDesc}>
                            Đăng nhập để theo dõi đơn hàng và tận hưởng những ưu đãi dành riêng cho bé yêu.
                        </p>
                    </div>
                </div>
            </div>

            {/* Cột phải: Form đăng nhập */}
            <div className={styles.formSide}>
                <div className={styles.header}>
                    <span className={styles.badge}>Thành viên</span>
                    <h1 className={styles.title}>Đăng Nhập</h1>
                    <p className={styles.subtitle}>Nhập tài khoản để tiếp tục mua sắm cho bé yêu</p>
                </div>

                {serverError && (
                    <div className={styles.alertError} role="alert">
                        <AlertCircle size={18} />
                        <span>{serverError}</span>
                    </div>
                )}

                {successMessage && (
                    <div className={styles.alertSuccess} role="status">
                        <CheckCircle2 size={18} />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    {/* Email */}
                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>
                            Email *
                        </label>
                        <div
                            className={`${styles.inputWrapper} ${
                                errors.email ? styles.inputWrapperError : ''
                            }`}
                        >
                            <Mail size={18} className={styles.inputIcon} aria-hidden="true" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="example@gmail.com"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                disabled={loading}
                            />
                        </div>
                        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                    </div>

                    {/* Mật khẩu */}
                    <div className={styles.field}>
                        <div className={styles.labelRow}>
                            <label htmlFor="password" className={styles.label}>
                                Mật khẩu *
                            </label>
                            <Link to="/forgot-password" className={styles.forgotLink}>
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <div
                            className={`${styles.inputWrapper} ${
                                errors.password ? styles.inputWrapperError : ''
                            }`}
                        >
                            <Lock size={18} className={styles.inputIcon} aria-hidden="true" />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nhập mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={styles.toggleBtn}
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                    </div>

                    {/* Submit button */}
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spinner-border spinner-border-sm" />
                                <span>Đang đăng nhập...</span>
                            </>
                        ) : (
                            'Đăng Nhập'
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <span>Chưa có tài khoản?</span>
                    <Link to="/register" className={styles.footerLink}>
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
