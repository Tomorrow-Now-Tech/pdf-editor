import { execFileSync } from 'node:child_process';

export const sourceBranchUrl = 'https://github.com/Trader855/PDF/tree/web';

export function readSourceRevision(root, requireClean = false) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  try {
    const sha = git('rev-parse', 'HEAD');
    if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Invalid source revision');
    const dirty = git('status', '--porcelain', '--untracked-files=normal');
    if (dirty) throw new Error('Uncommitted source changes');
    return sha;
  } catch (error) {
    if (requireClean) throw new Error(`Commit the exact web source before the production build: ${error.message}`);
    return '';
  }
}

export function sourceProvenancePlugin(revision) {
  return {
    name: 'pdf-source-provenance',
    generateBundle() {
      this.emitFile({
        type: 'asset', fileName: 'source-version.json',
        source: JSON.stringify({
          revision,
          sourceUrl: revision ? `https://github.com/Trader855/PDF/tree/${revision}` : sourceBranchUrl,
          archiveUrl: revision ? `https://github.com/Trader855/PDF/archive/${revision}.zip` : null,
          license: 'AGPL-3.0-only',
        }, null, 2),
      });
    },
  };
}
