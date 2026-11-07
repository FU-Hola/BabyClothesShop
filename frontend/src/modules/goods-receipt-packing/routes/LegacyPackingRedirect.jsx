import { Navigate, useParams } from "react-router-dom";
export default function LegacyPackingRedirect() {
    const { orderCode } = useParams();
    return (
        <Navigate to={`/warehouse-staff/issues?keyword=${encodeURIComponent(orderCode)}`} replace />
    );
}
