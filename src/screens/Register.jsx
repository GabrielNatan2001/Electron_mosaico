import { useState } from "react";
import { Mail, Eye, EyeOff, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import DarkModeToggle from "@/components/theme/darkToggleMode.jsx";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cadastrarAsync } from "@/api/services/authServices";
import Logo from "@/components/Logo";
import { LanguageSelect } from "@/components/LanguageSelect";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerValidation } from "@/validations/auth/registerValidation";
import clsx from "clsx";
import ModalTermos from "@/components/Termos/ModalTermos";

export default function Register() {
  const { t } = useTranslation();

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const schema = registerValidation(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const response = await cadastrarAsync(userData);

      toast.success(t("register.emailSent"));

      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || t("errorOnLogin")
      );
    } finally {
      setLoading(false);
    }
  };

  const onInvalidSubmit = () => {
    toast.error(t("tesselaModal.requiredFields"));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 theme-gradient">
      <DarkModeToggle />
      <Logo />
      <ModalTermos />
      <Card className="w-full max-w-md bg-white/10 dark:bg-white/5 text-inherit shadow-lg border border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-center text-foreground">
            {t("title")}
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit(handleRegister, onInvalidSubmit)}>
          <CardContent className="space-y-6">
            <div className="relative">
              <Input
                type="text"
                name="nome"
                {...register("nome")}
                placeholder={
                  errors.nome
                    ? t("login.nameRequired")
                    : t("username.placeholder")
                }
                className={clsx(
                  "pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60",
                  "focus:ring-[#7aa0d3] dark:focus:ring-white/30 border!",
                  errors.nome
                    ? "!border-red-500 !placeholder-red-500"
                    : "!border-[#a8b6d3] dark:border-white/20"
                )}
              />
              <User
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 transform text-black/50 dark:text-white/60"
              />
            </div>

            <div className="relative">
              <Input
                type="email"
                name="email"
                {...register("email")}
                placeholder={
                  errors.email
                    ? `${errors.email.message}`
                    : t("email.placeholder")
                }
                className={clsx(
                  "pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60",
                  "focus:ring-[#7aa0d3] dark:focus:ring-white/30 border!",
                  errors.email
                    ? "!border-red-500 !placeholder-red-500"
                    : "!border-[#a8b6d3] dark:border-white/20"
                )}
              />
              <Mail
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 transform text-black/50 dark:text-white/60"
              />
            </div>

            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                name="senha"
                {...register("senha")}
                placeholder={
                  errors.senha
                    ? t("login.passwordRequired")
                    : t("password.label")
                }
                className={clsx(
                  "pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60",
                  "focus:ring-[#7aa0d3] dark:focus:ring-white/30 border!",
                  errors.senha
                    ? "!border-red-500 !placeholder-red-500"
                    : "!border-[#a8b6d3] dark:border-white/20"
                )}
              />
              <div
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-black/50 dark:text-white/60"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </div>
            </div>

            <LanguageSelect />
          </CardContent>

          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white hover:brightness-110 dark:bg-white/10 dark:hover:bg-white/20 dark:bg-none transition-colors duration-200"
              disabled={loading}
            >
              {loading
                ? t("button.primary.loading")
                : t("button.primary.register")}
            </Button>

            <div className="flex justify-between w-full text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-primary">
                {t("register.backToLogin")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      <div className="py-4 text-center text-xs space-y-1 text-muted-foreground">
        <p>{t("appVersion")}</p>
        <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </div>
  );
}
