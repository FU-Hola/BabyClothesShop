import { Breadcrumb, Button, Card, Col, Row } from 'react-bootstrap';
import { Plus } from 'lucide-react';
import styles from './AccountSummary.module.css';

const AccountSummary = ({ config, stats, onAdd }) => (
    <>
        <header className="d-flex flex-column flex-sm-row align-items-sm-end justify-content-between gap-3 mb-4">
            <div>
                <Breadcrumb className={styles.breadcrumb}>
                    <Breadcrumb.Item>Quản trị</Breadcrumb.Item>
                    <Breadcrumb.Item active>{config.section}</Breadcrumb.Item>
                </Breadcrumb>
                <h1 className={styles.title}>{config.title}</h1>
                <p className={styles.description}>{config.description}</p>
            </div>
            {config.canCreate && (
                <Button className={`${styles.addButton} d-inline-flex align-items-center justify-content-center gap-2`} onClick={onAdd}>
                    <Plus size={18} aria-hidden="true" />
                    Thêm nhân viên
                </Button>
            )}
        </header>

        <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
            {config.statItems.map(({ key, label, icon: Icon, tone }) => (
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
    </>
);

export default AccountSummary;
