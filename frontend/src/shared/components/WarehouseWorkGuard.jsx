import { useCallback, useState } from "react";
import { useBeforeUnload, useBlocker } from "react-router-dom";
import { useIsMutating } from "@tanstack/react-query";
import { Button, Modal } from "react-bootstrap";
import { WarehouseDraftContext } from "../context/WarehouseDraftContext.js";

export default function WarehouseWorkGuard({ children }) {
    const [drafts, setDrafts] = useState({});
    const writing = useIsMutating({ mutationKey: ["warehouse-write"] }) > 0;
    const update = useCallback(
        (id, dirty) =>
            setDrafts((previous) => {
                if (Boolean(previous[id]) === dirty) return previous;
                const next = { ...previous };
                if (dirty) next[id] = true;
                else delete next[id];
                return next;
            }),
        [],
    );
    const dirty = Object.keys(drafts).length > 0;
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            (dirty || writing) &&
            (currentLocation.pathname !== nextLocation.pathname ||
                currentLocation.search !== nextLocation.search),
    );
    useBeforeUnload(
        useCallback(
            (event) => {
                if (dirty || writing) {
                    event.preventDefault();
                    event.returnValue = "";
                }
            },
            [dirty, writing],
        ),
    );
    return (
        <WarehouseDraftContext.Provider value={update}>
            {children}
            <Modal show={blocker.state === "blocked"} onHide={() => blocker.reset?.()} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{writing ? "Đang xử lý" : "Rời trang?"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {writing
                        ? "Vui lòng chờ máy chủ trả kết quả trước khi rời trang."
                        : "Thông tin chưa lưu sẽ bị mất khi rời trang."}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => blocker.reset?.()}>Ở lại</Button>
                    {!writing && (
                        <Button variant="outline-danger" onClick={() => blocker.proceed?.()}>
                            Bỏ thay đổi và rời trang
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </WarehouseDraftContext.Provider>
    );
}
