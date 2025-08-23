import * as Yup from "yup";

export const modalTesselaValidation = (t) => Yup.object().shape({
  nome: Yup.string()
    .required(t("login.nameRequired")),

  descricao: Yup.string()
    .max(25, t("validation.maximumCharacters"))
    .when("tipo", {
      is: (tipo) => tipo !== "multiplos-conteudos" && tipo !== "arquivo",
      then: (schema) => schema.required(t("validation.descriptionRequired")),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  tipo: Yup.string()
    .required(t("validation.typeRequired")),

  valor: Yup.mixed()
    .nullable()
    .test("valor-required", t("validation.valueRequired"), function (value) {
      const tipo = this.parent.tipo;

      if (!tipo) return false;

      if (tipo === "texto" || tipo === "link") {
        return typeof value === "string" && value.trim().length > 0;
      }

      if (tipo === "multiplos-conteudos") {
        return Array.isArray(value) && value.length > 0;
      }

      if (tipo === "arquivo") {
        return Array.isArray(value) && value.length > 0;
      }

      return false;
    }),
});
