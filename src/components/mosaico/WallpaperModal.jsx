import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, ImagePlus } from "lucide-react";
import ColorPicker from "./ColorPicker";
import { useTranslation } from "react-i18next";
import { updatePlanoDeFundo } from "@/api/services/mosaicoService";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function WallpaperModal({ onChange }) {
  const { t } = useTranslation("");
  const closeRef = useRef(null);
  const { id: mosaicoId } = useParams();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modoGradiente, setModoGradiente] = useState(false);

  const [startColor, setStartColor] = useState("#fef3c7");
  const [endColor, setEndColor] = useState("#f5d0fe");
  const [thirdColor, setThirdColor] = useState("");
  const [corFinal, setCorFinal] = useState(startColor);

  useEffect(() => {
    if (!image) return setPreview(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(image);
  }, [image]);

  useEffect(() => {
    if (modoGradiente) {
      const cores = [
        startColor,
        endColor || startColor,
        thirdColor || endColor || startColor,
      ];
      setCorFinal(`linear-gradient(to right, ${cores.join(", ")})`);
    } else {
      setCorFinal(startColor);
    }
  }, [modoGradiente, startColor, endColor, thirdColor]);

  const handleSaveCor = async () => {
    setImage(null);
    setPreview(null);
    onChange({ color: corFinal, image: null });
    closeRef.current?.click();

    const request = new FormData();
    request.append("IdMosaico", mosaicoId);
    request.append("Cor", corFinal);
    const response = await updatePlanoDeFundo(request);
    toast(response.message);
  };

  const handleSaveImagem = async () => {
    if (!image) return;
    setStartColor("#fef3c7");
    setEndColor("#f5d0fe");
    setThirdColor("");
    onChange({ color: "", image });
    closeRef.current?.click();

    const request = new FormData();
    request.append("IdMosaico", mosaicoId);
    if (image) {
      request.append("PlanoDeFundo", image);
    }
    const response = await updatePlanoDeFundo(request);
    toast(response.message);
  };

  const handlerSaveBgAndBgColor = () => {
    if (image) {
      handleSaveImagem();
    } else {
      handleSaveCor();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-sm cursor-pointer hover:opacity-80 transition">
          {t("toolbarMaintenance.wallpaper")}
        </button>
      </DialogTrigger>

      <DialogContent className="bg-white dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] ">
        <DialogHeader>
          <DialogTitle>
            {t("toolbarMaintenance.wallpaperModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("toolbarMaintenance.wallpaperModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-5">
          {/* Cores */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("toolbarMaintenance.wallpaperModal.color")}
            </label>
            {!modoGradiente && (
              <div className="flex items-center gap-3">
                <ColorPicker
                  value={startColor}
                  onChange={(e) => setStartColor(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-between text-xs font-medium mt-1">
              <span
                className="cursor-pointer text-blue-600 hover:brightness-110"
                onClick={() => {
                  setModoGradiente(!modoGradiente);
                  if (!modoGradiente && !endColor) setEndColor("#dbeafe");
                }}
              >
                {modoGradiente
                  ? t("tesselaModal.usarCorUnica")
                  : t("tesselaModal.usarGradiente")}
              </span>
            </div>

            {modoGradiente && (
              <div className="flex items-center gap-3">
                <ColorPicker
                  value={startColor}
                  onChange={(e) => setStartColor(e.target.value)}
                />
                <ColorPicker
                  value={endColor}
                  onChange={(e) => setEndColor(e.target.value)}
                />
                <ColorPicker
                  value={thirdColor}
                  onChange={(e) => setThirdColor(e.target.value)}
                />
              </div>
            )}

            <div className="mt-3">
              <div
                className="w-full h-14 rounded-md border border-zinc-300 dark:border-zinc-700"
                style={{ background: corFinal }}
              />
            </div>
          </div>

          {/* Imagem */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              {t("toolbarMaintenance.wallpaperModal.image")}
            </label>
            <div className="w-full rounded-md px-4 py-3 text-sm flex flex-col sm:flex-row justify-between items-center border-2 bg-zinc-100 dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] dark:border-2">
              <label className="cursor-pointer">
                <span className="px-4 py-2 rounded-md border text-sm text-white bg-blue-700 dark:bg-[#131D40]">
                  {t("iconModal.chooseFile")}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <span className="text-xs truncate max-w-[50%] hidden sm:inline">
                {image?.name || t("iconModal.noFile")}
              </span>
            </div>

            {preview && (
              <div className="relative rounded-md overflow-hidden border border-zinc-300 dark:border-zinc-700 mt-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                  }}
                  className="absolute top-1 right-1 bg-white dark:bg-zinc-800 p-1 rounded-full shadow hover:bg-red-100 dark:hover:bg-red-900 transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
          </div>

          {/* Botões */}
          <div>
            <Button
              className="w-full bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white hover:brightness-110 dark:bg-white/10 dark:hover:bg-white/20 dark:bg-none transition-colors duration-200"
              onClick={() => handlerSaveBgAndBgColor()}
            >
              {t("tesselaModal.save")}
            </Button>

            <DialogClose asChild>
              <button ref={closeRef} className="hidden" />
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
