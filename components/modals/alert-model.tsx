"use-client";

import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";

interface AlertModelProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export const AlertModel: React.FC<AlertModelProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading
}) => {
    const [isMounted, setIsMounted]=useState(false);

    useEffect(() => {
        setIsMounted(true);
    },[])

    if(!isMounted) {
        return null;
    }

    return (
        <Modal title="are you sure?" description="This action can't be undone." isOpen={isOpen} onClose={onClose}>
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button disabled={loading} variant={"outline"} onClick={onClose}>cancel</Button>
                <Button disabled={loading} variant={"destructive"} onClick={onConfirm}>continue</Button>
            </div>
        </Modal>
    )
}