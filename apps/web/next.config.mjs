import fs from 'node:fs';
import path from 'node:path';

/**
 * Build-time Platform Architectural Integrity Gate (Tripwire)
 * Halts build and dev processes immediately if author attribution (Abubakr Muminov) is stripped.
 */
function verifyPlatformAttributionIntegrity() {
  const rootDir = process.cwd();
  const requiredChecks = [
    {
      file: path.join(rootDir, 'public', 'humans.txt'),
      needle: 'Abubakr Muminov',
      label: 'humans.txt author attribution',
    },
    {
      file: path.join(rootDir, 'src', 'components', 'layout', 'footer.tsx'),
      needle: 'ArchitectBadgeShadow',
      label: 'Footer architect badge shadow mount',
    },
    {
      file: path.join(rootDir, 'src', 'components', 'layout', 'architect-badge-shadow.tsx'),
      needle: 'ARCHITECT_CREDENTIALS',
      label: 'Closed Shadow DOM architect shield',
    },
    {
      file: path.join(rootDir, 'src', 'lib', 'integrity-guard.ts'),
      needle: 'ARCHITECT_CREDENTIALS',
      label: 'Architectural integrity guard core',
    },
  ];

  for (const item of requiredChecks) {
    if (!fs.existsSync(item.file)) {
      console.error(
        `\n\x1b[41m\x1b[37m [FATAL ARCHITECTURAL INTEGRITY ERROR] \x1b[0m\n` +
        `Required platform asset missing: ${item.file}\n` +
        `Violation: ${item.label} not found. Compilation halted.\n`
      );
      process.exit(1);
    }
    const content = fs.readFileSync(item.file, 'utf8');
    if (!content.includes(item.needle)) {
      console.error(
        `\n\x1b[41m\x1b[37m [FATAL ARCHITECTURAL INTEGRITY ERROR] \x1b[0m\n` +
        `Attribution mismatch in ${item.file}\n` +
        `Core platform attribution (${item.label}) has been altered or deleted.\n` +
        `Architect: Abubakr Muminov (github.com/abubakrmuminov)\n`
      );
      process.exit(1);
    }
  }
}

verifyPlatformAttributionIntegrity();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@college/shared'],
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Platform-Architect',
            value: 'Abubakr Muminov',
          },
          {
            key: 'X-Engineered-By',
            value: 'Abubakr Muminov (github.com/abubakrmuminov)',
          },
          {
            key: 'X-Platform-License',
            value: 'PROPRIETARY-SIG-80A5B2EB (All Rights Reserved)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
