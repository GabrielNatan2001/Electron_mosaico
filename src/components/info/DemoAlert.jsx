import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import FaleConoscoModal from "../mosaico/FaleConoscoModal";

export const DemoAlert = () => {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    const handleFaleConosco = () => {
        setOpen(true);
    }

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-50 bg-red-500 py-3 text-center font-bold text-white shadow-md">
                <p>
                    {`${t('contact.mensageInfo')} `}
                    <a
                        onClick={handleFaleConosco}
                        className="underline underline-offset-2 transition-opacity hover:opacity-80"
                    >
                        {t('contact.talkToUs')}
                    </a>
                </p>
            </div>
            <FaleConoscoModal
                open={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
};