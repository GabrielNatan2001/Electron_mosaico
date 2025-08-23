import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Send } from "lucide-react";
import DarkModeToggle from "@/components/theme/darkToggleMode";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import Logo from "@/components/Logo";
import { toast } from "react-toastify";
import { esqueceuSenhaAsync } from "@/api/services/authServices";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await esqueceuSenhaAsync({ email });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 4000);
    } catch ({ status, response: { data } }) {
      const mensagemErro = data?.message || t("recover.error");
      toast.error(mensagemErro);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 theme-gradient">
      <DarkModeToggle />
      <Logo />
      <Card className="w-full max-w-md bg-white/10 dark:bg-white/5 text-inherit shadow-lg border border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-center text-foreground">
            {t("recover.title")}
          </CardTitle>
        </CardHeader>

        {success ? (
          <CardContent className="text-center py-10 space-y-4">
            <Send className="mx-auto text-blue-500 w-12 h-12 animate-bounce" />
            <h2 className="text-xl font-semibold">
              {t("recover.successTitle")}
            </h2>
            <p className="text-sm text-white/80 dark:text-white/70">
              {t("recover.successDescription")}
            </p>
          </CardContent>
        ) : (
          <form>
            <CardContent className="space-y-6">
              <p className="text-center text-sm text-[#4a4a4a] dark:text-white/60">
                {t("recover.description")}
              </p>

              <div className="relative">
                <Input
                  type="email"
                  placeholder={t("email.placeholder")}
                  className="w-full pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60 border border-[#a8b6d3] dark:border-white/20 focus:ring-[#7aa0d3] dark:focus:ring-white/30"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transform text-black/50 dark:text-white/60"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 mt-5">
              <Button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white hover:brightness-110 dark:bg-white/10 dark:hover:bg-white/20 dark:bg-none transition-colors duration-200"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  t("recover.button")
                )}
              </Button>

              <Button
                asChild
                type="button"
                className="w-full bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white hover:brightness-110 dark:bg-white/10 dark:hover:bg-white/20 dark:bg-none transition-colors duration-200"
              >
                <Link to="/login">{t("recover.back")}</Link>
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>

      <div className="py-4 text-center text-xs space-y-1 text-muted-foreground">
        <p>{t("appVersion")}</p>
        <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </div>
  );
}
