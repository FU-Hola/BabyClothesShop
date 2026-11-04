import { useContext, useEffect, useId } from "react";
import { WarehouseDraftContext } from "../context/WarehouseDraftContext.js";
export function useWarehouseDraft(dirty) {
    const update = useContext(WarehouseDraftContext);
    const id = useId();
    useEffect(() => {
        update?.(id, dirty);
        return () => update?.(id, false);
    }, [id, dirty, update]);
}
