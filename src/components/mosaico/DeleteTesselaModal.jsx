import { useTranslation } from "react-i18next";

export function DeleteTesselaModal({
  open,
  onCancel,
  onConfirm,
  // t = (key) => key,
}) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] rounded-lg p-6 max-w-sm w-full shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t("tesselaModal.confirmDeleteTitle") || "Confirm Deletion"}
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          {t("tesselaModal.confirmDeleteMessage") ||
            "Are you sure you want to delete this item?"}
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600 transition-colors"
          >
            {t("common.cancel") || "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            {t("common.confirm") || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
