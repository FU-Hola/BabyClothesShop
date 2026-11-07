import { Spinner } from "react-bootstrap";
export default function WarehouseLoading() {
    return (
        <main className="p-5 text-center" role="status">
            <Spinner as="span" size="sm" className="me-2" />
            Đang mở màn hình kho…
        </main>
    );
}
