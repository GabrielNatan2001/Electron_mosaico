import api from "@/api/api.js";

export async function obterMosaicoGlobalInfo() {
  const response = await api.get(`informacoes`);
  return response.data.data;
}

export async function getTeselaByIdInfo(id) {
  const response = await api.get(`/informacoes/tessela/${id}`);
  return response.data.data;
}

export async function obterMetricas() {
  const response = await api.get(`informacoes/dashboard`);
  return response.data;
}

export async function ObterMosaicosPublicos() {
  const response = await api.get(`informacoes/mosaicos-publicados`);
  return response.data.data;
}

export async function obterMetricasProprietarios(filtros = {}) {
  const {
    nome,
    nomePlano,
    dataCriacao,
    minUsuarios,
    minMosaicos,
    minTessela,
    page = 1,
    pageSize = 10,
  } = filtros;

  const params = {};

  if (nome) params.nome = nome;
  if (nomePlano) params.nomePlano = nomePlano;
  if (dataCriacao) params.dataCriacao = dataCriacao;
  if (minUsuarios != null) params.minUsuarios = minUsuarios;
  if (minMosaicos != null) params.minMosaicos = minMosaicos;
  if (minTessela != null) params.minTessela = minTessela;

  params.page = page;
  params.pageSize = pageSize;

  const response = await api.get("informacoes/proprietarios", { params });

  return response.data;
}

export async function obterDetalhesProprietario(id, token) {
  const { data } = await api.get(`informacoes/proprietarios/${id}/detalhes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
