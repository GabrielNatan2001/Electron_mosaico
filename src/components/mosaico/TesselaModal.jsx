import React, { useState } from "react";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, Loader2 } from "lucide-react";
import IconGallery from "@/components/IconGallery";
import { modalTesselaValidation } from "@/validations/toolbar/modalTesselaValidation";

const tiposComArquivo = ["imagem", "pdf", "video", "office", "audio"];
const tiposComTexto = ["texto"];

const tipoOptions = (t) => [
  { label: t("tesselaModal.text"), value: "texto" },
  { label: t("tesselaModal.link"), value: "link" },
  { label: t("tesselaModal.arquivo"), value: "arquivo" },
  { label: t("tesselaModal.multiple"), value: "multiplos-conteudos" },
];

// Componentes auxiliares
function FileInput({ label, onChange, accept, fileName, error, t, tipo }) {
  const handleFileChange = (files) => {
    if (!files || files.length === 0) return;

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const totalMB = totalSize / (1024 * 1024);

    const limit = tipo === "multiplos-conteudos" ? 150 : 60;

    if (totalMB > limit) {
      toast.error(
        t("tesselaModal.fileTooLargeTotal", { size: totalMB.toFixed(2), limit })
      );
      return;
    }

    if (totalMB > 50) {
      toast.info(
        t("tesselaModal.fileMayTakeTimeTotal", { size: totalMB.toFixed(2) })
      );
    }

    onChange(files);
  };

  return (
    <div
      className={clsx(
        "w-full flex items-center justify-between gap-4 rounded-md px-4 py-3 text-sm border-2 bg-zinc-100 dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40]",
        error ? "!border-red-500 !ring-red-500" : "dark:border-2"
      )}
    >
      <label className="cursor-pointer shrink-0">
        <span className="px-4 py-2 rounded-md border text-sm text-white bg-blue-700 dark:bg-[#131D40]">
          {label}
        </span>
        <input
          type="file"
          className="hidden"
          accept={accept}
          multiple
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
        />
      </label>
      <span
        className={clsx(
          "text-sm truncate flex-1 text-right",
          error ? "text-red-500" : "text-gray-600 dark:text-gray-400"
        )}
      >
        {fileName?.length > 0
          ? `${fileName.length} arquivo(s) selecionado(s)`
          : label}
      </span>
    </div>
  );
}

function TipoValorInput({ tipo, field, t, error }) {
  if (tipo === "multiplos-conteudos" || tipo === "arquivo") {
    return (
      <FileInput
        label={t("iconModal.chooseFile")}
        onChange={field.onChange}
        accept="*/*"
        fileName={field.value}
        error={error}
        t={t}
        tipo={tipo}
      />
    );
  }

  if (tiposComArquivo.includes(tipo)) {
    const accept =
      tipo === "imagem"
        ? "image/*"
        : tipo === "video"
          ? "video/mp4"
          : tipo === "pdf"
            ? "application/pdf"
            : ".doc,.docx,.xls,.xlsx,.ppt,.pptx";

    return (
      <FileInput
        label={t("iconModal.chooseFile")}
        onChange={(files) => field.onChange(files[0])}
        accept={accept}
        fileName={field.value ? [field.value] : []}
        error={error}
        t={t}
      />
    );
  }

  if (tiposComTexto.includes(tipo)) {
    return (
      <Textarea
        {...field}
        maxLength={3500}
        rows={4}
        placeholder={t("tesselaModal.content")}
        className={clsx(
          "resize-none bg-white dark:bg-white/10",
          error ? "!border-red-500" : "border-zinc-300 dark:border-white/20"
        )}
      />
    );
  }

  return (
    <Input
      {...field}
      placeholder={t("tesselaModal.linkPlaceholder", { tipo })}
      className={clsx(
        error ? "!border-red-500" : "border-zinc-300 dark:border-white/20"
      )}
    />
  );
}

