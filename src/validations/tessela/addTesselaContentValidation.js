import * as Yup from "yup";

export const addTesselaContentValidation = (t) => Yup.object().shape({
  descricao: Yup
    .string()
    .max(25, t("validation.maximumCharacters"))
    .when("tipo", {
      is: (tipo) => tipo !== "multiplos-conteudos",
      then: (schema) => schema.required(t("validation.descriptionRequired")),
      otherwise: (schema) => schema.notRequired(),
    }),
  tipo: Yup.string().required(t("validation.typeRequired")),
  valor: Yup
    .mixed()
    .test("valor-required", t("validation.typeRequired"), function (value) {
      const tipo = this.parent.tipo;
      if (!tipo) return false;
      if (tipo === "texto" || tipo === "link") return typeof value === "string" && value.trim().length > 0;
      if (tipo === "multiplos-conteudos") return Array.isArray(value) && value.length > 0;
      return value instanceof File;
    }),
});