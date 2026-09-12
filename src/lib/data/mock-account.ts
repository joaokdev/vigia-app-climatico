/**
 * Dado de conta de demonstração. NÃO representa uma sessão real —
 * a FASE 1 não possui autenticação/backend. Isolado aqui para que
 * a substituição por um usuário autenticado real na FASE 2 seja
 * uma troca de fonte, não uma reescrita das páginas de conta.
 */
export const mockAccount = {
  name: "Usuário de demonstração",
  email: "demo@vigia.exemplo",
  favoriteRegionSlug: "uniao-da-vitoria" as const,
  memberSince: "2026-01-01",
  notificationChannels: {
    push: true,
    email: true,
    sms: false,
  },
  preferences: {
    temperatureUnit: "celsius" as "celsius" | "fahrenheit",
    windUnit: "kmh" as "kmh" | "ms",
  },
};

export const mockNotifications = [
  {
    id: "n1",
    title: "Aviso de chuva intensa emitido para União da Vitória / Porto União",
    body: "A Defesa Civil emitiu um aviso para a bacia do Rio Iguaçu.",
    read: false,
    createdAt: "2026-09-11T14:30:00.000Z",
  },
  {
    id: "n2",
    title: "Nível do Rio Iguaçu em observação",
    body: "O indicador interno do VIGIA passou de normal para observação.",
    read: false,
    createdAt: "2026-09-11T11:05:00.000Z",
  },
  {
    id: "n3",
    title: "Resumo diário — Bituruna",
    body: "Amplitude térmica alta prevista para as próximas 24 horas.",
    read: true,
    createdAt: "2026-09-10T09:00:00.000Z",
  },
];
