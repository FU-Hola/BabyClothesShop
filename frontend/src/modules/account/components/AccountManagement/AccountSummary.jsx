import { Breadcrumb, Button, Card, Col, Row } from 'react-bootstrap';
import { ArrowUpRight, Plus } from 'lucide-react';
import styles from './AccountSummary.module.css';

const AccountSummary = ({ config, stats, onAdd }) => (
    <>
        <header className={styles.header}>
            <div className={styles.heading}>
                <Breadcrumb className={styles.breadcrumb}>
                    <Breadcrumb.Item>Quản trị</Breadcrumb.Item>
                    <Breadcrumb.Item active>{config.section}</Breadcrumb.Item>
                </Breadcrumb>
                <h1 className={styles.title}>{config.title}</h1>
                <p className={styles.description}>{config.description}</p>
            </div>
            {config.canCreate && (
                <Button className={styles.addButton} onClick={onAdd}>
                    <Plus size={18} aria-hidden="true" />
                    Thêm nhân viên
                </Button>
            )}
        </header>

        <section aria-labelledby="account-overview-title" className={styles.overview}>
            <div className={styles.overviewHeader}>
                <div>
                    <h2 id="account-overview-title">Tổng quan tài khoản</h2>
                    <p>Số liệu theo trạng thái hiện tại</p>
                </div>
                <ArrowUpRight size={19} aria-hidden="true" />
            </div>
            <Row xs={1} sm={2} xl={4} className="g-3">
            {config.statItems.map(({ key, label, icon: Icon, tone }) => (
                <Col key={key}>
                    <Card className={`${styles.card} ${styles[tone]} h-100`}>
                        <Card.Body>
                            <div className={styles.cardTop}>
                                <Card.Subtitle className={styles.label}>{label}</Card.Subtitle>
                                <span className={styles.icon}>
                                    <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                                </span>
                            </div>
                            <Card.Text className={styles.value}>{stats[key] ?? 0}</Card.Text>
                            <span className={styles.caption}>Tài khoản</span>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
            </Row>
        </section>
    </>
);

export default AccountSummary;
