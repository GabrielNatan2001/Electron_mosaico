import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { XOctagon, ShieldAlert, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function BotaoCancelarPlano() {
  const { t } = useTranslation();
  const [etapa, setEtapa] = useState(0);
  const [aberto, setAberto] = useState(false);

  const fecharDialogo = () => {
    setEtapa(0);
    setAberto(false);
  };

  const cancelarPlano = () => {
    toast.success(t("cancelarPlano.toast.sucesso"));
    fecharDialogo();
  };

  return (
    <>
      <Button
        onClick={() => setAberto(true)}
        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition"
      >
        {t("cancelarPlano.botao")}
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="overflow-hidden flex items-center justify-center bg-white dark:bg-[#1f2a40] p-0 w-full max-w-lg rounded-2xl border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-blue-900/5" />

          <DialogClose asChild>
            <button
              type="button"
              className="absolute top-4 right-4 z-50 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <X size={20} className=" absolute -top-0.5 -right-0.5" />
            </button>
          </DialogClose>

          <div className="relative z-10 p-8 flex flex-col gap-6">
            <DialogHeader className="flex flex-col items-center gap-2">
              {etapa === 0 ? (
                <ShieldAlert size={40} className="text-yellow-400" />
              ) : (
                <XOctagon size={40} className="text-red-600" />
              )}
              <DialogTitle className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
                {etapa === 0
                  ? t("cancelarPlano.dialogo.titulo")
                  : t("cancelarPlano.dialogo.confirmar")}
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm text-center text-zinc-700 dark:text-zinc-300">
              {t(`cancelarPlano.dialogo.etapas.${etapa + 1}`)}
            </p>

            <DialogFooter className="w-full flex items-center justify-center gap-4">
              <Button variant="ghost" onClick={fecharDialogo} className="w-32">
                {t("cancelarPlano.dialogo.voltar")}
              </Button>

              {etapa < 1 ? (
                <Button
                  onClick={() => setEtapa(1)}
                  className="w-32 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t("cancelarPlano.dialogo.continuar")}
                </Button>
              ) : (
                <div className="text-sm text-center">
                  {t("cancelarPlano.entrarEmContato")}
                  <strong> suporte@mosaicotlm.app</strong>
                </div>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
