import { Alert, Button } from "react-bootstrap";
export default function WarehouseRouteError() {
    return (
        <main className="container py-5">
            <Alert variant="danger">
                <h1 className="h4">Không thể hiển thị màn hình kho</h1>
                <p>Vui lòng tải lại trang. Nếu lỗi tiếp tục, liên hệ người quản trị.</p>
                <Button onClick={() => window.location.reload()}>Tải lại</Button>
                <a className="ms-3" href="/warehouse-staff/stock">
                    Về tồn kho
                </a>
            </Alert>
        </main>
    );
}
