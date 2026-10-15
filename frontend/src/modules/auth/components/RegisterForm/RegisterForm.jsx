import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
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
        setSuccessMessage('');

        if (!validate()) return;

        setLoading(true);
        try {
            await authApi.register({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            setSuccessMessage('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.', email: formData.email },
                });
            }, 1200);
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
                        <h2 className={styles.bannerHeading}>Nâng niu từng khoảnh khắc bé yêu</h2>
                        <p className={styles.bannerDesc}>
                            Trang phục mềm mại, an toàn từ sợi bông tự nhiên cho nụ cười rạng rỡ của bé.
                        </p>
                    </div>
                </div>
            </div>

            {/* Cột phải: Form đăng ký */}
            <div className={styles.formSide}>
                <div className={styles.header}>
                    <span className={styles.badge}>Thành viên mới</span>
                    <h1 className={styles.title}>Đăng Ký Tài Khoản</h1>
                    <p className={styles.subtitle}>Tạo tài khoản để nhận nhiều ưu đãi khi mua sắm cho bé yêu</p>
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
                    {/* Họ và tên */}
                    <div className={styles.field}>
                        <label htmlFor="fullName" className={styles.label}>
                            Họ và tên *
                        </label>
                        <div
                            className={`${styles.inputWrapper} ${errors.fullName ? styles.inputWrapperError : ''
                                }`}
                        >
                            <User size={18} className={styles.inputIcon} aria-hidden="true" />
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="Nguyễn Văn A"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={styles.input}
                                disabled={loading}
                            />
                        </div>
                        {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                    </div>

                    {/* Email */}
                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>
                            Email *
                        </label>
                        <div
                            className={`${styles.inputWrapper} ${errors.email ? styles.inputWrapperError : ''
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
                        <label htmlFor="password" className={styles.label}>
                            Mật khẩu *
                        </label>
                        <div
                            className={`${styles.inputWrapper} ${errors.password ? styles.inputWrapperError : ''
                                }`}
                        >
                            <Lock size={18} className={styles.inputIcon} aria-hidden="true" />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Tối thiểu 6 ký tự"
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

                    {/* Xác nhận mật khẩu */}
                    <div className={styles.field}>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            Xác nhận mật khẩu *
                        </label>
                        <div
                            className={`${styles.inputWrapper} ${errors.confirmPassword ? styles.inputWrapperError : ''
                                }`}
                        >
                            <Lock size={18} className={styles.inputIcon} aria-hidden="true" />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Nhập lại mật khẩu"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={styles.input}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={styles.toggleBtn}
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <span className={styles.errorText}>{errors.confirmPassword}</span>
                        )}
                    </div>

                    {/* Submit button */}
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spinner-border spinner-border-sm" />
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            'Đăng Ký'
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <span>Đã có tài khoản?</span>
                    <Link to="/login" className={styles.footerLink}>
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
