import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deletarUsuarioVinculado } from "@/api/services/proprietarioService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function UsuariosVinculadosModal({
  open,
  onClose,
  usuarios,
  fetchUsuarios,
}) {
  const { t } = useTranslation();
  const [busca, setBusca] = useState("");
  const [resultado, setResultado] = useState([]);
  const [deletando, setDeletando] = useState({});

  const btn =
    "cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm shadow-md hover:brightness-50 transition w-[45%] sm:w-auto";

  const usuariosUnicos = Array.from(
    new Map(usuarios.map((u) => [u.email, u])).values()
  );

  useEffect(() => setResultado(usuariosUnicos), [usuarios]);

  function filtrar() {
    const termo = busca.trim().toLowerCase();
    if (!termo) return setResultado(usuariosUnicos);
    setResultado(
      usuariosUnicos.filter(({ nome }) =>
        nome
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes(termo)
      )
    );
  }

  function limpar() {
    setBusca("");
    setResultado(usuariosUnicos);
  }

  async function handleDelete(email) {
    setDeletando((prev) => ({ ...prev, [email]: true }));
    try {
      await deletarUsuarioVinculado({ email });
      toast.success(t("usuariosVinculadosModal.desvinculadoSucesso"));
      fetchUsuarios();
    } catch ({ status, response: { data } }) {
      toast.error(
        status === 403
          ? t("usuariosVinculadosModal.acessoNegado")
          : data?.message
      );
    } finally {
      setDeletando((prev) => ({ ...prev, [email]: false }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40]">
        <DialogHeader>
          <DialogTitle>{t("usuariosVinculadosModal.titulo")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap justify-between sm:flex-nowrap items-center gap-2">
          <Input
            placeholder={t("usuariosVinculadosModal.buscarPlaceholder")}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && filtrar()}
            className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
          />

          <button onClick={filtrar} className={btn}>
            {t("usuariosVinculadosModal.buscar")}
          </button>

          <button onClick={limpar} className={btn}>
            {t("usuariosVinculadosModal.limpar")}
          </button>
        </div>

        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1 mt-4">
          {resultado.length ? (
            resultado.map(({ nome, email, role }, i) => (
              <li
                key={email + i}
                className="flex justify-between items-center text-sm bg-zinc-100 dark:bg-white/10 text-black dark:text-white rounded-lg px-3 py-2"
              >
                <div>
                  <span className="font-medium truncate">{nome}</span>
                  <span className="block text-xs text-zinc-600 dark:text-white/60 truncate">
                    {email} • <em>{role}</em>
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(email)}
                  className="text-red-500 hover:text-red-700"
                  disabled={deletando[email]}
                >
                  {deletando[email] ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-red-500 rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </li>
            ))
          ) : (
            <li className="text-sm text-zinc-500 dark:text-white/50">
              {t("usuariosVinculadosModal.nenhumEncontrado")}
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
