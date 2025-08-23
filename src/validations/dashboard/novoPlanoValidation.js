import * as yup from 'yup'

export const novoPlanoValidation = yup.object().shape({
    nome: yup.string().required(),
    quantidadeDeMoisacos: yup.number().required(),
    quantidadeDeConteudos: yup.number().required(),
    valorMensal: yup.string().required(),
    valorAnual: yup.string().required(),
    priceIdAnual: yup.string().required(),
    priceIdMensal: yup.string().required(),
})
