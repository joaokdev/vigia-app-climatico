import { getAtmosphere, STARS_BACKGROUND } from "@/lib/weather-visual";
import type { WeatherSnapshot } from "@/lib/providers/types";

/**
 * Camada atmosférica fixa atrás de todo o conteúdo da tela da cidade.
 * Puro CSS (sem canvas/JS de animação) — o "vento" e a "chuva" são
 * texturas sutis e estáticas ou com uma única animação lenta em loop,
 * nunca chamativas (ver apple-design §14: nada de looping perto de
 * 0.2Hz/full-viewport chamativo — aqui o ciclo é de dezenas de
 * segundos e a opacidade é baixa o bastante pra ler como "ambiente").
 * Desliga a respiração/deriva com prefers-reduced-motion via classes
 * motion-reduce:, e nunca soma opacidade que prejudique contraste do
 * conteúdo (o próprio Card glass cuida da legibilidade em cima disso).
 */
export function WeatherBackground({
  condition,
  isDay,
}: {
  condition: WeatherSnapshot["condition"];
  isDay: boolean;
}) {
  const atmo = getAtmosphere(condition, isDay);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 motion-safe:animate-[sky-drift_50s_ease-in-out_infinite]" style={{ backgroundImage: atmo.sky }} />
      <div className="absolute inset-0" style={{ backgroundImage: atmo.glow }} />
      {atmo.stars ? (
        <div
          className="absolute inset-0 opacity-80 motion-safe:animate-[stars-twinkle_6s_ease-in-out_infinite]"
          style={{ backgroundImage: STARS_BACKGROUND, backgroundSize: "120% 120%" }}
        />
      ) : null}
      {atmo.rain ? (
        <div
          className="absolute inset-[-10%] opacity-[0.12] motion-safe:animate-[rain-fall_1.1s_linear_infinite]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 14px)",
          }}
        />
      ) : null}
      {/* orbes suaves de profundidade — nunca chamativos, só dão "vida" ao céu */}
      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl motion-safe:animate-[float-slow_18s_ease-in-out_infinite]" />
      <div className="absolute -right-16 top-1/3 h-56 w-56 rounded-full bg-white/5 blur-3xl motion-safe:animate-[float-slow_22s_ease-in-out_infinite_reverse]" />
    </div>
  );
}
