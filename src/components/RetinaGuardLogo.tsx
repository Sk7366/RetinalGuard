import React from 'react';

interface RetinaGuardLogoProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

/**
 * RetinaGuard Official Brand Emblem
 * High-fidelity vector recreation of the biometric retinal fundus & OCT fusion emblem.
 * Features:
 * - Concentric biometric telemetry rings & circuit nodes
 * - Stylized eye silhouette
 * - Spherical retinal fundus photograph pupil with branching vascular arcades & optic disc
 * - Stratified OCT depth B-scan wave layers (neurosensory retina, RPE, choroid)
 * - DNA double-helix & neural graph computing nodes
 * - Sleek circular beveled medical badge frame
 */
export const RetinaGuardLogo: React.FC<RetinaGuardLogoProps> = ({
  className = 'w-8 h-8',
  size,
  showGlow = true,
}) => {
  const dimensionProps = size ? { width: size, height: size } : {};

  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...dimensionProps}
      aria-label="RetinaGuard Emblem"
    >
      <defs>
        {/* Outer Frame Bevel Gradient */}
        <linearGradient id="rg-bezel-grad" x1="64" y1="48" x2="448" y2="464" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#E2E8F0" />
          <stop offset="75%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Deep Tech Navy Disc Gradient */}
        <radialGradient id="rg-core-bg" cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="#113355" />
          <stop offset="48%" stopColor="#0a223a" />
          <stop offset="82%" stopColor="#061728" />
          <stop offset="100%" stopColor="#030e1a" />
        </radialGradient>

        {/* Outer Circuit Cyan Gradient */}
        <linearGradient id="rg-circuit-cyan" x1="100" y1="80" x2="412" y2="432" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Glowing Fundus Sphere (Pupil) */}
        <radialGradient id="rg-fundus-sphere" cx="62%" cy="48%" r="55%">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="22%" stopColor="#FBBF24" />
          <stop offset="55%" stopColor="#F97316" />
          <stop offset="82%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#991B1B" />
        </radialGradient>

        {/* Macula Center Foveal Shadow */}
        <radialGradient id="rg-macula-fovea" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7F1D1D" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#9A3412" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#C2410C" stopOpacity="0" />
        </radialGradient>

        {/* OCT Stratified Wave Gradients */}
        <linearGradient id="rg-oct-top" x1="180" y1="290" x2="332" y2="350" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>

        <linearGradient id="rg-oct-green" x1="190" y1="305" x2="322" y2="365" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="rg-oct-amber" x1="180" y1="315" x2="332" y2="375" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Soft Drop Shadow for Outer Badge */}
        <filter id="rg-drop-shadow" x="0" y="4" width="512" height="508" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0F172A" floodOpacity="0.25" />
        </filter>

        {/* Subtle Glow Filter */}
        <filter id="rg-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. OUTER BEVELED BADGE RIM */}
      <g filter="url(#rg-drop-shadow)">
        <circle cx="256" cy="256" r="236" fill="url(#rg-bezel-grad)" />
        <circle cx="256" cy="256" r="222" fill="#E2E8F0" />
        <circle cx="256" cy="256" r="218" fill="url(#rg-core-bg)" />
      </g>

      {/* 2. CONCENTRIC BIOMETRIC TRACKS & TELEMETRY */}
      {/* Outer Telemetry Ring */}
      <circle
        cx="256"
        cy="256"
        r="198"
        stroke="#1E3A5F"
        strokeWidth="3.5"
        strokeDasharray="14 10 4 10"
        opacity="0.85"
      />
      <circle
        cx="256"
        cy="256"
        r="182"
        stroke="#0284C7"
        strokeWidth="2.5"
        opacity="0.65"
      />
      <circle
        cx="256"
        cy="256"
        r="168"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeDasharray="8 6"
        opacity="0.5"
      />

      {/* Radial Telemetry Data Arcs (Top Right) */}
      <path
        d="M 390 195 A 182 182 0 0 1 422 276"
        stroke="#38BDF8"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="390" cy="195" r="4.5" fill="#E0F2FE" />
      <circle cx="422" cy="276" r="4.5" fill="#38BDF8" />

      {/* Circular dial gauge at upper right */}
      <circle cx="388" cy="168" r="16" stroke="#00E5FF" strokeWidth="2.5" strokeDasharray="18 12" fill="none" opacity="0.85" />
      <circle cx="388" cy="168" r="6" fill="#38BDF8" opacity="0.6" />

      {/* Telemetry circuits (Top-left & top-center) */}
      <path
        d="M 180 110 L 256 110 L 256 142"
        stroke="#38BDF8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <circle cx="180" cy="110" r="4.5" fill="#38BDF8" />
      <circle cx="256" cy="110" r="4.5" fill="#E0F2FE" />
      <circle cx="256" cy="142" r="5" fill="#00E5FF" />

      {/* Target lock tick marks */}
      <path d="M 256 80 L 256 94" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" />
      <path d="M 432 256 L 418 256" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" />
      <path d="M 80 256 L 94 256" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" />

      {/* 3. DNA HELIX & HUMAN PROFILE CONTROURS (Bottom Left) */}
      <g opacity="0.85">
        {/* Twin Helix Strands */}
        <path
          d="M 152 320 Q 166 350 186 376 Q 206 402 232 418"
          stroke="#00E5FF"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 172 310 Q 192 344 212 374 Q 232 404 256 422"
          stroke="#38BDF8"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Base-pair Rungs */}
        <line x1="160" y1="316" x2="178" y2="312" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="172" y1="340" x2="194" y2="336" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="188" y1="366" x2="210" y2="362" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="208" y1="392" x2="230" y2="388" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="230" y1="414" x2="252" y2="410" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" />

        {/* Human Silhouette Node Curve */}
        <path
          d="M 148 290 Q 138 312 142 334 Q 146 350 156 366"
          stroke="#7DD3FC"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* 4. NEURAL NETWORK & MOLECULAR NODES (Bottom Right) */}
      <g opacity="0.85">
        {/* Network Connector Lines */}
        <line x1="334" y1="340" x2="368" y2="358" stroke="#00E5FF" strokeWidth="2" />
        <line x1="368" y1="358" x2="402" y2="340" stroke="#00E5FF" strokeWidth="2" />
        <line x1="368" y1="358" x2="376" y2="394" stroke="#00E5FF" strokeWidth="2" />
        <line x1="402" y1="340" x2="416" y2="376" stroke="#00E5FF" strokeWidth="2" />
        <line x1="376" y1="394" x2="416" y2="376" stroke="#00E5FF" strokeWidth="2" />
        <line x1="344" y1="384" x2="376" y2="394" stroke="#00E5FF" strokeWidth="2" />

        {/* Glowing Network Nodes */}
        <circle cx="334" cy="340" r="4.5" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
        <circle cx="368" cy="358" r="5.5" fill="#00E5FF" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="402" cy="340" r="4.5" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
        <circle cx="376" cy="394" r="5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="416" cy="376" r="5.5" fill="#00E5FF" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="344" cy="384" r="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
      </g>

      {/* 5. THE EYE SILHOUETTE CONTOUR */}
      {/* Outer Glow Path */}
      <path
        d="M 126 260 C 168 182 344 182 386 260 C 344 338 168 338 126 260 Z"
        stroke="#00E5FF"
        strokeWidth="5"
        strokeLinejoin="round"
        opacity="0.4"
        filter={showGlow ? 'url(#rg-glow)' : undefined}
      />
      {/* Sharp Inner Eye Contour */}
      <path
        d="M 130 260 C 170 186 342 186 382 260 C 342 334 170 334 130 260 Z"
        stroke="#E0F2FE"
        strokeWidth="3.5"
        fill="#041222"
        fillOpacity="0.85"
      />

      {/* 6. SPHERICAL RETINAL FUNDUS PUPIL (Centerpiece) */}
      <g>
        {/* Outer Fundus Rim Highlight */}
        <circle cx="256" cy="242" r="74" fill="none" stroke="#FDE68A" strokeWidth="2.5" opacity="0.75" />

        {/* Fundus Retinal Sphere */}
        <circle cx="256" cy="242" r="72" fill="url(#rg-fundus-sphere)" />

        {/* Macula Center Foveal Area */}
        <circle cx="236" cy="248" r="22" fill="url(#rg-macula-fovea)" />
        <circle cx="236" cy="248" r="4.5" fill="#7F1D1D" opacity="0.9" />

        {/* Optic Disc (Bright Yellow-Gold Crescent) */}
        <ellipse cx="288" cy="244" rx="14" ry="17" fill="#FEF08A" opacity="0.95" />
        <ellipse cx="286" cy="244" rx="9" ry="12" fill="#FDE047" opacity="0.85" />
        <ellipse cx="285" cy="244" rx="5" ry="7" fill="#FFFBEB" opacity="0.95" />

        {/* Branching Retinal Blood Vessels (Arcades) */}
        <g stroke="#991B1B" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
          {/* Superior Temporal Arcade (curves up and left toward macula) */}
          <path d="M 285 233 Q 278 208 250 200 Q 228 196 208 208" strokeWidth="3" fill="none" />
          <path d="M 252 201 Q 242 190 226 188" strokeWidth="1.8" fill="none" />
          <path d="M 268 212 Q 256 220 242 222" strokeWidth="1.5" fill="none" />

          {/* Inferior Temporal Arcade (curves down and left under macula) */}
          <path d="M 286 254 Q 276 276 252 284 Q 228 288 210 274" strokeWidth="2.8" fill="none" />
          <path d="M 254 283 Q 244 294 228 296" strokeWidth="1.6" fill="none" />
          <path d="M 268 266 Q 254 260 244 256" strokeWidth="1.4" fill="none" />

          {/* Nasal Arcades (radiate toward right edge) */}
          <path d="M 296 238 Q 312 232 324 236" strokeWidth="2" fill="none" />
          <path d="M 296 248 Q 314 256 324 252" strokeWidth="2" fill="none" />

          {/* Macular Capillary Clusters / Micro-lesions */}
          <circle cx="218" cy="234" r="1.8" fill="#7F1D1D" stroke="none" />
          <circle cx="224" cy="262" r="1.6" fill="#7F1D1D" stroke="none" />
          <circle cx="254" cy="226" r="2" fill="#7F1D1D" stroke="none" />
          <circle cx="260" cy="270" r="1.8" fill="#7F1D1D" stroke="none" />
          <circle cx="204" cy="224" r="1.4" fill="#7F1D1D" stroke="none" />
          <circle cx="214" cy="276" r="1.5" fill="#7F1D1D" stroke="none" />
        </g>
      </g>

      {/* 7. OCT STRATIFIED B-SCAN DEPTH WAVES (Lower Eye Section) */}
      <g>
        {/* Curving Lower Eyelid / OCT Cradle Boundary */}
        <path
          d="M 188 284 C 218 316 294 316 324 284 C 336 322 308 348 256 352 C 204 348 176 322 188 284 Z"
          fill="#061D33"
          stroke="#00E5FF"
          strokeWidth="2.5"
        />

        {/* Layer 1: Neurosensory Retina / ILM Wave (Cyan) */}
        <path
          d="M 194 292 Q 224 316 256 308 Q 288 300 318 292 Q 298 322 256 320 Q 214 318 194 292 Z"
          fill="url(#rg-oct-top)"
        />

        {/* Layer 2: Plexiform / Nuclear Layers with Foveal Dip (Emerald/Mint Green) */}
        <path
          d="M 196 306 Q 226 326 256 322 Q 286 318 316 306 Q 296 334 256 334 Q 216 334 196 306 Z"
          fill="url(#rg-oct-green)"
        />

        {/* Layer 3: RPE - Retinal Pigment Epithelium (Golden-Orange Hyper-reflective) */}
        <path
          d="M 200 320 Q 228 338 256 336 Q 284 334 312 320 Q 292 346 256 346 Q 220 346 200 320 Z"
          fill="url(#rg-oct-amber)"
        />

        {/* Outer Aerodynamic Swoosh (Teal & Gold Trim) */}
        <path
          d="M 178 280 C 196 326 230 358 274 362 C 314 366 340 338 348 314 C 344 334 322 366 274 368 C 224 370 186 332 178 280 Z"
          fill="#00E5FF"
          opacity="0.85"
        />
        <path
          d="M 184 296 C 200 334 232 364 270 368 C 250 368 214 354 196 328 C 188 316 185 306 184 296 Z"
          fill="#F59E0B"
          opacity="0.9"
        />
      </g>

      {/* 8. GLASS REFLECTION / SPECULAR HIGHLIGHT */}
      <path
        d="M 152 232 C 182 178 308 178 358 226 C 330 200 210 196 152 232 Z"
        fill="#FFFFFF"
        opacity="0.22"
      />
      <circle cx="282" cy="198" r="3.5" fill="#FFFFFF" opacity="0.6" />
      <circle cx="372" cy="238" r="2.5" fill="#00E5FF" opacity="0.8" />
    </svg>
  );
};

export default RetinaGuardLogo;
