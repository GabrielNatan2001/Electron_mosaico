import * as yup from 'yup'

export const settingsValidation = (t) => yup.object().shape({
    senha: yup.string().required(t("login.passwordRequired")),
    confirmarSenha: yup.string().required(t("login.passwordRequired")),
})