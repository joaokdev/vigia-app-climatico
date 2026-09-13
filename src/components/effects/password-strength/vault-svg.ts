/** SVG do "cofre" (vault) — copiado verbatim do efeito de referência.
 * Não editar à mão; todos os ids são consultados por visualizer.js. */
export const VAULT_SVG_MARKUP = `<svg
                class="vault-svg"
                id="vault-svg"
                viewBox="150 150 260 260"
                xmlns="http://www.w3.org/2000/svg"
                focusable="false"
              >
                  <defs>
                    <linearGradient id="metal-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#d8dce6" />
                      <stop offset="45%" stop-color="#9aa3b5" />
                      <stop offset="100%" stop-color="#6b7384" />
                    </linearGradient>
                    <linearGradient id="metal-gold" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#f5e087" />
                      <stop offset="40%" stop-color="#d4a84b" />
                      <stop offset="100%" stop-color="#9a6b24" />
                    </linearGradient>
                    <linearGradient id="metal-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#8b93a5" />
                      <stop offset="50%" stop-color="#4a5160" />
                      <stop offset="100%" stop-color="#2a2f3a" />
                    </linearGradient>
                    <linearGradient id="vault-face" x1="30%" y1="0%" x2="70%" y2="100%">
                      <stop offset="0%" stop-color="#6a7284" />
                      <stop offset="50%" stop-color="#3a404e" />
                      <stop offset="100%" stop-color="#1e222c" />
                    </linearGradient>
                    <radialGradient id="hub-glow" cx="50%" cy="45%" r="55%">
                      <stop offset="0%" stop-color="#5a6478" />
                      <stop offset="70%" stop-color="#2c313c" />
                      <stop offset="100%" stop-color="#161920" />
                    </radialGradient>
                    <filter id="soft-glow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="2.2" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <!-- EMPTY / open doorway -->
                  <g id="vv-empty" class="vv-empty">
                    <!-- Floor shadow through opening -->
                    <ellipse
                      cx="278"
                      cy="352"
                      rx="48"
                      ry="8"
                      fill="#000"
                      opacity="0.35"
                    />
                    <!-- Door frame -->
                    <path
                      d="M228 348
                         V212
                         c0-10 8-18 18-18
                         h88
                         c10 0 18 8 18 18
                         V348"
                      fill="none"
                      stroke="#4a5160"
                      stroke-width="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M228 348
                         V212
                         c0-10 8-18 18-18
                         h88
                         c10 0 18 8 18 18
                         V348"
                      fill="none"
                      stroke="#6b7384"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      opacity="0.55"
                    />
                    <!-- Empty opening (dark void) -->
                    <path
                      d="M240 340
                         V218
                         c0-4 3-7 7-7
                         h66
                         c4 0 7 3 7 7
                         V340
                         Z"
                      fill="#0a0a0e"
                      opacity="0.55"
                    />
                    <!-- Soft depth lines in the void -->
                    <path
                      d="M255 230 v95 M280 225 v105 M305 230 v95"
                      stroke="#2a2f3a"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      opacity="0.7"
                    />
                    <!-- Door leaf swung open to the right -->
                    <g id="vv-open-door">
                      <path
                        d="M334 204
                           L392 218
                           L392 358
                           L334 348
                           Z"
                        fill="#2a2f3a"
                        stroke="#5c6474"
                        stroke-width="2"
                        stroke-linejoin="round"
                      />
                      <!-- Door panel inset -->
                      <path
                        d="M344 228
                           L380 236
                           L380 330
                           L344 322
                           Z"
                        fill="none"
                        stroke="#3a3f4c"
                        stroke-width="1.5"
                        opacity="0.9"
                      />
                      <!-- Door edge highlight -->
                      <path
                        d="M334 204 L334 348"
                        stroke="#8b93a5"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        opacity="0.45"
                      />
                      <!-- Handle on open door -->
                      <circle cx="372" cy="286" r="4.5" fill="#6b7384" />
                      <circle cx="372" cy="286" r="2" fill="#9aa3b5" />
                    </g>
                    <!-- Empty strike plate / missing lock on frame -->
                    <rect
                      x="318"
                      y="274"
                      width="8"
                      height="14"
                      rx="1.5"
                      fill="#3a3f4c"
                      opacity="0.8"
                    />
                    <circle cx="322" cy="281" r="1.8" fill="#1a1d24" />
                  </g>

                  <!-- PAPERCLIP -->
                  <g id="vv-paperclip" class="vv-paperclip">
                    <path
                      id="vv-clip-path"
                      d="M248 245
                         c0-18 14-32 32-32
                         s32 14 32 32
                         v78
                         c0 28-22 48-48 48
                         s-48-20-48-48
                         v-62
                         c0-14 11-26 26-26
                         s26 12 26 26
                         v48
                         c0 8-6 14-14 14
                         s-14-6-14-14
                         v-36"
                      fill="none"
                      stroke="url(#metal-silver)"
                      stroke-width="7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M248 245
                         c0-18 14-32 32-32
                         s32 14 32 32
                         v78
                         c0 28-22 48-48 48
                         s-48-20-48-48
                         v-62
                         c0-14 11-26 26-26
                         s26 12 26 26
                         v48
                         c0 8-6 14-14 14
                         s-14-6-14-14
                         v-36"
                      fill="none"
                      stroke="#ffffff"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      opacity="0.28"
                      transform="translate(-1.5 -1.5)"
                    />
                  </g>

                  <!-- PADLOCK -->
                  <g id="vv-padlock" class="vv-padlock">
                    <path
                      id="vv-pad-shackle"
                      d="M236 268
                         v-28
                         c0-24 19-44 44-44
                         s44 20 44 44
                         v28"
                      fill="none"
                      stroke="url(#metal-silver)"
                      stroke-width="14"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M236 268 v-28 c0-24 19-44 44-44 s44 20 44 44 v28"
                      fill="none"
                      stroke="#fff"
                      stroke-width="2"
                      stroke-linecap="round"
                      opacity="0.22"
                      transform="translate(-2 -2)"
                    />
                    <rect
                      id="vv-pad-body"
                      x="222"
                      y="262"
                      width="116"
                      height="100"
                      rx="16"
                      fill="url(#metal-gold)"
                    />
                    <rect
                      id="vv-pad-face"
                      x="230"
                      y="270"
                      width="100"
                      height="84"
                      rx="12"
                      fill="#c4923a"
                      opacity="0.35"
                    />
                    <g id="vv-pad-keyhole">
                      <circle cx="280" cy="308" r="11" fill="#2a1f0e" />
                      <rect x="275.5" y="312" width="9" height="22" rx="3" fill="#2a1f0e" />
                    </g>
                  </g>

                  <!-- DEADBOLT -->
                  <g id="vv-deadbolt" class="vv-deadbolt">
                    <circle
                      id="vv-dead-outer"
                      cx="280"
                      cy="280"
                      r="78"
                      fill="url(#metal-dark)"
                      stroke="#9aa3b5"
                      stroke-width="3"
                    />
                    <circle
                      id="vv-dead-ring"
                      cx="280"
                      cy="280"
                      r="62"
                      fill="none"
                      stroke="#c5ccd8"
                      stroke-width="5"
                      opacity="0.55"
                    />
                    <circle
                      id="vv-dead-inner"
                      cx="280"
                      cy="280"
                      r="44"
                      fill="#2a2f3a"
                      stroke="#6b7384"
                      stroke-width="2"
                    />
                    <circle
                      id="vv-dead-cylinder"
                      cx="280"
                      cy="280"
                      r="26"
                      fill="url(#metal-silver)"
                      stroke="#dfe3ec"
                      stroke-width="1.5"
                    />
                    <rect
                      id="vv-dead-slot"
                      x="276"
                      y="262"
                      width="8"
                      height="36"
                      rx="2.5"
                      fill="#1a1d24"
                    />
                    <!-- mechanical bolt stubs -->
                    <rect class="vv-dead-bolt" x="268" y="198" width="24" height="14" rx="3" fill="#8b93a5" />
                    <rect class="vv-dead-bolt" x="268" y="348" width="24" height="14" rx="3" fill="#8b93a5" />
                    <rect class="vv-dead-bolt" x="198" y="268" width="14" height="24" rx="3" fill="#8b93a5" />
                    <rect class="vv-dead-bolt" x="348" y="268" width="14" height="24" rx="3" fill="#8b93a5" />
                  </g>

                  <!-- BANK VAULT -->
                  <g id="vv-vault" class="vv-vault">
                    <circle
                      id="vv-vault-outer"
                      cx="280"
                      cy="280"
                      r="92"
                      fill="url(#metal-dark)"
                      stroke="#a8b0c0"
                      stroke-width="4"
                    />
                    <circle
                      cx="280"
                      cy="280"
                      r="86"
                      fill="none"
                      stroke="#3dff8a"
                      stroke-width="1.5"
                      opacity="0.22"
                      class="vv-vault-accent"
                    />
                    <circle
                      id="vv-vault-mid"
                      cx="280"
                      cy="280"
                      r="72"
                      fill="none"
                      stroke="#7a8498"
                      stroke-width="6"
                    />
                    <circle
                      id="vv-vault-groove"
                      cx="280"
                      cy="280"
                      r="64"
                      fill="none"
                      stroke="#2a2f3a"
                      stroke-width="3"
                    />
                    <circle
                      id="vv-vault-door"
                      cx="280"
                      cy="280"
                      r="56"
                      fill="url(#vault-face)"
                      stroke="#6b7384"
                      stroke-width="2"
                    />
                    <!-- locking bolts around perimeter -->
                    <g id="vv-vault-bolts">
                      <rect class="vv-vault-bolt" x="272" y="178" width="16" height="22" rx="3" fill="#b8c0d0" />
                      <rect class="vv-vault-bolt" x="272" y="360" width="16" height="22" rx="3" fill="#b8c0d0" />
                      <rect class="vv-vault-bolt" x="178" y="272" width="22" height="16" rx="3" fill="#b8c0d0" />
                      <rect class="vv-vault-bolt" x="360" y="272" width="22" height="16" rx="3" fill="#b8c0d0" />
                      <rect class="vv-vault-bolt" x="214" y="204" width="16" height="20" rx="3" fill="#9aa3b5" transform="rotate(-45 222 214)" />
                      <rect class="vv-vault-bolt" x="330" y="204" width="16" height="20" rx="3" fill="#9aa3b5" transform="rotate(45 338 214)" />
                      <rect class="vv-vault-bolt" x="214" y="336" width="16" height="20" rx="3" fill="#9aa3b5" transform="rotate(45 222 346)" />
                      <rect class="vv-vault-bolt" x="330" y="336" width="16" height="20" rx="3" fill="#9aa3b5" transform="rotate(-45 338 346)" />
                    </g>
                    <!-- spokes / locking wheel -->
                    <g id="vv-vault-spokes">
                      <line x1="280" y1="232" x2="280" y2="256" stroke="#c5ccd8" stroke-width="5" stroke-linecap="round" />
                      <line x1="280" y1="304" x2="280" y2="328" stroke="#c5ccd8" stroke-width="5" stroke-linecap="round" />
                      <line x1="232" y1="280" x2="256" y2="280" stroke="#c5ccd8" stroke-width="5" stroke-linecap="round" />
                      <line x1="304" y1="280" x2="328" y2="280" stroke="#c5ccd8" stroke-width="5" stroke-linecap="round" />
                      <line x1="248" y1="248" x2="264" y2="264" stroke="#9aa3b5" stroke-width="4" stroke-linecap="round" />
                      <line x1="312" y1="248" x2="296" y2="264" stroke="#9aa3b5" stroke-width="4" stroke-linecap="round" />
                      <line x1="248" y1="312" x2="264" y2="296" stroke="#9aa3b5" stroke-width="4" stroke-linecap="round" />
                      <line x1="312" y1="312" x2="296" y2="296" stroke="#9aa3b5" stroke-width="4" stroke-linecap="round" />
                    </g>
                    <circle
                      id="vv-vault-hub"
                      cx="280"
                      cy="280"
                      r="22"
                      fill="url(#hub-glow)"
                      stroke="#d0d6e2"
                      stroke-width="2.5"
                    />
                    <circle cx="280" cy="280" r="10" fill="#1a1d24" stroke="#3dff8a" stroke-width="1.5" class="vv-vault-accent" />
                    <circle cx="280" cy="280" r="4" fill="#3dff8a" class="vv-vault-accent" opacity="0.85" filter="url(#soft-glow)" />
                  </g>
                </svg>`;
