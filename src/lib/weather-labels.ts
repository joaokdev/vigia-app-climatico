import type { SVGProps } from "react";
import { IconCloud, IconLightning, IconRain, IconSun } from "@/components/icons";
import type { WeatherSnapshot } from "@/lib/providers/types";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

type Condition = NonNullable<WeatherSnapshot["condition"]>;

/**
 * Rótulo e ícone por condição — ponto único de verdade para todo o
 * vocabulário de "condição" do VIGIA (usado no card regional, na
 * faixa de previsão de 7 dias e no detalhamento por dia). Extraído de
 * `RegionCard.tsx` para não duplicar o mapeamento a cada novo lugar
 * que precisa exibir uma condição.
 */
export const CONDITION_LABEL: Record<Condition, string> = {
  "ceu-limpo": "Céu limpo",
  "parcialmente-nublado": "Parcialmente nublado",
  nublado: "Nublado",
  "chuva-fraca": "Chuva fraca",
  "chuva-moderada": "Chuva moderada",
  "chuva-forte": "Chuva forte",
  tempestade: "Tempestade",
  nevoeiro: "Nevoeiro",
};

export const CONDITION_ICON: Record<Condition, (props: IconProps) => React.ReactElement> = {
  "ceu-limpo": IconSun,
  "parcialmente-nublado": IconCloud,
  nublado: IconCloud,
  "chuva-fraca": IconRain,
  "chuva-moderada": IconRain,
  "chuva-forte": IconRain,
  tempestade: IconLightning,
  nevoeiro: IconCloud,
};

export function conditionLabel(condition: WeatherSnapshot["condition"]): string {
  return condition ? CONDITION_LABEL[condition] : "Condição não disponível";
}
