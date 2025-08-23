import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { adicionarPlano } from "@/api/services/proprietarioService";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { novoPlanoValidation } from "@/validations/dashboard/novoPlanoValidation";

export default function NovoPlanoModal({ open, onClose, fetchPlanos }) {
  const {
    register,
    handleSubmit: onSubmit,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(novoPlanoValidation),
  });

  const formatCurrency = (e) => {
    const { name, value } = e.target;

    let numericValue = value.replace(/\D/g, "");
    numericValue = (numericValue / 100).toFixed(2);
    numericValue = numericValue.replace(".", ",");
    numericValue = numericValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

    setValue(name, numericValue);
  };

  const parseCurrencyToNumber = (value) => {
    return parseFloat(value.replace(/\./g, "").replace(",", "."));
  };

  const handleSubmit = async (data) => {
    try {
      const novoPlano = {
        Nome: data.nome,
        QuantidadeDeMoisacos: parseInt(data.quantidadeDeMoisacos),
        QuantidadeDeConteudos: parseInt(data.quantidadeDeConteudos),
        ValorMensal: parseCurrencyToNumber(data.valorMensal),
        PriceIdMensal: data.priceIdMensal,
        PriceIdAnual: data.priceIdAnual,
        ValorAnual: parseCurrencyToNumber(data.valorAnual),
      };

      await adicionarPlano(novoPlano);

      toast.success("Plano criado com sucesso!");
      fetchPlanos();
      onClose();
      reset();
    } catch ({ response: { data } }) {
      toast.error(data?.message ?? "Erro ao criar plano.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#f9fafb] dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-zinc-900 dark:text-white p-6 rounded-xl border border-zinc-200 dark:border-white/10 shadow-xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-zinc-800 dark:text-white text-xl">
            Novo Plano
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 flex-1">
          <Input
            {...register("nome")}
            placeholder="Nome do plano"
            className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
          />
          <Input
            {...register("quantidadeDeMoisacos")}
            type="number"
            min="1"
            placeholder="Quantidade de Moisacos"
            className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
          />
          <Input
            {...register("quantidadeDeConteudos")}
            type="number"
            min="1"
            placeholder="Quantidade de Conteúdos"
            className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
          />
          <Input
            {...register("valorMensal")}
            onChange={formatCurrency}
            placeholder="Valor mensal (R$)"
            className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
          />
          <Input
            {...register("valorAnual")}
            onChange={formatCurrency}
            placeholder="Valor anual (R$)"
            className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
          />
          <Input
            {...register("priceIdMensal")}
            placeholder="ID do plano Mensal"
            className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
          />
          <Input
            {...register("priceIdAnual")}
            placeholder="ID do plano Anual"
            className="bg-white dark:bg-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder-white/50 border border-zinc-300 dark:border-white/20"
          />
        </div>

        <div className="pt-4">
          <Button
            className="w-full bg-[#283e60] hover:bg-[#2c3958] text-white dark:bg-white/10 dark:hover:bg-white/20"
            onClick={onSubmit(handleSubmit)}
          >
            Criar Plano
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
