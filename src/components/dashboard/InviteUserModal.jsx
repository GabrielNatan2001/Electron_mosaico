import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { convidarUsuario } from "@/api/services/proprietarioService";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { convidarUsuarioValidation } from "@/validations/dashboard/convidarUsuarioValidation";
import clsx from "clsx";

function MosaicSelector({ mosaicos, watch, setValue }) {
  const { t } = useTranslation();
  const all = mosaicos.map((m) => m.id);
  const selected = watch("IdsMosaicosQuePodeAcessar");

  const toggle = (id) => {
    const next = selected.includes(id)
      ? selected.filter((i) => i !== id)
      : [...selected, id];
    setValue("IdsMosaicosQuePodeAcessar", next);
  };

  const toggleAll = () => {
    const next = selected.length === all.length ? [] : all;
    setValue("IdsMosaicosQuePodeAcessar", next);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleAll}
        title={t("dashboard.selectAllMosaics")}
        className="absolute right-2 -top-6 text-xs font-medium underline hover:text-green-700 dark:hover:text-green-300 transition"
      >
        {t("dashboard.selectAllMosaics")}
      </button>

      <div className="rounded-lg overflow-y-auto max-h-[168px] space-y-1">
        {mosaicos.map((m) => {
          const on = selected.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition ${
                on
                  ? "bg-green-600/20 text-green-800 dark:bg-green-400/10 dark:text-green-200"
                  : "hover:bg-white/10 text-black dark:text-white"
              }`}
            >
              <span className="text-sm">{m.nome}</span>
              <span
                className={`w-3 h-3 rounded-full border border-white transition ${
                  on ? "bg-white" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function InviteUserModal({ open, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { mosaicos } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(convidarUsuarioValidation(t)),
    defaultValues: {
      funcao: "operador",
      IdsMosaicosQuePodeAcessar: [],
    },
  });

  const handleInvite = async (form) => {
    setLoading(true);

    try {
      const response = await convidarUsuario(form);
      toast.success(response.message);
      onSuccess();
      onClose();
    } catch ({ status, response: { data } }) {
      status === 403
        ? toast.error(t("invite.error403"))
        : toast.error(data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#f9fafb] dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-zinc-900 dark:text-white p-6 rounded-xl border-zinc-200 dark:border-white/10 shadow-xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-zinc-800 dark:text-white text-xl">
            {t("invite.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 mt-4">
          <Input
            placeholder={
              errors.nome?.message
                ? `${errors.nome.message}`
                : `${t("register.name")}`
            }
            className={clsx(
              "bg-white dark:bg-white/10 pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60",
              "focus:ring-[#7aa0d3] dark:focus:ring-white/30 border!",
              errors.nome ? "!border-red-500 !placeholder-red-500" : ""
            )}
            {...register("nome")}
          />

          <Input
            type="email"
            {...register("email")}
            placeholder={
              errors.email?.message
                ? `${errors.email.message}`
                : `${t("email.label")}`
            }
            className={clsx(
              "bg-white dark:bg-white/10 pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60",
              "focus:ring-[#7aa0d3] dark:focus:ring-white/30 border!",
              errors.email ? "!border-red-500 !placeholder-red-500" : ""
            )}
          />

          <div className="space-y-1">
            <Label className="text-zinc-700 dark:text-white/90 mb-2">
              {t("invite.role")}
            </Label>
            <Controller
              control={control}
              name="funcao"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-white dark:bg-white/10 text-zinc-800 dark:text-white border border-zinc-300 dark:border-white/20">
                    <SelectValue placeholder={t("invite.selectRole")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10">
                    <SelectItem value="design">
                      {t("invite.roles.diretor")}
                    </SelectItem>
                    <SelectItem value="operador">
                      {t("invite.roles.colaborador")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.funcao && (
              <p className="text-sm text-red-500 mt-1">
                {errors.funcao.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-zinc-700 dark:text-white/90 mb-2">
              {t("dashboard.yourMosaics")}
            </Label>
            <MosaicSelector
              mosaicos={mosaicos}
              setValue={setValue}
              watch={watch}
            />
          </div>

          <Button
            className="w-full bg-[#283e60] hover:bg-[#2c3958] text-white dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center gap-2"
            onClick={handleSubmit(handleInvite)}
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {t("invite.send")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
