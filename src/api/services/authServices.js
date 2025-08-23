import api from "@/api/api.js";

export async function loginAsync(body) {
  const response = await api.post("/user/login", body);
  return response.data.data;
}

export async function esqueceuSenhaAsync(body) {
  const response = await api.post("/user/esqueceu-senha", body);
  return response.data;
}

export async function resetarSenha(body) {
  const response = await api.post("/user/resetar-senha", body);
  return response.data;
}

export async function alterarSenha(body) {
  const response = await api.post("/user/alterar-senha", body);
  return response.data;
}

export async function cadastrarAsync(body) {
  const response = await api.post("/proprietario/add", body);
  return response.data;
}

export async function obterUsuariosVinculadosAoProprietario(id) {
  const response = await api.get("/proprietario/usuarios/" + id);
  return response.data;
}

export async function ativarEmailProprietario(id) {
  const response = await api.get(`/proprietario/ativar-usuario?id=${id}`);
  return response.data;
}
