import { useState } from 'react';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { RefreshCw, Search } from 'lucide-react';
import styles from './AccountFilters.module.css';

const AccountFilters = ({ filters, loading, onFilterChange, onRefresh }) => {
    const [searchValue, setSearchValue] = useState(filters.search);

    const handleSearch = (event) => {
        event.preventDefault();
        onFilterChange('search', searchValue.trim());
    };

    return (
        <Card.Header className={styles.header}>
            <Form role="search" onSubmit={handleSearch}>
                <Row className="g-2">
                    <Col xs={12} lg>
                        <InputGroup className={styles.control}>
                            <InputGroup.Text className={styles.searchIcon}>
                                <Search size={18} aria-hidden="true" />
                            </InputGroup.Text>
                            <Form.Control
                                type="search"
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder="Tìm theo tên hoặc email..."
                                aria-label="Tìm tài khoản"
                            />
                        </InputGroup>
                    </Col>
                    <Col xs={12} sm={6} lg="auto">
                        <Form.Select
                            className={styles.select}
                            value={filters.role}
                            onChange={(event) => onFilterChange('role', event.target.value)}
                            aria-label="Lọc theo vai trò"
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="customer">Khách hàng</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} sm={6} lg="auto">
                        <Form.Select
                            className={styles.select}
                            value={filters.status}
                            onChange={(event) => onFilterChange('status', event.target.value)}
                            aria-label="Lọc theo trạng thái"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="blocked">Đã khóa</option>
                        </Form.Select>
                    </Col>
                    <Col xs="auto">
                        <Button
                            type="button"
                            variant="light"
                            className={styles.refreshButton}
                            onClick={onRefresh}
                            disabled={loading}
                            aria-label="Tải lại"
                            title="Tải lại"
                        >
                            <RefreshCw size={18} aria-hidden="true" />
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card.Header>
    );
};

export default AccountFilters;
