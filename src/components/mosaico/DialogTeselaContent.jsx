import { useEffect, useState } from "react";
import { DialogContent } from "@/components/ui/dialog";
import YoutubePlayer from "./YoutubePlayer";
import Mp4Player from "./Mp4Player";
import { useTranslation } from "react-i18next";
import {
  addConteutoTesela,
  adicionarMultiplosConteudos,
  deleteContentTessela,
  deleteTessela,
  downloadConteudoTessela,
  getTeselaById,
  updateDataTessela,
} from "@/api/services/teselaService";
import { ArrowLeft, Pencil, Trash, Plus, Loader2, Download } from "lucide-react";
import { DeleteTesselaModal } from "./DeleteTesselaModal";
import AddTesselaContentModal from "./AddTesselaContentModal";
import { toast } from "react-toastify";
import DialogUpdateDataTessela from "./DialogUpdateDataTessela";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getTeselaByIdInfo } from "@/api/services/informacoesService";
import CardConteudoTessela from "./CardConteudoTessela";
import notFoundMosaico from "@/assets/freepik__adjust__19912.png";
import { fixIconPath } from "@/utils/iconPath";

const initialState = {
  id: "",
  mosaicoId: "",
  label: "",
  iconUrl: "",
  x: 0,
  y: 0,
  conteudos: [],
  dataCadastro: "",
  dataUltimaAtualizacao: "",
};

