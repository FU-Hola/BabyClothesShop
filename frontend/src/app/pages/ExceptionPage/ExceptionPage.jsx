import { useEffect } from 'react';
import { Button, Container, Stack } from 'react-bootstrap';
import { ArrowLeft, House, SearchX, ShieldX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ExceptionPage.module.css';

const ExceptionPage = ({ statusCode = 404 }) => {
    const navigate = useNavigate();
    const forbidden = statusCode === 403;
    const title = forbidden ? 'Bạn không có quyền truy cập' : 'Không tìm thấy trang';
    const description = forbidden
        ? 'Tài khoản hiện tại không được phép truy cập khu vực này. Vui lòng quay lại hoặc đăng nhập bằng tài khoản có quyền phù hợp.'
        : 'Đường dẫn bạn truy cập không tồn tại, đã được thay đổi hoặc tạm thời không khả dụng.';
    const suggestion = forbidden
        ? 'Nếu bạn cho rằng đây là nhầm lẫn, hãy liên hệ quản trị viên để được hỗ trợ.'
        : 'Hãy kiểm tra lại địa chỉ hoặc quay về trang chủ để tiếp tục mua sắm.';
    const Icon = forbidden ? ShieldX : SearchX;

    useEffect(() => {
        const previousTitle = document.title;
        document.title = `${statusCode} - ${title}`;
        return () => {
            document.title = previousTitle;
        };
    }, [statusCode, title]);

    return (
        <main className={styles.page}>
            <Container className={styles.container}>
                <section className={styles.card} aria-labelledby="exception-title">
                    <div className={`${styles.codePanel} ${forbidden ? styles.forbidden : styles.notFound}`}>
                        <span className={styles.brand}>Baby Clothes Shop</span>
                        <span className={styles.code} aria-hidden="true">{statusCode}</span>
                        <div className={styles.decorativeLine} aria-hidden="true" />
                    </div>

                    <div className={styles.content}>
                        <span className={styles.icon}>
                            <Icon size={31} strokeWidth={1.7} aria-hidden="true" />
                        </span>
                        <p className={styles.eyebrow}>Lỗi {statusCode}</p>
                        <h1 id="exception-title">{title}</h1>
                        <p className={styles.description}>{description}</p>
                        <p className={styles.suggestion}>{suggestion}</p>

                        <Stack direction="horizontal" gap={2} className={styles.actions}>
                            <Button as={Link} to="/" className={styles.homeButton}>
                                <House size={17} aria-hidden="true" />
                                Về trang chủ
                            </Button>
                            <Button variant="outline-secondary" className={styles.backButton} onClick={() => navigate(-1)}>
                                <ArrowLeft size={17} aria-hidden="true" />
                                Quay lại
                            </Button>
                        </Stack>
                    </div>
                </section>
            </Container>
        </main>
    );
};

export default ExceptionPage;
