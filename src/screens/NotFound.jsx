import DarkModeToggle from "@/components/theme/darkToggleMode";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="h-screen flex items-center justify-center min-h-screen 
        bg-gradient-to-b from-[#fefefe] via-[#f5f8fb] to-[#e8eef5] dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-gray-900 dark:text-white">
            <div className="flex flex-col items-center gap-6 text-center p-4 sm:p-0">
                <img className="max-w-20 max-h-20" src="./src/assets/novalogo.png" alt="Mosaico TLM Manager" />
                    <h1 className="sm:text-4xl text-2xl">Mosaico TLM Manager</h1>
                    <TriangleAlert className="min-w-10 min-h-10" />
                    <h2 className="sm:text-2xl text-lg flex items-center gap-3">{t("notFoundPage.erro")}</h2>
                    <h2 className="sm:text-2xl text-lg flex items-center gap-3">{t("notFoundPage.paginaNaoDisponivel")}</h2>
                    <Button onClick={() => navigate("/")} className="cursor-pointer">{t("notFoundPage.voltarInicio")}</Button>
            </div>
        </div>
    )
}

export default NotFound;
