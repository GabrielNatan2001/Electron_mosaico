import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obterDetalhesProprietario } from "@/api/services/informacoesService";
import {
  ArrowLeft,
  Mail,
  Layers,
  CalendarDays,
  Users,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import DarkModeToggle from "../theme/darkToggleMode";

export default function DetalhesProprietarioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dados, setDados] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      const res = await obterDetalhesProprietario(id, token);
      setDados(res);
      setLoading(false);
    })();
  }, [id]);

  if (loading)
    return (
      <div className="fixed inset-0 z-50 grid place-items-center">
        <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-b from-white/80 dark:from-[#25314d]/70 dark:via-[#2e3e5c]/70 dark:to-[#1f2a40]/70" />
        <div className="relative flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-black dark:text-white" />
          <span className="text-sm font-medium text-black/80 dark:text-white/80">
            Carregando conteúdo
          </span>
        </div>
      </div>
    );

  const vinculados = dados.usuariosVinculados.filter(
    (u) => u.email !== dados.email
  );
  if (!dados) return <div className="p-4">Nenhum dado encontrado.</div>;

  return (
    <div className="min-h-screen p-6 theme-gradient">
      {/* Título com ícone */}
      <div
        className="flex items-center gap-4 mb-8 cursor-pointer"
        onClick={() => navigate("/metricas?tab=proprietarios")}
      >
        <ArrowLeft size={24} className="hover:opacity-80 transition" />
        <h1 className="text-2xl font-bold">Detalhes do Proprietário</h1>
      </div>

      {/* Proprietário */}  
      <div className="mb-8">
        <p className="text-lg font-semibold flex items-center gap-2 flex-wrap">
          {dados.nome}
          <span className="text-gray-500 dark:text-white/50">|</span>
          <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-white/80">
            <CalendarDays size={16} />
            {new Date(dados.dataCadastro).toLocaleDateString("ptbr")}
          </span>
        </p>
        <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-white/80">
          <Mail size={16} />
          {dados.email}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <div className="p-4 rounded-lg text-center bg-white dark:bg-[#2e3e5c] shadow-sm">
          <p className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-white/80">
            <Layers size={16} />
            Mosaicos
          </p>
          <p className="text-2xl font-bold">{dados.mosaicos.length}</p>
        </div>
        <div className="p-4 rounded-lg text-center bg-white dark:bg-[#2e3e5c] shadow-sm">
          <p className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-white/80">
            <CalendarDays size={16} />
            Cadastro
          </p>
          <p className="text-lg font-semibold">
            {new Date(dados.dataCadastro).toLocaleDateString("ptbr")}
          </p>
        </div>
        <div className="p-4 rounded-lg text-center bg-white dark:bg-[#2e3e5c] shadow-sm">
          <p className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-white/80">
            <Mail size={16} />
            Email
          </p>
          <p className="text-xs break-words">{dados.email}</p>
        </div>
      </div>

      {/* Mosaicos e vinculados */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Mosaicos */}
        <div>
          <h2 className="text-lg font-semibold mb-4 border-b border-black/10 dark:border-white/20 pb-2 flex items-center gap-2">
            <Layers size={18} /> Mosaicos
          </h2>
          <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
            {dados.mosaicos.map((m, i) => (
              <div key={i}>
                <p className="font-medium">{m.nome}</p>
                <div className="flex justify-between text-sm text-gray-600 dark:text-white/70">
                  <span>Tesselas: {m.quantidadeDeTesselas}</span>
                  <span>Média: {m.mediaConteudosPorTessela.toFixed(2)}</span>
                </div>
                <p className="text-xs mt-1 text-gray-500 dark:text-white/50">
                  Criado em{" "}
                  {new Date(m.dataCadastro).toLocaleDateString("ptbr")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Vinculados */}
        <div>
          <h2 className="text-lg font-semibold mb-4 border-b border-black/10 dark:border-white/20 pb-2 flex items-center gap-2">
            <Users size={18} /> Usuários Vinculados
          </h2>
          {vinculados.length === 0 ? (
            <p className="text-gray-500 dark:text-white/60">
              Nenhum usuário vinculado.
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {dados.usuariosVinculados.map((u, i) => {
                const normalize = (s) => s?.toLowerCase().trim();
                const isOwner = normalize(u.nome) === normalize(dados.nome);
                return (
                  <div key={i} className="flex justify-between p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        {u.nome}
                        {isOwner && (
                          <BadgeCheck size={16} className="text-green-500" />
                        )}
                      </span>
                    </div>

                    <span className="opacity-75">{u.role}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <DarkModeToggle />
    </div>
  );
}
