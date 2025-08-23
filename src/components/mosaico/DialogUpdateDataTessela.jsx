import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import IconGallery from "../IconGallery";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";

export default function DialogUpdateDataTessela({
  open,
  onConfirm,
  onClose,
  dataAtual,
}) {
  const { t } = useTranslation();
  const initialState = {
    iconeAberto: null,
    iconPreDefinido: dataAtual.icon ?? null,
    icon: null,
    label: dataAtual.label ?? "",
    descricao: dataAtual.descricao ?? "",
  };
  const [tesselaData, setTesselaData] = useState(initialState);

  if (!open) return null;

  const toggleGrupo = (grupo) => {
    if (tesselaData.iconeAberto === grupo) {
      setTesselaData((p) => ({ ...p, iconeAberto: null }));
    } else {
      setTimeout(
        () => setTesselaData((p) => ({ ...p, iconeAberto: grupo })),
        300
      );
    }
  };

  const handleSubmit = () => {
    if (!tesselaData.label && !tesselaData.descricao) {
      toast.error(t("tesselaModal.requiredIconAndDescription"));
      return;
    }
    if (!tesselaData.icon && !tesselaData.iconPreDefinido) {
      toast.error(t("tesselaModal.requiredIcon"));
      return;
    }

    onConfirm(
      tesselaData.label,
      tesselaData.descricao,
      tesselaData.iconPreDefinido,
      tesselaData.icon
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white text-black dark:text-white dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] rounded-lg p-6 w-full max-w-md mx-4 borde dark:border-zinc-700">
        <div className="space-y-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("tesselaModal.alterDateTessela")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("tesselaModal.alterDateTesselaDescription")}
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
          <Input
            className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
            value={tesselaData.label}
            maxLength={15}
            onChange={(e) =>
              setTesselaData((p) => ({ ...p, label: e.target.value }))
            }
            placeholder={t("tesselaModal.name")}
          />
          {/* <Input
            className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
            value={tesselaData.descricao}
            maxLength={25}
            onChange={(e) =>
              setTesselaData((p) => ({ ...p, descricao: e.target.value }))
            }
            placeholder={t("tesselaModal.description")}
          /> */}
          <div className="space-y-4">
            {/* Ícones Gerais */}
            <IconGallery
              iconSelecionado={tesselaData.iconPreDefinido}
              onSelect={(src) =>
                setTesselaData((p) => ({
                  ...p,
                  iconPreDefinido: src,
                  icon: null,
                  iconeAberto: null,
                }))
              }
              aberto={tesselaData.iconeAberto === "gerais"}
              toggle={() => toggleGrupo("gerais")}
            />

            {/* Ícones Exclusivos */}
            <div>
              <button
                className="flex items-center gap-1"
                onClick={() => toggleGrupo("exclusivos")}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    tesselaData.iconeAberto === "exclusivos" ? "rotate-180" : ""
                  }`}
                />
                <span>{t("tesselaModal.exclusiveIcons")}</span>
              </button>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  tesselaData.iconeAberto === "exclusivos"
                    ? "max-h-40 mt-2"
                    : "max-h-0"
                }`}
              >
                <div className="flex gap-2 flex-wrap">
                  <div className="w-full rounded-md px-4 py-3 text-sm flex justify-between items-center border-2 bg-zinc-100 dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] dark:border-2">
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 rounded-md border text-sm text-white bg-blue-700 dark:bg-[#131D40]">
                        {t("iconModal.chooseFile")}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setTesselaData((p) => ({
                            ...p,
                            icon: e.target.files?.[0] || null,
                            iconPreDefinido: null,
                          }))
                        }
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs truncate max-w-[50%]">
                      {tesselaData?.icon?.name || t("iconModal.noFile")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={handleSubmit}>
              {t("tesselaModal.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
