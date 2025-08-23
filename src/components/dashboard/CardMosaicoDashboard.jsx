import React, { useEffect, useState } from "react";
import { Loader2, Calendar, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { atualizarMosaicoAsync } from "@/api/services/mosaicoService";
import { useAuth } from "@/context/AuthContext";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from "../ui/select";
import { Input } from "../ui/input";
import { toast } from "react-toastify";
import { LanguageSelect } from "../LanguageSelect";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { cardMosaicoValidator } from "@/validations/dashboard/cardMosaicoValidator";

export function CardMosaicoDashboard({ mosaic }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { ehAdmin, fetchMosaicos, proprietarioId } = useAuth();
  const [isMosaicoGlobal, setIsMosaicoGlobal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [publicarMosaico, setPublicarMosaico] = useState(!!mosaic.mosaicoPath);
  const [mosaicoPath, setMosaicoPath] = useState(mosaic.mosaicoPath ?? "");

  const { register, handleSubmit, reset } = useForm({
    resolver: yupResolver(cardMosaicoValidator),
    defaultValues: {
      nome: mosaic.nome,
      descricao: mosaic.descricao,
    },
  });

  useEffect(() => {
    if (publicarMosaico) {
      setMosaicoPath(mosaic.mosaicoPath ?? "");
    }
  }, [publicarMosaico, mosaic.mosaicoPath]);

  useEffect(() => {
    if (mosaic?.ehGlobal && mosaic?.proprietarioId !== proprietarioId) {
      setIsMosaicoGlobal(true);
    } else {
      setIsMosaicoGlobal(false);
    }
  }, [mosaic, proprietarioId]);

  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState(mosaic.idioma || "ptbr");
  const [ehGlobal, setEhGlobal] = useState(mosaic.ehGlobal ?? false);

  function openDialog(e) {
    e.stopPropagation();
    setIsOpen(true);
  }

  function closeDialog() {
    setIsOpen(false);
  }

  async function handleSave(data) {
    setIsLoading(true);
    try {
      const dadosAtualizados = {
        idMosaico: mosaic.id,
        nome: data.nome,
        descricao: data.descricao,
        ehGlobal,
        idioma: language,
        mosaicoPath: data.mosaicoPath,
      };

      const response = await atualizarMosaicoAsync(dadosAtualizados);
      await fetchMosaicos();
      toast.success(response?.message || t("cardMosaico.atualizadoSucesso"));
      setIsOpen(false);
    } catch ({ response: { data } }) {
      toast.error(data.message ?? t("cardMosaico.erroAtualizar"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative"
      >
        {mosaic.mosaicoPath && (
          <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-[2px] rounded-tr-md rounded-bl-md z-10">
            {t("cardMosaico.publico")}
          </div>
        )}

        {!mosaic.mosaicoPath && mosaic.ehGlobal && (
          <div className="absolute top-0 left-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-[2px] rounded-tr-md rounded-bl-md z-10">
            {t("cardMosaico.global")}
          </div>
        )}

        <Card
          key={mosaic.id}
          onClick={() => navigate("/mosaico/" + mosaic.id)}
          className={`h-38 relative cursor-pointer rounded-2xl border-[2px] transition-all duration-300 shadow-sm hover:shadow-xl hover:scale-[1.015] 
    ${
      mosaic.mosaicoPath
        ? "border-indigo-400 bg-[#eef1fb] hover:bg-[#e2e7fa]"
        : mosaic.ehGlobal
        ? "border-yellow-400 bg-yellow-50/30 hover:bg-yellow-100/40"
        : "border-blue-200 bg-blue-50/30 hover:bg-blue-100/40"
    }
    dark:bg-[#2e3e5c] dark:hover:bg-[#3b4d70] dark:border-white/10`}
        >
          <CardContent className="flex flex-col justify-between h-full px-4">
            <div className="space-y-1">
              <h3 className="text-md font-semibold truncate">{mosaic.nome}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                {mosaic.descricao}
              </p>
            </div>

            <div className="mt-2 text-[12px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center text-xs gap-2 text-gray-700 dark:text-gray-200">
                <Calendar size={12} />
                <span>
                  {t("dashboard.dataUltimaAtualizacao")} :{" "}
                  {mosaic.dataUltimaAtualizacao}
                </span>
              </div>
              {t("cardMosaico.tesselas")}: {mosaic.quantidadeTesselas}
            </div>
          </CardContent>

          {!isMosaicoGlobal && (
            <button
              onClick={openDialog}
              aria-label={`Editar mosaico ${mosaic.nome}`}
              className="absolute bottom-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Pencil className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </Card>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#f9fafb] dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-zinc-900 dark:text-white p-6 rounded-xl w-full max-w-md border border-zinc-200 dark:border-white/10 shadow-xl flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-zinc-800 dark:text-white text-xl">
              {t("cardMosaico.editar")}
            </DialogTitle>
          </DialogHeader>
          {mosaicoPath && publicarMosaico && (
            <div className="mt-2 text-sm flex gap-1 items-center break-all">
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">
                🔗 Seu link público:
              </span>
              <a
                href={`https://www.mosaicotlm.app/publicos/${mosaicoPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-700 dark:text-indigo-300 text-xs underline hover:opacity-80"
              >
                https://www.mosaicotlm.app/publicos/{mosaicoPath}
              </a>
            </div>
          )}

          <div className="space-y-4 mt-4 flex-1">
            <Input
              {...register("nome")}
              placeholder={t("cardMosaico.nomePlaceholder")}
              className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
            />

            <Input
              {...register("descricao")}
              placeholder={t("cardMosaico.descricaoPlaceholder")}
              className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
            />

            {ehAdmin && (
              <>
                <div>
                  <LanguageSelect
                    currentLanguage={language}
                    onLanguageChange={setLanguage}
                  />
                </div>
                <div>
                  <Label className="text-zinc-800 my-5 dark:text-white">
                    {t("cardMosaico.mosaicoGlobal")}
                  </Label>
                  <Select
                    value={(ehGlobal ?? false).toString()}
                    onValueChange={(value) => {
                      const novoEhGlobal = value === "true";

                      if (mosaic.mosaicoPath && !novoEhGlobal) {
                        toast.error(
                          t("cardMosaico.erroPrivatizarSemRemoverPublico")
                        );
                        return;
                      }

                      setEhGlobal(novoEhGlobal);
                    }}
                    className="mt-2 bg-white dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/20"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("cardMosaico.selecione")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">
                        {t("cardMosaico.sim")}
                      </SelectItem>
                      <SelectItem value="false">
                        {t("cardMosaico.nao")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {ehGlobal && (
                    <div className="mt-6">
                      {mosaic.mosaicoPath && publicarMosaico ? (
                        <div className="flex flex-col gap-3">
                          <p className="text-base font-semibold text-zinc-800 dark:text-white">
                            {t("cardMosaico.jaPublico")}
                          </p>
                          <Button
                            variant="outline"
                            className="h-10 px-6 text-base font-semibold bg-white border-red-300 text-red-700 hover:bg-red-100 dark:bg-[#2e3e5c] dark:text-white dark:hover:bg-[#3b4d70] dark:border-[#455a7a]"
                            onClick={async () => {
                              setPublicarMosaico(false);
                              setMosaicoPath(null);

                              reset({
                                nome: mosaic.nome,
                                descricao: mosaic.descricao,
                                mosaicoPath: null,
                              });

                              await handleSubmit(handleSave)();
                              setIsOpen(false);
                            }}
                          >
                            {t("cardMosaico.tornarPrivado")}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label className="text-base font-semibold text-zinc-800 dark:text-white">
                            {t("cardMosaico.desejaTornarPublico")}
                          </Label>
                          <Select
                            value={publicarMosaico.toString()}
                            onValueChange={(value) =>
                              setPublicarMosaico(value === "true")
                            }
                          >
                            <SelectTrigger className="w-full bg-white dark:bg-white/10 border border-zinc-300 dark:border-white/20 text-zinc-900 dark:text-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Sim</SelectItem>
                              <SelectItem value="false">Não</SelectItem>
                            </SelectContent>
                          </Select>

                          {publicarMosaico && (
                            <Input
                              {...register("mosaicoPath")}
                              defaultValue={mosaicoPath ?? ""}
                              placeholder={t("cardMosaico.exemploPath")}
                              className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/60 border border-zinc-300 dark:border-white/20"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="pt-4 flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-1/2 dark:bg-white/10 dark:hover:bg-white/20"
              onClick={closeDialog}
              disabled={isLoading}
            >
              {t("cardMosaico.cancelar")}
            </Button>
            <Button
              type="submit"
              className="w-1/2 bg-[#283e60] hover:bg-[#2c3958] text-white dark:bg-white/10 dark:hover:bg-white/20 flex justify-center items-center gap-2"
              onClick={handleSubmit(handleSave)}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="animate-spin w-5 h-5" />}
              {!isLoading && t("cardMosaico.salvar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
