import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function IconModal() {
  const { t } = useTranslation();
  const [customIcons, setCustomIcons] = useState([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [selected, setSelected] = useState(null);
  const [aberto, setAberto] = useState(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("customIcons") || "[]");
    setCustomIcons(stored);
  }, []);

  const handleAddCustom = () => {
    if (!name.trim()) {
      toast.error(t("iconModal.fillName"));
      return;
    }
    if (name.length > 15 || !file) return;

    const src = URL.createObjectURL(file);
    const updated = [...customIcons, { name, src }];
    setCustomIcons(updated);
    sessionStorage.setItem("customIcons", JSON.stringify(updated));
    toast.success(t("iconModal.success"));
    setName("");
    setFile(null);
  };

  const handleDelete = (idx) => {
    const updated = [...customIcons];
    updated.splice(idx, 1);
    setCustomIcons(updated);
    sessionStorage.setItem("customIcons", JSON.stringify(updated));
  };

  const renderIcons = (icons, isCustom = false) =>
    icons.map((item, idx) => {
      const src = typeof item === "string" ? item : item.src;
      const label = typeof item === "string" ? "" : item.name;

      return (
        <div
          key={idx}
          onClick={() => setSelected(src)}
          className={` relative group border rounded-lg p-1 flex flex-col items-center transition hover:scale-105 cursor-pointer w-16 h-16 ${
            selected === src ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <img src={src} alt="icone" className="w-10 h-10 object-contain" />
          {label && (
            <span className="text-[10px] leading-tight text-center max-w-full truncate w-full break-words">
              {label}
            </span>
          )}
          {isCustom && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(idx);
              }}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          )}
        </div>
      );
    });

  const toggle = (key) => setAberto((prev) => (prev === key ? null : key));

  if (!open) return null;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("iconModal.title")}</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <button
          onClick={() => toggle("gerais")}
          className="flex justify-between w-full items-center text-sm font-medium"
        >
          {t("iconModal.general")}{" "}
          {aberto === "gerais" ? <ChevronUp /> : <ChevronDown />}
        </button>
        <div
          className={`transition-all duration-300 overflow-hidden ${
            aberto === "gerais"
              ? "max-h-40 opacity-100 mt-4"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-4 gap-3">
            {renderIcons([
              "../src/assets/apple.svg",
              "../src/assets/logoMosaico.svg",
              "../src/assets/whatsapp.svg",
            ])}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => toggle("exclusivos")}
          className="flex justify-between w-full items-center text-sm font-medium"
        >
          {t("iconModal.custom")}{" "}
          {aberto === "exclusivos" ? <ChevronUp /> : <ChevronDown />}
        </button>
        <div
          className={`transition-all duration-300 overflow-hidden ${
            aberto === "exclusivos"
              ? "max-h-40 opacity-100 mt-4"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-4 gap-3 max-h-40 overflow-y-auto pr-1">
            {renderIcons(customIcons, true)}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Input
          placeholder={t("iconModal.namePlaceholder")}
          maxLength={12}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="w-full rounded-md px-4 py-3 text-sm flex justify-between items-center border-2">
          <label className="cursor-pointer">
            <span className="px-4 py-2 rounded-md border text-sm text-white bg-blue-700">
              {t("iconModal.chooseFile")}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
          <span className="text-zinc-500 text-xs truncate">
            {file?.name || t("iconModal.noFile")}
          </span>
        </div>
        <Button className="w-full" onClick={handleAddCustom}>
          {t("iconModal.add")}
        </Button>
      </div>
    </>
  );
}
