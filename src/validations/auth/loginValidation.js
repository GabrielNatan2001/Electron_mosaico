import * as yup from "yup";

export const loginValidation = (t) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t("login.emailNotValid"))
      .required(t("login.emailRequired")),
    senha: yup
      .string()
      .min(6, t("login.passwordShort"))
      .required(t("login.passwordRequired")),
  });
