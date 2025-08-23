import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
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

const initialState = {
  descricao: "",
  tipo: "",
  valor: "",
};

const tiposComArquivo = ["imagem", "pdf", "video", "office", "audio"];
const tiposComTexto = ["texto"];

export default function AddTesselaContentModal({ open, onConfirm, onClose }) {
  const { t } = useTranslation();
  const [tesselaData, setTesselaData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const onFormSubmit = ({ descricao }) => {
    if (!tesselaData.valor || !tesselaData.tipo) {
      return alert(t("tesselaModal.requiredFields"));
    }

    const payload = {
      ...tesselaData,
      descricao: tesselaData.descricao,
    };

    const enviar = async () => {
      try {
        setLoading(true);
        await onConfirm(payload);
        onClose();
        setTesselaData(initialState);
      } catch (err) {
        console.error("Erro ao enviar tessela:", err);
      } finally {
        setLoading(false);
      }
    };

    enviar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] rounded-lg p-6 w-full max-w-2xl mx-4  dark:border-zinc-700 ">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold  dark:text-white text-gray-900">
              {t("tesselaModal.addContentTessela")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("tesselaModal.descriptionAddContentTessela")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {(tesselaData.tipo === "texto" || tesselaData.tipo === "link") && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("tesselaModal.description")}
              </label>
              <Input
                value={tesselaData.descricao}
                placeholder={t("tesselaModal.description")}
                maxLength={25}
                onChange={(e) =>
                  setTesselaData((p) => ({ ...p, descricao: e.target.value }))
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("tesselaModal.type")}
            </label>
            <Select
              value={tesselaData.tipo}
              onValueChange={(v) =>
                setTesselaData((p) => ({ ...p, tipo: v, valor: "" }))
              }
            >
              <SelectTrigger className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/20">
                <SelectValue placeholder={t("tesselaModal.type")} />
              </SelectTrigger>
              <SelectContent>
                {[
                  { label: t("tesselaModal.text"), value: "texto" },
                  { label: t("tesselaModal.link"), value: "link" },
                  {
                    label: t("tesselaModal.arquivo"),
                    value: "multiplos-conteudos",
                  },
                  {
                    label: t("tesselaModal.multiplosConteudos"),
                    value: "multiplos-conteudos",
                  },
                ].map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tesselaData.tipo && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {tiposComArquivo.includes(tesselaData.tipo)
                  ? t("tesselaModal.file")
                  : t("tesselaModal.content")}
              </label>

              {tesselaData.tipo === "multiplos-conteudos" ? (
                <div className="w-full rounded-md px-4 py-3 text-sm flex justify-between border-2 bg-zinc-100 dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] dark:border-2">
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 rounded-md border text-sm text-white bg-blue-700 dark:bg-[#131D40] mr-70">
                      {t("iconModal.chooseFile")}
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={(e) =>
                        setTesselaData((p) => ({
                          ...p,
                          valor: Array.from(e.target.files || []),
                        }))
                      }
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm truncate flex-1 text-gray-600 dark:text-gray-400">
                    {tesselaData.valor?.length > 0
                      ? `${tesselaData.valor.length} arquivo(s) selecionado(s)`
                      : t("tesselaModal.noFileSelected")}
                  </span>
                </div>
              ) : tiposComArquivo.includes(tesselaData.tipo) ? (
                <div className="w-full rounded-md px-4 py-3 text-sm flex justify-between border-2 bg-zinc-100 dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] dark:border-2">
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 rounded-md border text-sm text-white bg-blue-700 dark:bg-[#131D40]">
                      {t("iconModal.chooseFile")}
                    </span>
                    <input
                      type="file"
                      accept={
                        tesselaData.tipo === "imagem"
                          ? "image/*"
                          : tesselaData.tipo === "video"
                            ? "video/*"
                            : tesselaData.tipo === "pdf"
                              ? "application/pdf"
                              : tesselaData.tipo === "audio"
                                ? "audio/*"
                                : ".doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      }
                      onChange={(e) =>
                        setTesselaData((p) => ({
                          ...p,
                          valor: e.target.files?.[0] || null,
                        }))
                      }
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm truncate flex-1 text-gray-600 dark:text-gray-400">
                    {tesselaData.valor?.name ||
                      t("tesselaModal.noFileSelected")}
                  </span>
                </div>
              ) : tiposComTexto.includes(tesselaData.tipo) ? (
                <Textarea
                  value={tesselaData.valor}
                  onChange={(e) =>
                    setTesselaData((p) => ({
                      ...p,
                      valor: e.target.value.slice(0, 3500),
                    }))
                  }
                  placeholder={t("tesselaModal.content")}
                  maxLength={3500}
                  rows={4}
                  className="h-30 resize-none overflow-y-auto bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
                />
              ) : (
                <Input
                  value={tesselaData.valor}
                  onChange={(e) =>
                    setTesselaData((p) => ({ ...p, valor: e.target.value }))
                  }
                  placeholder={t("tesselaModal.linkPlaceholder", {
                    tipo: tesselaData.tipo,
                  })}
                />
              )}
            </div>
          )}

          <Button
            onClick={onFormSubmit}
            className="w-full mt-6 flex items-center justify-center gap-2"
            disabled={!tesselaData.tipo || !tesselaData.valor || loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
              </>
            ) : (
              t("tesselaModal.create")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
