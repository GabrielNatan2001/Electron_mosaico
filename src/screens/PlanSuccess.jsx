import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/theme/darkToggleMode";
import Logo from "@/components/Logo";

import { useAuth } from "@/context/AuthContext.jsx";
import { obterPlanoPorProprietarioId } from "@/api/services/proprietarioService";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function PlanSuccess() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setPlano } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoToDashboard = async () => {
    try {
      setLoading(true);
      const response = await obterPlanoPorProprietarioId();

      setPlano(response.data.nome);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || t("error.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#dce7f5] dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-black dark:text-white px-4">
      <DarkModeToggle className="absolute top-4 right-4" />

      <div className="text-center flex flex-col items-center justify-center max-w-2xl gap-6 p-6 backdrop-blur-sm bg-white/70 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10">
        <Logo />

        <h1 className="text-2xl font-semibold flex items-center justify-center gap-2">
          {t("success.title")}{" "}
          <CheckCircle2 className="text-emerald-500 w-6 h-6" />
        </h1>

        <p className="text-base">{t("success.message")}</p>
        <p className="text-base">{t("success.details")}</p>
        <p className="text-sm text-muted-foreground">{t("success.notice")}</p>

        <Button
          onClick={handleGoToDashboard}
          disabled={loading}
          className={`w-full bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white hover:brightness-110 dark:bg-white/10 dark:hover:bg-white/20 dark:bg-none transition-colors duration-200 ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
          ) : (
            t("success.button")
          )}
        </Button>
      </div>
    </div>
  );
}
