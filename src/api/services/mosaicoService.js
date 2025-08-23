import api from "@/api/api.js";

export async function getMosaicos() {
  const response = await api.get("/mosaicos/obter-todos-mosaicos");
  return response.data.data;
}

export async function getMosaicoById(id) {
  const response = await api.get(`mosaicos/${id}`);
  return response.data.data;
}

export async function getMosaicoByPath(path) {
  const response = await api.get(`informacoes/mosaico-path/${path}`);
  return response.data.data;
}

export async function updatePlanoDeFundo(request) {
  const response = await api.put(`/mosaicos/plano-de-fundo`, request, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function criarMosaicoAsync(request) {
  const response = await api.post("/mosaicos", request);
  return response.data;
}

export async function atualizarMosaicoAsync(body) {
  const response = await api.put(`/mosaicos`, body);
  return response.data;
}
