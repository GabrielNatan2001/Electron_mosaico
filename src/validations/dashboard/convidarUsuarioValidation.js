import * as yup from 'yup'

export const convidarUsuarioValidation = (t) => yup.object().shape({
    nome: yup.string().required(t("login.nameRequired")),
    email: yup.string().email().required(t("login.emailRequired"))
})
