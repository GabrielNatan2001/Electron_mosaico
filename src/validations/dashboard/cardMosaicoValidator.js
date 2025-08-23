import * as yup from 'yup'

export const cardMosaicoValidator = yup.object().shape({
    nome: yup.string().required(),
    descricao: yup.string().required(),
})