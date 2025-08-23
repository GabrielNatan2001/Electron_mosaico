import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { alterarSenha } from "@/api/services/authServices";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { UpdateNome } from "@/api/services/proprietarioService";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { settingsValidation } from "@/validations/toolbar/MaintenancePanel/settingsValidation";
import clsx from "clsx";

export default function SettingsModal({ open, onClose }) {
  const { t } = useTranslation();
  const [isEditable, setIsEditable] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { nomeEmpresa, emailUsuario, setNomeEmpresa } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(settingsValidation(t)),
    defaultValues: {
      nome: nomeEmpresa || "",
      email: emailUsuario || "",
      senha: "",
      confirmarSenha: "",
    },
  });

  const handlePasswordChange = async (data) => {
    try {
      if (data.senha !== data.confirmarSenha) {
        toast(t("settingsModal.passwordsMustBeTheSame"));
        return;
      }

      await alterarSenha({ email: data.email, novaSenha: data.senha });
      toast(t("settingsModal.passwordSuccess"));
      onClose();
    } catch (error) {
      toast(error.response?.data.message || "Erro ao alterar a senha.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditable(false);
  };

  const handleSaveEdit = async (userData) => {
    const data = await UpdateNome({
      email: userData.email,
      nome: userData.nome,
    });
    if (data) {
      setNomeEmpresa(name);
      setIsEditable(false);
      toast(t("settingsModal.nameUpdated"));
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#f9fafb] dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-zinc-900 dark:text-white p-6 rounded-xl border border-white/10 shadow-xl space-y-4">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-white text-xl">
            {t("settingsModal.title")}
          </DialogTitle>
        </DialogHeader>

        {!isEditable && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-300 text-xs rounded-md p-3">
            {t("settingsModal.editInfoWarning")}
          </div>
        )}

        <div className="space-y-3">
          <div className="relative">
            <Input
              {...register("nome")}
              disabled={!isEditable}
              placeholder={t("settingsModal.namePlaceholder")}
              className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/20 pr-10"
            />
            <Pencil
              size={16}
              className="absolute top-2.5 right-3 text-zinc-400 cursor-pointer hover:text-zinc-600"
              onClick={() => setIsEditable(true)}
            />
          </div>

          {isEditable && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="text-sm px-3 py-1"
              >
                {t("settingsModal.cancel")}
              </Button>
              <Button
                className="text-sm px-3 py-1"
                onClick={handleSubmit(handleSaveEdit)}
              >
                {t("settingsModal.save")}
              </Button>
            </div>
          )}
          <div className="relative">
            <Input
              value={emailUsuario}
              disabled
              placeholder={t("settingsModal.emailPlaceholder")}
              className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/20 pr-10"
            />
          </div>

          <div className="relative">
            <Input
              type={showPass ? "text" : "password"}
              {...register("senha")}
              placeholder={
                errors.senha
                  ? `${errors.senha.message}`
                  : `${t("password.label")}`
              }
              className={clsx(
                "bg-white dark:bg-white/10 pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60",
                "focus:ring-[#7aa0d3] dark:focus:ring-white/30 border!",
                errors.senha ? "!border-red-500 !placeholder-red-500" : ""
              )}
            />
            <div
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-white opacity-50"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
          </div>
          <div className="relative">
            <Input
              type={showPass ? "text" : "password"}
              {...register("confirmarSenha")}
              placeholder={
                errors.confirmarSenha
                  ? `${errors.confirmarSenha.message}`
                  : `${t("settingsModal.confirmPassword")}`
              }
              className={clsx(
                "bg-white dark:bg-white/10 pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60",
                "focus:ring-[#7aa0d3] dark:focus:ring-white/30 border!",
                errors.confirmarSenha
                  ? "!border-red-500 !placeholder-red-500"
                  : ""
              )}
            />
            <div
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-white opacity-50"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
          </div>

          <div className="pt-4">
            <Button
              className="w-full bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white hover:brightness-110 dark:bg-white/10 dark:hover:bg-white/20 dark:bg-none transition-colors duration-200"
              onClick={handleSubmit(handlePasswordChange)}
            >
              {t("settingsModal.changePassword")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
