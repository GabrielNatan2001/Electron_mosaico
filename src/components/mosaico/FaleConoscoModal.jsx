import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { enviarFeedBack } from "@/api/services/proprietarioService";

export default function FaleConoscoModal({ open, onClose, userEmail = null }) {
  const { t } = useTranslation();

  const [tipo, setTipo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [email, setEmail] = useState(userEmail || "");
  const [isEmailEditable, setIsEmailEditable] = useState(!userEmail);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
      setIsEmailEditable(false);
    }
  }, [userEmail]);

  const handleSubmit = async () => {
    if (!tipo || !mensagem.trim() || !email.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const feedbackData = {
        TipoFeedBack: tipo === "melhoria" ? "Melhoria" : "Bug",
        FeedBack: mensagem,
        EmailParaContato: email,
      };

      await enviarFeedBack(feedbackData);

      toast.success("Mensagem enviada com sucesso!");
      setTipo("");
      setMensagem("");
      if (!userEmail) setEmail("");
      onClose();
    } catch (error) {
      toast.error("Erro ao enviar mensagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden bg-[#f9fafb] dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-zinc-900 dark:text-white p-6 rounded-xl border border-zinc-200 dark:border-white/10 shadow-xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-zinc-800 dark:text-white text-xl">
            {t("toolbarOpen.mosaico.contact")}
          </DialogTitle>
          <p className="text-sm text-zinc-600 dark:text-white/70 mt-1">
            {t("toolbarOpen.mosaico.contactDescription")}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4 flex-1 overflow-hidden">
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/20">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="melhoria">Melhoria</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="email"
            placeholder="Seu e-mail para contato"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEmailEditable}
            className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
          />

          {!isEmailEditable && (
            <p className="text-xs text-zinc-500 dark:text-white/70 -mt-2">
              Caso queira alterar o e-mail, clique{" "}
              <button
                type="button"
                onClick={() => setIsEmailEditable(true)}
                className="text-blue-500 hover:underline"
              >
                aqui
              </button>
            </p>
          )}

          <Textarea
            placeholder="Digite sua sugestão ou descrição do problema..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="max-h-[120px] h-full bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20 min-h-[120px]"
          />
        </div>

        <div className="pt-4">
          <Button
            className="w-full bg-[#283e60] hover:bg-[#2c3958] text-white dark:bg-white/10 dark:hover:bg-white/20"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? t("button.primary.loading")
              : t("recover.button")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
