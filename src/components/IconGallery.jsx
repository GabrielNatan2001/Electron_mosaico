import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import React from "react";

const icons = {
  icon1: "/iconesGerais/20250225t185343177z_icone_(30).png",
  iconGif: "/iconesGerais/clique.gif",
  icon5: "/iconesGerais/20250225t185131061z_icone_(7).png",
  icon7: "/iconesGerais/20250225t185915681z_icone_(76).png",
  icon8: "/iconesGerais/20250225t185127035z_icone_(6).png",
  icon10: "/iconesGerais/20250225t185331603z_icone_(28).png",
  icon12: "/iconesGerais/20250225t185745670z_icone_(61).png",
  icon16: "/iconesGerais/20250225t185857005z_icone_(72).png",
  icon17: "/iconesGerais/20250226t161726782z_contato.png",
  icon19: "/iconesGerais/20250226t161847803z_icone_(42).png",
  icon21: "/iconesGerais/20250225t185240030z_icone_(20).png",
  icon22: "/iconesGerais/20250225t185205903z_icone_(15).png",
  icon23: "/iconesGerais/20250226t161619714z_tessela_descricoaao.png",
  icon26: "/iconesGerais/20250225t185907336z_icone_(74).png",
  icon29: "/iconesGerais/20250225t185253563z_icone_(22).png",
  icon30: "/iconesGerais/20250225t185537573z_icone_(44).png",
  icon33: "/iconesGerais/20250225t183118847z_lixo.png",
  icon34: "/iconesGerais/20250225t185104393z_icone_(2).png",
  icon35: "/iconesGerais/20250225t185116183z_icone_(4).png",
  icon38: "/iconesGerais/20250225t185838563z_icone_(69).png",
  icon42: "/iconesGerais/20250225t185555611z_icone_(47).png",
  icon45: "/iconesGerais/20250225t185641818z_icone_(53).png",
  icon46: "/iconesGerais/20250226t161944831z_solicitar_acesso.png",
  icon47: "/iconesGerais/20250225t185259469z_icone_(23).png",
  icon52: "/iconesGerais/20250225t185434783z_icone_(38).png",
  icon53: "/iconesGerais/20250225t185722115z_icone_(58).png",
  icon54: "/iconesGerais/20250226t161650479z_atualizar_formatos.png",
  icon56: "/iconesGerais/20250226t161746152z_conteudo_site.png",
  icon57: "/iconesGerais/20250225t185306258z_icone_(24).png",
  icon60: "/iconesGerais/20250225t185325768z_icone_(27).png",
  icon61: "/iconesGerais/20250226t162133181z_conteudo_texto.png",
  icon63: "/iconesGerais/20250225t185933854z_icone_(78).png",
  icon66: "/iconesGerais/20250226t161908828z_producoaao_geral.png",
  icon67: "/iconesGerais/20250225t185247151z_icone_(21).png",
  icon68: "/iconesGerais/20250225t185829552z_icone_(68).png",
  icon69: "/iconesGerais/20250225t185159092z_icone_(13).png",
  icon71: "/iconesGerais/20250225t185058027z_icone_(1).png",
  icon74: "/iconesGerais/20250225t185812736z_icone_(65).png",
  icon78: "/iconesGerais/20250225t185350179z_icone_(31).png",
  icon81: "/iconesGerais/20250225t185406819z_icone_(34).png",
  icon85: "/iconesGerais/20250226t161702806z_icones.png",
  icon86: "/iconesGerais/20250226t161606496z_introducoaao.png",
  icon87: "/iconesGerais/20250225t185233818z_icone_(19).png",
  icon89: "/iconesGerais/20250226t162010296z_mosaico_free.png",
  icon91: "/iconesGerais/20250225t185120443z_icone_(5).png",
  icon94: "/iconesGerais/20250226t161421072z_treinamento_do_mosaico.png",
  icon95: "/iconesGerais/20250225t185544268z_icone_(45).png",
  icon96: "/iconesGerais/20250225t185219864z_icone_(17).png",
  icon97: "/iconesGerais/20250225t185902616z_icone_(73).png",
  icon98: "/iconesGerais/20250225t185313769z_icone_(25).png",
  icon99: "/iconesGerais/20250226t161539405z_alterar_visualizacoaao.png",
  icon107: "/iconesGerais/20250225t185228698z_icone_(18).png",
  icon109: "/iconesGerais/20250226t162000028z_mosaico_individual.png",
  icon112: "/iconesGerais/20250225t185411081z_icone_(35).png",
  icon113: "/iconesGerais/20250225t185517382z_icone_(41).png",
  icon114: "/iconesGerais/20250225t185111382z_icone_(3).png",
  icon115: "/iconesGerais/20250225t185144881z_icone_(10).png",
  icon116: "/iconesGerais/20250226t162039760z_icone_(80).png",
  icon117: "/iconesGerais/20250226t161636896z_contexto_descricoaao.png",
  icon118: "/iconesGerais/20250225t185148678z_icone_(11).png",
  icon120: "/iconesGerais/20250225t185135742z_icone_(8).png",
  icon123: "/iconesGerais/20250225t185319177z_icone_(26).png",
  icon125: "/iconesGerais/20250226t162151299z_conteudo_link.png",
  icon126: "/iconesGerais/20250225t185927199z_icone_(77).png",
  icon127: "/iconesGerais/20250226t161931063z_icone_(71).png",
  icon129: "/iconesGerais/20250225t185203026z_icone_(14).png",
  icon131: "/iconesGerais/20250225t185428737z_icone_(37).png",
  icon133: "/iconesGerais/20250226t162249266z_icone_(70).png",
  icon135: "/iconesGerais/20250225t185938916z_icone_(79).png",
  icon136: "/iconesGerais/20250225t185532901z_icone_(43).png",
  icon138: "/iconesGerais/20250225t185649548z_icone_(54).png",
  icon142: "/iconesGerais/20250226t162056821z_gerador_de_videos.png",
  icon143: "/iconesGerais/20250225t185635299z_icone_(52).png",
  icon144: "/iconesGerais/20250225t185654609z_icone_(55).png",
  icon145: "/iconesGerais/20250225t185154188z_icone_(12).png",
  icon146: "/iconesGerais/20250225t185726892z_icone_(59).png",
  icon147: "/iconesGerais/20250225t185816346z_icone_(66).png",
  icon148: "/iconesGerais/20250225t185354732z_icone_(32).png",
  icon149: "/iconesGerais/20250225t185336687z_icone_(29).png",
  icon152: "/iconesGerais/20250226t162119322z_icone_(57).png",
  icon154: "/iconesGerais/20250225t185821242z_icone_(67).png",
  icon155: "/iconesGerais/20250225t185609109z_icone_(49).png",
  icon156: "/iconesGerais/20250225t185208418z_icone_(16).png",
  icon157: "/iconesGerais/20250225t185419150z_icone_(36).png",
  icon158: "/iconesGerais/20250225t185140700z_icone_(9).png",
  icon160: "/iconesGerais/20250226t161551974z_diferenciais_e_beneficios.png",
  icon163: "/iconesGerais/20250225t185753196z_icone_(62).png",
  icon164: "/iconesGerais/20250225t185600885z_icone_(48).png",
  icon166: "/iconesGerais/20250226t161715921z_novo_usuario.png",
  icon168: "/iconesGerais/20250225t185738122z_icone_(60).png",
  icon169: "/iconesGerais/20250226t161525336z_tecnologia_mosaico.png",
};

const iconsArray = Object.entries(icons).map(([name, src]) => ({ name, src }));

export default function IconGallery({
  iconSelecionado,
  onSelect,
  aberto,
  toggle,
}) {
  const { t } = useTranslation();
  return (
    <div>
      <button className="flex items-center gap-1" onClick={toggle}>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            aberto ? "rotate-180" : ""
          }`}
        />
        <span>{t("tesselaModal.generalIcons")}</span>
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          aberto ? "max-h-[180px] mt-2" : "max-h-0"
        }`}
      >
        <div className="flex flex-wrap gap-2 pr-2 overflow-y-auto max-h-[140px]">
          {iconsArray.map(({ src, name }) => (
            <img
              key={name}
              src={src}
              alt={name}
              onClick={() => onSelect(src)}
              className={`w-10 h-10 object-contain cursor-pointer border-2 rounded ${
                iconSelecionado === src
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
