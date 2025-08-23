import { useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { criarMosaicoAsync } from "@/api/services/mosaicoService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LanguageSelect } from "../LanguageSelect";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { novoMosaicoValidation } from "@/validations/dashboard/novoMosaicoValidation";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

export default function NovoMosaicoModal({ open, onClose }) {
  const { t } = useTranslation();
  const [ehGlobal, setEhGlobal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("pt-BR");
  const { fetchMosaicos } = useAuth();
  const { ehAdmin, salvarMosaicos } = useAuth();
  const [publicarMosaico, setPublicarMosaico] = useState(false);
  const [rotaPublica, setRotaPublica] = useState("");

  const {
    register,
    handleSubmit: onSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(novoMosaicoValidation(t)),
  });

  const handleSubmit = async (formData) => {
    setIsLoading(true);

    const novoMosaico = {
      nome: formData.nome,
      descricao: formData.descricao,
      ehGlobal,
      mosaicoPath: rotaPublica,
      idioma: language,
    };

    try {
      const response = await criarMosaicoAsync(novoMosaico);

      const novoItem = {
        id: response.data.id,
        nome: response.data.nome,
        descricao: response.data.descricao,
        quantidadeTesselas: response.data.tesselas?.length ?? 0,
        idioma: response.data.idioma,
        dataCadastro: format(
          new Date(response.data.dataCadastro),
          "dd/MM/yyyy",
          { locale: ptBR }
        ),
        dataUltimaAtualizacao: format(
          new Date(response.data.dataUltimaAtualizacao),
          "dd/MM/yyyy",
          { locale: ptBR }
        ),
      };

      await fetchMosaicos();

      toast.success(response.message);
      reset();
      onClose();
    } catch ({ response: { data } }) {
      const errorMessage = data?.message || "Erro ao criar o mosaico.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setEhGlobal(false);
      setLanguage("pt-BR");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#f9fafb] dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-zinc-900 dark:text-white p-6 rounded-xl border border-zinc-200 dark:border-white/10 shadow-xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-zinc-800 dark:text-white text-xl">
            Novo Mosaico
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 flex-1">
          <Input
            placeholder={
              errors.nome?.message
                ? `${errors.nome.message}`
                : `${t("tesselaModal.mosaicNameRequired")}`
            }
            className={clsx(
              "bg-white dark:bg-white/10 pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60",
              "focus:ring-[#7aa0d3] dark:focus:ring-white/30 border!",
              errors.nome ? "!border-red-500 !placeholder-red-500" : ""
            )}
            {...register("nome")}
          />

          <Input
            placeholder={
              errors.descricao
                ? `${errors.descricao.message}`
                : `${t("tesselaModal.description")}`
            }
            className={clsx(
              "bg-white dark:bg-white/10 pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60",
              "focus:ring-[#7aa0d3] dark:focus:ring-white/30 border!",
              errors.descricao ? "!border-red-500 !placeholder-red-500" : ""
            )}
            {...register("descricao")}
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
                  Mosaico Global?
                </Label>
                <Select
                  value={ehGlobal.toString()}
                  onValueChange={(value) => setEhGlobal(value === "true")}
                  className="mt-2 bg-white dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/20"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{ehGlobal ? "Sim" : "Não"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {ehGlobal && (
                <>
                  <div className="mt-4">
                    <Label className="text-zinc-800 my-5 dark:text-white">
                      Tornar Público?
                    </Label>
                    <Select
                      value={publicarMosaico.toString()}
                      onValueChange={(value) =>
                        setPublicarMosaico(value === "true")
                      }
                      className="mt-2 bg-white dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/20"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {publicarMosaico ? "Sim" : "Não"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {publicarMosaico && (
                    <Input
                      value={rotaPublica}
                      onChange={(e) => setRotaPublica(e.target.value)}
                      placeholder="Ex: /meu-mosaico"
                      className="mt-2 bg-white dark:bg-white/10 pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60 focus:ring-[#7aa0d3] dark:focus:ring-white/30 border border-zinc-300 dark:border-white/20"
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="pt-4">
          <Button
            className="w-full bg-[#283e60] hover:bg-[#2c3958] text-white dark:bg-white/10 dark:hover:bg-white/20"
            onClick={onSubmit(handleSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Criar Mosaico"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
