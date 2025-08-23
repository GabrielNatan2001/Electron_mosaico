import { useTranslation } from "react-i18next";
import Logo from "../assets/logoMosaico.png";
import DarkModeToggle from "@/components/theme/darkToggleMode";

export default function PoliticaPrivacidadePage() {
  const { t } = useTranslation();

  const secoes = [
    { key: "infoColetadas", texto: "infoDetalhes" },
    { key: "usoInfo", texto: "usoDetalhes" },
    { key: "compartilhamento", texto: "compartilhamentoDetalhes" },
    { key: "armazenamento", texto: "armazenamentoDetalhes" },
    { key: "direitos", texto: "direitosDetalhes" },
    { key: "cookies", texto: "cookiesDetalhes" },
    { key: "alteracoes", texto: "alteracoesDetalhes" },
    { key: "contato", texto: "contatoDetalhes" },
  ];

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 py-10 flex flex-col items-center theme-gradient transition-colors duration-300">
      <div className="w-full max-w-5xl rounded-xl p-6 sm:p-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-left text-black dark:text-white tracking-tight">
            {t("politicaPrivacidade.titulo")}
          </h1>
          <img src={Logo} alt="logo" className="w-12 opacity-90" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm sm:text-base mt-6">
          {secoes.map(({ key, texto }, index) => (
            <div
              key={key}
              className="space-y-1 pt-4 border-t border-gray-200 dark:border-[#3a4a63]"
            >
              <h2 className="font-semibold text-black dark:text-white">
                {t(`politicaPrivacidade.${key}`)}
              </h2>
              <p className="whitespace-pre-line text-gray-800 dark:text-gray-200">
                {t(`politicaPrivacidade.${texto}`)}
              </p>
            </div>
          ))}
        </div>

        <p className="text-sm text-center text-gray-500 dark:text-gray-300">
          {t("politicaPrivacidade.dataUltimaAtualizacao")}
        </p>
      </div>

      <div className="mt-6">
        <DarkModeToggle />
      </div>
    </div>
  );
}
