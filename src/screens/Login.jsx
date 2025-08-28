import { useEffect, useState } from "react";
import { Mail, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import DarkModeToggle from "@/components/theme/darkToggleMode.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ModalTermos from "@/components/Termos/ModalTermos";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { loginAsync } from "@/api/services/authServices";
import Logo from "@/components/Logo";
import { LanguageSelect } from "@/components/LanguageSelect";
import { loginValidation } from "@/validations/auth/loginValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import clsx from "clsx";

export default function Login() {
  const { t } = useTranslation();

  const schema = loginValidation(t);

  const [showPass, setShowPass] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [isAutheticate, setIsAuthenticate] = useState(false);
  const [mosaicos, setMosaicos] = useState([]);
  const [mosaicoId, setMosaicoId] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, salvarMosaicos } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (userData) => {
    setLoading(true);
    try {
      if (!isAutheticate) {
        const data = await loginAsync(userData);

        // Debug: verificar estrutura dos dados
        console.log('Dados do login:', data);
        console.log('userId:', data.userId);

        login(data);
        setIsAuthenticate(true);

        setMosaicos(data.mosaicosDisponiveis);
        salvarMosaicos(data.mosaicosDisponiveis);

        if (data.ehAdmin) {
          navigate("/dashboard");
          toast.success(t("dashboard.adminSuccess"));
          return;
        }
      } else {
        if (!mosaicoId) {
          toast.error(t("login.selectMosaic"));
          return;
        }
        navigate(`/mosaico/${mosaicoId}`);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || t("errorOnLogin")
      );
    } finally {
      setLoading(false);
    }
  };

  function handleChangeSelect(value) {
    setMosaicoId(value);
  }

  useEffect(() => {
    const handleAutoFill = () => {
      const values = getValues();
      if (values.email && values.senha && !isAutheticate) {
        handleSubmit(handleLogin)();
      }
    };

    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="senha"]');

    emailInput?.addEventListener("change", handleAutoFill);
    passwordInput?.addEventListener("change", handleAutoFill);

    return () => {
      emailInput?.removeEventListener("change", handleAutoFill);
      passwordInput?.removeEventListener("change", handleAutoFill);
    };
  }, [getValues, isAutheticate]);

  useEffect(() => {
    if (!mosaicoId) {
      setMosaicoId(mosaicos[0]?.id);
    }
  }, [mosaicos]);

  return (
    <div
      className="
        min-h-screen
        flex flex-col items-center justify-center
        p-6
        theme-gradient
      "
    >
      <DarkModeToggle />
      <Logo />
      <Card className="w-full max-w-md bg-white/10 dark:bg-white/5 text-inherit shadow-lg border border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-center text-foreground">
            {t("title")}
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit(handleLogin)}>
          <CardContent className="space-y-6">
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
                    : "border-[#a8b6d3] dark:border-white/20"
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
                    : "border-[#a8b6d3] dark:border-white/20"
                )}
              />
              <div
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPass ? (
                  <EyeOff
                    className="text-black/50 dark:text-white/60"
                    size={16}
                  />
                ) : (
                  <Eye className="text-black/50 dark:text-white/60" size={16} />
                )}
              </div>
            </div>

            <LanguageSelect />

            <Select
              value={mosaicoId}
              onValueChange={handleChangeSelect}
              name="mosaidoId"
            >
              <SelectTrigger className="w-full px-4 text-foreground border border-[#a8b6d3] dark:border-white/20">
                <SelectValue placeholder={t("mosaico")} />
              </SelectTrigger>
              <SelectContent>
                {mosaicos.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>

          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#dc2626] via-[#b91c1c] to-[#991b1b] text-white hover:brightness-110 dark:bg-red-600 dark:hover:bg-red-700 dark:bg-none transition-colors duration-200"
              disabled={loading}
            >
              {loading
                ? t("button.primary.loading")
                : t("button.primary.normal")}
            </Button>

            <div className="flex justify-between w-full text-gray-700 dark:text-gray-300">
              <Link
                to="/forgot-password"
                className="hover:text-gray-900 dark:hover:text-white"
              >
                {t("forgotPassword")}
              </Link>
              <Link
                to="/register"
                className="hover:text-gray-900 dark:hover:text-white"
              >
                {t("register.link")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      <div className="py-4 text-center text-xs space-y-1 text-muted-foreground">
        <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      </div>
      <div className="pt-2 text-center text-sm text-muted-foreground">
        {t("footer.landingText")}{" "}
        <Link
          to="/info"
          className="inline-block font-medium text-primary transition-colors hover:text-primary/80"
        >
          {t("footer.landingLink")}
        </Link>
      </div>
    </div>
  );
}