export default function TesselaModal({ onSubmit }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [iconeAberto, setIconeAberto] = useState(null);
  const [iconSelecionado, setIconSelecionado] = useState(null);
  const [iconFile, setIconFile] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(modalTesselaValidation(t)),
    defaultValues: {
      nome: "",
      descricao: "",
      tipo: "",
      valor: "",
    },
  });

  const tipoSelecionado = watch("tipo");

  const limpar = () => {
    reset();
    setIconSelecionado(null);
    setIconFile(null);
    setIconeAberto(null);
  };

  const onFormSubmit = async (formData) => {
    if (!iconSelecionado && !iconFile) {
      toast.error(t("tesselaModal.requiredIcon"));
      return;
    }

    const limit = formData.tipo === "multiplos-conteudos" ? 150 : 60;

    if (formData.valor && formData.valor.size) {
      const sizeMB = formData.valor.size / (1024 * 1024);
      if (sizeMB > limit) {
        toast.error(
          t("tesselaModal.fileTooLargeSingle", {
            size: sizeMB.toFixed(2),
            limit,
          })
        );
        return;
      }
      if (sizeMB > 50) {
        toast.info(
          t("tesselaModal.fileMayTakeTimeSingle", { size: sizeMB.toFixed(2) })
        );
      }
    }

    setLoading(true);

    const payload = {
      ...formData,
      iconSelecionado,
      icon: iconFile,
    };

    if (formData.tipo === "multiplos-conteudos" || formData.tipo === "arquivo") {
      delete payload.descricao;
    }

    await onSubmit(payload);
    limpar();
  };

  return (
    <DialogContent className="bg-white dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40]">
      <DialogHeader>
        <DialogTitle>{t("tesselaModal.title")}</DialogTitle>
        <DialogDescription>{t("tesselaModal.subtitle")}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Galeria de Ícones */}
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          <IconGallery
            iconSelecionado={iconSelecionado}
            onSelect={(src) => {
              setIconSelecionado(src);
              setIconeAberto(null);
              setIconFile(null);
            }}
            aberto={iconeAberto === "gerais"}
            toggle={() =>
              setIconeAberto((prev) => (prev === "gerais" ? null : "gerais"))
            }
          />
        </div>

        {/* Upload Ícone Exclusivo */}
        <div>
          <button
            type="button"
            onClick={() =>
              setIconeAberto((prev) =>
                prev === "exclusivos" ? null : "exclusivos"
              )
            }
            className="flex items-center gap-1"
          >
            <ChevronDown
              className={clsx(
                "w-4 h-4 transition-transform duration-300",
                iconeAberto === "exclusivos" && "rotate-180"
              )}
            />
            <span>{t("tesselaModal.exclusiveIcons")}</span>
          </button>

          <div
            className={clsx(
              "transition-all duration-300 overflow-hidden",
              iconeAberto === "exclusivos" ? "max-h-40 mt-2" : "max-h-0"
            )}
          >
            <div className="flex gap-2 flex-wrap">
              <div className="w-full px-4 py-3 rounded-md flex justify-between items-center border-2 bg-zinc-100 dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] dark:border-2">
                <label className="cursor-pointer">
                  <span className="px-4 py-2 rounded-md border text-sm text-white bg-blue-700 dark:bg-[#131D40]">
                    {t("iconModal.chooseFile")}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setIconFile(e.target.files?.[0] || null);
                      setIconSelecionado(null);
                    }}
                    className="hidden"
                  />
                </label>
                <span className="text-xs truncate max-w-[50%] hidden sm:inline">
                  {iconFile?.name || t("iconModal.noFile")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Campos Nome e Descrição */}
        <div className="flex items-center gap-2">
          {(iconSelecionado || iconFile) && (
            <div className="w-10 h-9 rounded-md border border-zinc-300 dark:border-white/20 overflow-hidden">
              <img
                src={iconSelecionado || URL.createObjectURL(iconFile)}
                alt="icon"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <Input
            {...register("nome")}
            maxLength={40}
            placeholder={
              errors.nome ? errors.nome.message : t("tesselaModal.name")
            }
            className={clsx(
              "w-full bg-white dark:bg-white/10 pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60",
              errors.nome && "!border-red-500 !placeholder-red-500"
            )}
          />
        </div>

        {/* Seletor de Tipo */}
        <Controller
          name="tipo"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => {
                field.onChange(v);
                setValue("valor", "");
              }}
            >
              <SelectTrigger className="w-full bg-white dark:bg-white/10 border">
                <SelectValue placeholder={t("tesselaModal.type")} />
              </SelectTrigger>
              <SelectContent>
                {tipoOptions(t).map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {tipoSelecionado !== "multiplos-conteudos" && tipoSelecionado !== "arquivo" && (
          <Input
            {...register("descricao")}
            maxLength={25}
            placeholder={
              errors.descricao
                ? errors.descricao.message
                : t("tesselaModal.description")
            }
            className={clsx(
              "bg-white dark:bg-white/10 pr-10 placeholder-[#4a4a4a] dark:placeholder-white/60",
              errors.descricao && "!border-red-500 !placeholder-red-500"
            )}
          />
        )}

        {/* Campo Dinâmico de Valor */}
        {tipoSelecionado && (
          <Controller
            name="valor"
            control={control}
            render={({ field }) => (
              <TipoValorInput
                tipo={tipoSelecionado}
                field={field}
                t={t}
                error={!!errors.valor}
              />
            )}
          />
        )}

        {/* Botão de Enviar */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-6 flex items-center justify-center gap-2"
          onClick={handleSubmit(onFormSubmit)}
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          <span>
            {loading ? t("tesselaModal.loading") : t("tesselaModal.create")}
          </span>
        </Button>
      </div>
    </DialogContent>
  );
}
