import * as yup from "yup";

export const registerValidation = (t) => yup.object().shape({
  nome: yup.string().required(t("login.nameRequired")),
    email: yup
      .string()
      .email(t("login.emailNotValid"))
      .required(t("login.emailRequired")),
    senha: yup
      .string()
      .min(6, t("login.passwordShort"))
      .required(t("login.passwordRequired")),
});
