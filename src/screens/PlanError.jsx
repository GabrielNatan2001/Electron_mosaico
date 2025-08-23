import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"
import DarkModeToggle from "@/components/theme/darkToggleMode"

export default function PlanError() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="font-sans relative min-h-screen flex items-center justify-center bg-white dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-black dark:text-white px-4 overflow-hidden">
      <DarkModeToggle className="absolute top-4 right-4" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-[#2e3e5c] opacity-20 rounded-full blur-[180px] top-[-30%] left-[60%]" />
        <div className="absolute w-[350px] h-[350px] bg-[#1f2a40] opacity-30 rounded-full blur-[160px] bottom-[-20%] right-[55%]" />
      </div>

      <div className="backdrop-blur-lg bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-5">
        <img src="/src/assets/novalogo.png" alt="logo" className="w-20 h-20 mx-auto" />

        <h1 className="text-2xl font-semibold flex items-center justify-center gap-2">
          {t("error.payment.title")}
          <CircleX className="w-6 h-6 text-red-500" />
        </h1>

        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("error.payment.description")}
        </p>

        <Button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white hover:brightness-110 dark:bg-white/10 dark:hover:bg-white/20 dark:bg-none transition-colors duration-200"
        >
          {t("error.payment.button")}
        </Button>
      </div>
    </div>
  )
}