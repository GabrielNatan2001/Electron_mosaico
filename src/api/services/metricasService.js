// src/api/services/metricasService.js
import api from "../api";

export async function obterTotaisMes(ano, mes) {
  const res = await api.get(`/metricas/financeiras/mes?ano=${ano}&mes=${mes}`);
  return res.data;
}

