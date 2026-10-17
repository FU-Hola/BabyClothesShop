import { Button, Container, Navbar, Stack } from 'react-bootstrap';
import { Menu } from 'lucide-react';
import styles from './AdminTopbar.module.css';

const AdminTopbar = ({ user, onOpenSidebar }) => {
    const avatarText = user?.fullName?.trim().charAt(0).toUpperCase() || 'A';

    return (
        <Navbar sticky="top" className={styles.topbar}>
            <Container fluid className="gap-3 px-0">
                <Button
                    variant="link"
                    className={`${styles.menuButton} d-lg-none`}
                    onClick={onOpenSidebar}
                    aria-label="Mở menu quản trị"
                >
                    <Menu size={23} aria-hidden="true" />
                </Button>
                <Navbar.Brand as="div" className="me-auto py-0">
                    <p className={`${styles.eyebrow} d-none d-sm-block`}>Admin dashboard</p>
                    <span className={styles.title}>Trung tâm quản trị</span>
                </Navbar.Brand>
                <Stack direction="horizontal" gap={2} className={styles.profile}>
                    <span className={styles.avatar}>{avatarText}</span>
                    <span className="d-none d-sm-block">
                        <strong>{user?.fullName || 'Quản trị viên'}</strong>
                        <small>Administrator</small>
                    </span>
                </Stack>
            </Container>
        </Navbar>
    );
};

export default AdminTopbar;
