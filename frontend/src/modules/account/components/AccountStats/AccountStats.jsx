import { Card, Col, Row } from 'react-bootstrap';
import { ShieldCheck, UserCheck, Users, UserX } from 'lucide-react';
import styles from './AccountStats.module.css';

const statDefinitions = [
    { key: 'total', label: 'Tổng tài khoản', icon: Users, tone: 'blue' },
    { key: 'admins', label: 'Quản trị viên', icon: ShieldCheck, tone: 'purple' },
    { key: 'active', label: 'Đang hoạt động', icon: UserCheck, tone: 'green' },
    { key: 'blocked', label: 'Đã khóa', icon: UserX, tone: 'orange' },
];

const AccountStats = ({ stats }) => (
    <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
        {statDefinitions.map(({ key, label, icon: Icon, tone }) => (
            <Col key={key}>
                <Card className={`${styles.card} h-100`}>
                    <Card.Body className="d-flex align-items-center gap-3">
                        <span className={`${styles.icon} ${styles[tone]}`}>
                            <Icon size={21} aria-hidden="true" />
                        </span>
                        <div className="overflow-hidden">
                            <Card.Subtitle className={styles.label}>{label}</Card.Subtitle>
                            <Card.Text className={styles.value}>{stats[key]}</Card.Text>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        ))}
    </Row>
);

export default AccountStats;
