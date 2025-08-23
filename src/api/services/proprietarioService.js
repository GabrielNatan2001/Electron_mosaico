import api from "@/api/api.js";

export async function UpdateNome(data) {
  const response = await api.post("/proprietario/atualizar-nome", data);
  return response.data.data;
}

export async function convidarUsuario(data) {
  const response = await api.post("/proprietario/vincular", data);
  return response.data;
}

export async function deletarUsuarioVinculado(data) {
  const response = await api.delete("/proprietario/usuario-vinculado", {
    data,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
}

export async function adicionarPlano(data) {
  const response = await api.post("/planos/add", data);
  return response.data;
}

export async function solicitarNovoPlano(data) {
  const response = await api.post("/planos/novo", data);
  return response.data;
}

export async function listarPlanos() {
  const response = await api.get(`/planos`);
  return response.data;
}

export async function deletarPlano(id) {
  const response = await api.delete("/planos/" + id);
  return response.data;
}

export async function enviarFeedBack(data) {
  const response = await api.post("/proprietario/feedback", data);
  return response.data;
}

export async function obterPlanoPorProprietarioId() {
  const response = await api.get("/planos/obter-plano");
  return response.data;
}
