import { useState } from "react";
import { Eye, EyeOff, Send, AlertTriangle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DarkModeToggle from "@/components/theme/darkToggleMode";
import Logo from "@/components/Logo";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetarSenha } from "@/api/services/authServices";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetarSenha({
        email,
        token,
        novaSenha: password,
      });

      setSuccess(true);
    } catch (error) {
      toast(error.response?.data.message || "Erro ao alterar a senha.");
    } finally {
      setLoading(false);
    }
  };

  const renderInvalidCard = () => (
    <Card className="w-full max-w-md bg-white/10 dark:bg-white/5 text-inherit shadow-lg border border-white/10 backdrop-blur">
      <CardContent className="text-center py-10 space-y-4">
        <AlertTriangle className="mx-auto text-red-500 w-12 h-12" />
        <h2 className="text-xl font-semibold">
          {t("reset.invalidTitle", "Página não disponível")}
        </h2>
        <p className="text-sm text-white/80 dark:text-white/70">
          {t(
            "reset.invalidDescription",
            "O link de redefinição é inválido ou expirou."
          )}
        </p>
      </CardContent>
    </Card>
  );

  const renderSuccessCard = () => (
    <Card className="w-full max-w-md bg-white/10 dark:bg-white/5 text-inherit shadow-lg border border-white/10 backdrop-blur">
      <CardContent className="text-center py-10 space-y-4">
        <Send className="mx-auto text-green-400 w-12 h-12" />
        <h2 className="text-xl font-semibold">
          {t("reset.successTitle", "Parabéns!")}
        </h2>
        <p className="text-sm text-white/80 dark:text-white/70">
          {t("reset.successDescription", "Sua senha foi alterada com sucesso.")}
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          asChild
          className="bg-white text-black border border-black/10 hover:bg-neutral-300 transition"
        >
          <Link to="/login">{t("reset.loginButton", "Realizar login")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 theme-gradient">
      <DarkModeToggle />
      <Logo />

      {!token || !email ? (
        <Card className="w-full max-w-md bg-white/10 dark:bg-white/5 text-inherit shadow-lg border border-white/10 backdrop-blur">
          <CardContent className="text-center py-10 space-y-4">
            <AlertTriangle className="mx-auto text-red-500 w-12 h-12" />
            <h2 className="text-xl font-semibold">
              {t("reset.invalidTitle", "Página não disponível")}
            </h2>
            <p className="text-sm text-[#4a4a4a] dark:text-white/70">
              {t(
                "reset.invalidDescription",
                "O link de redefinição é inválido ou expirou."
              )}
            </p>
          </CardContent>
        </Card>
      ) : success ? (
        <Card className="w-full max-w-md bg-white/10 dark:bg-white/5 text-inherit shadow-lg border border-white/10 backdrop-blur">
          <CardContent className="text-center py-10 space-y-4">
            <Send className="mx-auto text-green-400 w-12 h-12" />
            <h2 className="text-xl font-semibold">
              {t("reset.successTitle", "Parabéns!")}
            </h2>
            <p className="text-sm text-[#4a4a4a] dark:text-white/70">
              {t(
                "reset.successDescription",
                "Sua senha foi alterada com sucesso."
              )}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white hover:brightness-110 dark:bg-white/10 dark:hover:bg-white/20 dark:bg-none transition-colors duration-200"
            >
              <Link to="/login">
                {t("reset.loginButton", "Realizar login")}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-md bg-white/10 dark:bg-white/5 text-inherit shadow-lg border border-white/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-foreground">
              {t("reset.title")}
            </CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <p className="text-center text-sm text-[#4a4a4a] dark:text-white/60">
                {t("reset.description")}
              </p>

              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder={t("reset.placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60 border border-[#a8b6d3] dark:border-white/20 focus:ring-[#7aa0d3] dark:focus:ring-white/30"
                />
                <div
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-black/50 dark:text-white/60"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 mt-5">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white hover:brightness-110 dark:bg-white/10 dark:hover:bg-white/20 dark:bg-none transition-colors duration-200"
              >
                {loading
                  ? t("reset.loading", "Enviando...")
                  : t("reset.button")}
              </Button>

              <Button
                asChild
                type="button"
                className="w-full bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white hover:brightness-110 dark:bg-white/10 dark:hover:bg-white/20 dark:bg-none transition-colors duration-200"
              >
                <Link to="/login">{t("reset.back")}</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="py-4 text-center text-xs space-y-1 text-muted-foreground">
        <p>{t("appVersion")}</p>
        <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </div>
  );
}