export default function DialogTeselaContent({
  data,
  open,
  onOpenChange,
  noEditable,
}) {
  const { t } = useTranslation();
  const [editandoImagem, setEditandoImagem] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [addContentTessela, setAddContentTessela] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tesselaConteudo, setTeselaConteudo] = useState(initialState);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [mosaicoGlobal, setMosaicoGlobal] = useState(false);
  const [noEditableState, setNoEditableState] = useState(noEditable);
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const [loadingDeleteContent, setLoadingDeleteContent] = useState(false);

  const { mosaicos, proprietarioId } = useAuth();
  const { id: mosaicoId } = useParams();
  const location = useLocation();
  const irParaProximo = () => {
    if (indiceSelecionado < tesselaConteudo.conteudos.length - 1) {
      const novoIndice = indiceSelecionado + 1;
      setIndiceSelecionado(novoIndice);
      setItemSelecionado(tesselaConteudo.conteudos[novoIndice]);
    }
  };

  const irParaAnterior = () => {
    if (indiceSelecionado > 0) {
      const novoIndice = indiceSelecionado - 1;
      setIndiceSelecionado(novoIndice);
      setItemSelecionado(tesselaConteudo.conteudos[novoIndice]);
    }
  };

  useEffect(() => {
    if (tesselaConteudo && itemSelecionado) {
      const index = tesselaConteudo.conteudos.findIndex(
        (conteudo) => conteudo.id === itemSelecionado.id
      );
      if (index !== -1) {
        setIndiceSelecionado(index);
      }
    }
  }, [itemSelecionado, tesselaConteudo]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") irParaAnterior();
      if (e.key === "ArrowRight") irParaProximo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [indiceSelecionado, tesselaConteudo]);

  const SearchContent = async () => {
    try {
      setLoading(true);

      let response;
      if (
        location.pathname.includes("/info") ||
        location.pathname.includes("/publicos")
      ) {
        response = await getTeselaByIdInfo(data.teselaId);
      } else {
        response = await getTeselaById(data.teselaId);
      }
      setTeselaConteudo(response);
    } catch (error) {
      toast.error("Erro ao buscar conteúdos da tessela.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      SearchContent();
      setItemSelecionado(null);
    }
  }, [open, data.teselaId]);

  useEffect(() => {
    setEditLabel(tesselaConteudo.label || "");
  }, [tesselaConteudo.label]);

  const handleDelete = async () => {
    await deleteTessela(tesselaConteudo.mosaicoId, data.teselaId);
    setConfirmDeleteOpen(false);
    onOpenChange({
      mosaicoId: tesselaConteudo.mosaicoId,
      teselaId: data.teselaId,
    });
  };

  const handleOpenDialogAddContent = () => {
    setAddContentTessela(true);
  };

  const handleAddTesselaContent = async (dataAddTessela) => {
    try {
      const formConteudo = new FormData();
      formConteudo.append("tesselaId", data.teselaId);

      if (dataAddTessela.tipo === "multiplos-conteudos") {
        for (const arquivo of dataAddTessela.valor) {
          formConteudo.append("arquivos", arquivo);
        }

        await adicionarMultiplosConteudos(formConteudo);
        SearchContent();
        setItemSelecionado(null);
        return;
      }

      formConteudo.append("tipoConteudo", dataAddTessela.tipo);
      formConteudo.append("nomeConteudo", dataAddTessela.descricao || "");

      if (dataAddTessela.tipo === "texto" || dataAddTessela.tipo === "link") {
        formConteudo.append("texto", dataAddTessela.valor);
      } else {
        formConteudo.append("arquivo", dataAddTessela.valor);
      }

      await addConteutoTesela(formConteudo);
      SearchContent();
      setItemSelecionado(null);
    } catch ({ status, response: { data } }) {
      toast.error(data?.message || "Erro ao adicionar conteúdo.");
    }
  };

  const handleDeleteContentTessela = async () => {
    try {
      setLoadingDeleteContent(true);
      const response = await deleteContentTessela(
        data.teselaId,
        itemSelecionado.id
      );
      toast.success(response.message);
      await SearchContent();
      setItemSelecionado(null);
    } catch ({ status, response: { data } }) {
      toast.error(data.message);
    } finally {
      setLoadingDeleteContent(false);
    }
  };

  const handleCloseAddConentTessela = () => {
    setAddContentTessela(false);
  };

  const handleEdit = async (label, descricao, iconPreDefinido, icon) => {
    try {
      const formConteudo = new FormData();
      formConteudo.append("label", label);
      formConteudo.append("descricao", descricao);
      if (iconPreDefinido)
        formConteudo.append("iconPreDefinido", iconPreDefinido);
      if (icon) formConteudo.append("icon", icon);
      formConteudo.append("tesselaId", data.teselaId);
      const response = await updateDataTessela(formConteudo);
      if (response) {
        setTeselaConteudo((prev) => ({
          ...prev,
          icon: fixIconPath(response.data.iconUrl),
          label: label,
          descricao: descricao,
        }));
        data.icon = fixIconPath(response.data.iconUrl);
        data.label = label;
        data.descricao = descricao;
      }
      setEditandoImagem(false);
    } catch ({ status, response: { data } }) {
      const errorMessage = data?.message || "Erro ao criar o mosaico.";
      toast.error(errorMessage);
    }
  };

  const ValidaMosaicoGlobal = () => {
    var mosaico = mosaicos?.filter((x) => x.id == mosaicoId);
    if (
      mosaico &&
      mosaico[0]?.ehGlobal &&
      mosaico[0]?.proprietarioId != proprietarioId
    ) {
      setNoEditableState(true);
      setMosaicoGlobal(false);
    } else {
      setMosaicoGlobal(true);
    }
  };

  useEffect(() => {
    ValidaMosaicoGlobal();
  }, [mosaicos, mosaicoId]);

  const handleDownloadConteudo = async (url) => {
    try {
      const response = await downloadConteudoTessela(url);

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });

      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;

      const contentDisposition = response.headers['content-disposition'];
      let filename =
        contentDisposition?.split('filename=')[1]?.replace(/["']/g, '');

      if (!filename) {
        try {
          filename = decodeURIComponent(url.split('/').pop() || 'arquivo.txt');
        } catch {
          filename = 'arquivo.txt';
        }
      }

      a.download = filename;
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast.error('Erro ao baixar conteúdo', error);
    }
  };

  return (
    <>
      <DialogContent className="min-w-[90%] !max-w-[90%] max-h-[90%] h-full p-0 rounded-lg overflow-hidden flex flex-col shadow-xl text-white bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40]">
        {itemSelecionado ? (
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <h2 className="text-sm font-semibold text-white/80">
              {itemSelecionado?.nomeConteudo || ""}
            </h2>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-0 sm:justify-between md:items-start px-6 pt-4 pb-2 mr-10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 text-xl font-bold">
                {tesselaConteudo.label.toUpperCase()}
              </div>
            </div>

            {!noEditableState && (
              <div className="flex items-center gap-2 mt-[15px]">
                <Button
                  onClick={() => setEditandoImagem(true)}
                  className="px-2 py-[6px] bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white text-xs rounded flex items-center gap-1 border border-white/20 shadow-lg"
                >
                  <Pencil size={14} />
                  <span className="hidden md:inline">
                    {t("tesselaModal.alterarDadosTessela")}
                  </span>
                </Button>

                <Button
                  onClick={handleOpenDialogAddContent}
                  className="px-2 py-[6px] bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white text-xs rounded flex items-center gap-1 border border-white/20 shadow-lg"
                >
                  <Plus size={14} />
                  <span className="hidden md:inline">
                    {t("iconModal.addContentTessela")}
                  </span>
                </Button>

                <Button
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="px-2 py-[6px] bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40] text-white text-xs rounded flex items-center gap-1 border border-white/30 shadow-lg"
                >
                  <Trash size={14} />
                  <span className="hidden md:inline">
                    {t("tesselaModal.deleteTessela")}
                  </span>
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 p-[1px] overflow-auto custom-scrollbar">
          {!!itemSelecionado ? (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4 px-2.5">
                <button
                  onClick={() => setItemSelecionado(null)}
                  className="cursor-pointer flex items-center gap-0.5 text-sm text-blue-400 hover:text-blue-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("tesselaModal.voltarParaPastas")}
                </button>

                {!["texto", "link"].includes(itemSelecionado.tipo?.toLowerCase()) && (
                  <button
                    className="cursor-pointer flex items-center gap-0.5 text-sm text-blue-400 hover:text-blue-300"
                    onClick={() => handleDownloadConteudo(itemSelecionado.url)}
                  >
                    <Download className="w-4 h-4" />
                    {t("tesselaModal.downloadFile")}
                  </button>
                )}

                {!noEditableState && (
                  <button
                    onClick={handleDeleteContentTessela}
                    disabled={loadingDeleteContent}
                    className="cursor-pointer flex items-center gap-1 text-sm text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingDeleteContent ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash className="w-4 h-4" />
                    )}
                    {t("tesselaModal.deletarConteudo")}
                  </button>
                )}
              </div>

              <div className="relative flex-1 overflow-hidden bg-zinc-900 rounded-md p-0">
                {/* Botão esquerdo */}
                <button
                  onClick={irParaAnterior}
                  disabled={indiceSelecionado === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 p-2 rounded-full shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="text-white w-5 h-5" />
                </button>

                {/* Conteúdo */}
                <div className="w-full h-full">
                  {renderConteudo(itemSelecionado, onOpenChange)}
                </div>

                {/* Botão direito */}
                <button
                  onClick={irParaProximo}
                  disabled={
                    indiceSelecionado === tesselaConteudo.conteudos.length - 1
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 p-2 rounded-full shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="rotate-180 text-white w-5 h-5" />
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full text-white/60 text-sm gap-4">
              <Loader2 className="animate-spin w-6 h-6" />
              <p>{t("tesselaModal.carregandoConteudos")}</p>
            </div>
          ) : tesselaConteudo.conteudos?.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {tesselaConteudo.conteudos.map((conteudo, index) => (
                <CardConteudoTessela
                  key={index}
                  conteudo={conteudo}
                  index={index}
                  onClick={setItemSelecionado}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/60 text-sm gap-4">
              <p>{t("tesselaModal.semConteudos")}</p>
            </div>
          )}
        </div>

        {confirmDeleteOpen && (
          <DeleteTesselaModal
            open={confirmDeleteOpen}
            onCancel={() => setConfirmDeleteOpen(false)}
            onConfirm={handleDelete}
          />
        )}

        {addContentTessela && (
          <AddTesselaContentModal
            open={addContentTessela}
            onClose={handleCloseAddConentTessela}
            onConfirm={handleAddTesselaContent}
          />
        )}

        {editandoImagem && (
          <DialogUpdateDataTessela
            open={editandoImagem}
            onClose={() => setEditandoImagem(false)}
            onConfirm={handleEdit}
            dataAtual={data}
          />
        )}
      </DialogContent>
    </>
  );
}

const renderConteudo = (conteudo, onOpenChange) => {
  const tipo = conteudo.tipo?.toLowerCase() || "imagem";
  switch (tipo) {
    case "imagem":
      return (
        <div className="w-full h-full flex items-center justify-center bg-white overflow-hidden">
          <img
            src={conteudo.url}
            alt="Conteúdo"
            className="object-contain w-full h-full sm:max-w-full sm:max-h-full max-w-[100vw] max-h-[100vh] rounded-md"
            style={{
              imageRendering: "auto",
            }}
            loading="eager"
            decoding="async"
          />
        </div>
      );

    case "texto":
      return (
        <div className="w-full h-full p-4 overflow-auto bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg">
          <pre className="whitespace-pre-wrap break-all font-sans text-sm w-full">
            {conteudo.texto}
          </pre>
        </div>
      );

    case "pdf":
      return (
        <div className="w-full h-[80vh]">
          <iframe src={conteudo.url} className="w-full h-full" />
        </div>
      );

    case "audio":
      return (
        <div className="flex justify-center items-center h-full p-6 bg-[#ccc] dark:bg-zinc-800 ">
          <div className="w-full max-w-xl rounded-xl bg-white/5 dark:bg-white/10 backdrop-blur-sm shadow-lg p-6 border border-white/10">
            <audio
              controls
              className="w-full rounded-md outline-none "
            >
              <source src={conteudo.url} type="audio/mpeg" />
              Seu navegador não suporta áudio.
            </audio>
          </div>
        </div>

      );

    case "video":
      return (
        <div className="w-full h-full flex items-center justify-center bg-white overflow-hidden">
          <video
            src={conteudo.url}
            controls
            className="object-contain w-full h-full sm:max-w-full sm:max-h-full max-w-[100vw] max-h-[100vh] rounded-md"
            style={{
              imageRendering: "auto",
            }}
            onEnded={() => onOpenChange(false)}
          />
        </div>
      );

    case "office":
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            conteudo.url
          )}`}
          className="w-full h-full"
        />
      );

    case "link":
      if (conteudo.url.includes("youtube.com")) {
        return (
          <YoutubePlayer url={conteudo.url} onEnd={() => onOpenChange(false)} />
        );
      }
      if (conteudo.url?.match(/\.(mp4|webm|mov|m4v)$/i)) {
        return (
          <Mp4Player src={conteudo.url} onEnd={() => onOpenChange(false)} />
        );
      }
      return (
        <iframe src={conteudo.url} className="w-full h-full" allowFullScreen />
      );

    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-white">
          <img
            src={notFoundMosaico}
            alt="Não encontrado"
            className="object-contain max-w-[50%] max-h-[50%]"
          />
        </div>
      );
  }
};
