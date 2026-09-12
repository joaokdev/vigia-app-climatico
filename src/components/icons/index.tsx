import type { SVGProps } from "react";

/**
 * Linguagem de ícones própria do VIGIA.
 * Geometria consistente: viewBox 24x24, stroke 1.75, cantos
 * levemente arredondados, sem preenchimento sólido (exceto pontos
 * de dados). Não usar emoji como substituto destes ícones.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(props: IconProps) {
  const { size = 20, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export function IconTemperature(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 14.5V4a2 2 0 1 0-4 0v10.5a4 4 0 1 0 4 0Z" />
      <path d="M10 8h1" />
    </svg>
  );
}

export function IconRain(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 13a4 4 0 0 1 .5-7.96A5.5 5.5 0 0 1 18 7.5 3.5 3.5 0 0 1 17.5 13H7Z" />
      <path d="M8 17.5 7 20" />
      <path d="M12.5 17.5 11.5 20" />
      <path d="M17 17.5 16 20" />
    </svg>
  );
}

export function IconCloud(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 17a4 4 0 0 1 .5-7.96A5.5 5.5 0 0 1 18 10.5 3.5 3.5 0 0 1 17.5 17H7Z" />
    </svg>
  );
}

export function IconWind(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8h11.5a2.5 2.5 0 1 0-2.4-3.2" />
      <path d="M3 12.5h15a2.5 2.5 0 1 1-2.4 3.2" />
      <path d="M3 17h8" />
    </svg>
  );
}

export function IconLightning(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 3 5 14h5l-1 7 8-11h-5l1-7Z" />
    </svg>
  );
}

export function IconHumidity(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z" />
    </svg>
  );
}

export function IconPressure(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 13V8.5" />
      <path d="M12 13l3 1.6" />
      <path d="M9 3.5h6" />
    </svg>
  );
}

export function IconRiver(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
      <path d="M3 13c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
      <path d="M3 18c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
    </svg>
  );
}

export function IconStation(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20V10" />
      <circle cx="12" cy="6" r="2.5" />
      <path d="M7 20h10" />
      <path d="M8.5 15.5h7" />
    </svg>
  );
}

export function IconRadar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" opacity="0.6" />
      <path d="M12 12 18 7" />
    </svg>
  );
}

export function IconSatellite(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)" />
      <path d="M4 4l2.5 2.5" />
      <path d="M20 20l-2.5-2.5" />
      <path d="M16 4l1.5 1.5" />
    </svg>
  );
}

export function IconTerrain(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 18 9 8l3 5 2-3 7 8Z" />
    </svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconHistory(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12a9 9 0 1 0 2.7-6.4" />
      <path d="M3 4v4h4" />
      <path d="M12 8v4.5l3 2" />
    </svg>
  );
}

export function IconTrendUp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 16 10 9l4 4 6-7" />
      <path d="M15 5.5h5V10.5" />
    </svg>
  );
}

export function IconTrendDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8 10 15l4-4 6 7" />
      <path d="M15 18.5h5V13.5" />
    </svg>
  );
}

export function IconTrendFlat(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16" />
      <path d="M17 8.5 20.5 12 17 15.5" />
    </svg>
  );
}

export function IconLocation(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.8-1.4-2-3.4-2.1.7a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.4a7.7 7.7 0 0 0-2.6 1.5l-2.1-.7-2 3.4L4.6 10.5a7.6 7.6 0 0 0 0 3L2.8 14.9l2 3.4 2.1-.7c.75.65 1.63 1.16 2.6 1.5l.5 2.4h4l.5-2.4a7.7 7.7 0 0 0 2.6-1.5l2.1.7 2-3.4-1.8-1.4Z" />
    </svg>
  );
}

export function IconAccount(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function IconNotification(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
      <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.2 12H2M22 12h-2.2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5" />
    </svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function IconSystem(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16.5V20" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 5.5 15.5 12 9 18.5" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5.5 9 12 15.5 18.5 9" />
    </svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 16" />
      <path d="M4 20v-4h4" />
    </svg>
  );
}

export function IconMap(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

export function IconOffline(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 3l18 18" />
      <path d="M8.5 8.7A9.9 9.9 0 0 0 4 12" />
      <path d="M20 12a9.9 9.9 0 0 0-2.9-4" />
      <path d="M7.8 16A6 6 0 0 1 12 14a6 6 0 0 1 2.6.58" />
      <circle cx="12" cy="19" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.7A10.7 10.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a13.6 13.6 0 0 1-3.1 3.9" />
      <path d="M6.7 7.4A13.7 13.7 0 0 0 2.5 12S6 18.5 12 18.5a10 10 0 0 0 3.4-.6" />
      <path d="M9.9 9.9a2.6 2.6 0 0 0 3.6 3.6" />
    </svg>
  );
}
