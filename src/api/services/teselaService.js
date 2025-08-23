import api from "@/api/api.js";

export async function addTesela(data) {
  const response = await api.post("/tesselas", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function addConteutoTesela(data) {
  const response = await api.post("/tesselas/conteudo", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function adicionarMultiplosConteudos(data) {
  const response = await api.post("/tesselas/conteudos", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateTeselaLocation(data) {
  const response = await api.put("/tesselas", data);
  return response.data.data;
}

export async function getTeselaById(id) {
  const response = await api.get(`/tesselas/${id}`);
  return response.data.data;
}

export async function updateLabelTessela(data) {
  const response = await api.post(`/tesselas/atualizar-label`, data);
  return response.data.data;
}

export async function deleteTessela(idMosaico, idTessela) {
  const response = await api.delete(`/tesselas/${idMosaico}/${idTessela}`);
  return response.data.data;
}

export async function deleteContentTessela(idTessela, idConteudoTessela) {
  const response = await api.delete(
    `/tesselas/conteudo/${idTessela}/${idConteudoTessela}`
  );
  return response.data;
}

export async function updateDataTessela(data) {
  const response = await api.post("/tesselas/atualizar-dados", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function downloadConteudoTessela(url) {
  const response = await api.get(`/tesselas/download-conteudo?url=${encodeURIComponent(url)}`, {
    responseType: 'blob',
  });
  return response;
}
