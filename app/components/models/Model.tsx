'use client'

import { useCallback, useEffect, useState } from "react";

interface ModelPros {
    isOpen?: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title?: string;
    body?: React.ReactElement;
    footer?: React.ReactElement;
    actionLabel: string;
    disabled?: boolean;
    secondaryAction?: () => void;
    secondaryLabel?: string;
}

const Model: React.FC<ModelPros> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    body,
    footer,
    actionLabel,
    disabled,
    secondaryAction,
    secondaryLabel

}) => {

    const [showModel, setShowModel] = useState(isOpen)

    useEffect(() => {
       setShowModel(isOpen);

    },[isOpen])

    const handleClose = useCallback(() => {
        if(disabled){
            return;
        }

        setShowModel(false);
        setTimeout(() => {
            onClose();
        },300)
    },[disabled, onclose])

    const handleSubmit = useCallback(() => {
        if(disabled){
            return;
        }

        onSubmit();
    },[disabled, onSubmit]);

    const handleSecondayAction = useCallback(() =>{
        if(disabled || !secondaryAction){
            return;
        }
        secondaryAction();
    },[disabled, secondaryAction])

    if(!isOpen){
        return null;
    }

    return (
        
        <>
        <div className="
                 justify-center
                 items-center
                 fles
                 overflow-x-hidden
                 overflow-y-auto
                 fixed
                 inset-0
                 z-50
                 outline-none
                 focus:outline-none
                 bg-neutral-800/70
        "></div>
        </>
    )
}

export default Model;