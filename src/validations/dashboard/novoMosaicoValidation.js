import * as yup from 'yup'

export const novoMosaicoValidation = (t) => yup.object().shape({
    nome: yup.string().required(t("tesselaModal.mosaicNameRequired")),
    descricao: yup.string().required(t("tesselaModal.descriptionRequired")),
})