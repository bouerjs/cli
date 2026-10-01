/**
 * Utility to convert human-readable size strings (e.g., '500kb', '1.5mb', '2gb') into bytes.
 */
function parseToBytes(size) {
  if (typeof size === 'number') return size;
  if (typeof size !== 'string') return 0;

  const match = size.trim().match(/^([\d.]+)\s*([a-zA-Z]+)?$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = (match[2] || 'b').toLowerCase();

  switch (unit) {
    case 'gb': case 'g':
      return value * 1024 * 1024 * 1024;
    case 'mb': case 'm':
      return value * 1024 * 1024;
    case 'kb': case 'k':
      return value * 1024;
    case 'b': case 'bytes':
    default:
      return value;
  }
}

function formatBytes(bytes) {
  const decimals = 2;

  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return '0 bytes';
  if (bytes === 0) return '0 bytes';

  // Handle small values directly (1 byte vs N bytes)
  if (bytes === 1) return '1 byte';
  if (bytes < 1024) return `${bytes} bytes`;

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const units = ['bytes', 'KiB', 'MB', 'GB', 'TB', 'PB'];

  // Calculate logarithmic index based on base 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${value} ${units[i]}`;
}

/**
 * Enhanced exclusion handler supporting RegExp, string lists, and pipe patterns like "*.pdf|.svg"
 */
function isExcluded(filename, excludePatterns = []) {
  return excludePatterns.some((pattern) => {
    return filename.match(new RegExp(pattern));;
  });
}

export default class SizeBudgetPlugin {
  constructor(options = {}) {
    this.mode = options.mode;
    this.budgets = options.budgets || {};
  }

  apply(compiler) {
    // Apply only in production
    const isProduction = ['prod', 'production'].includes((this.mode || '').toLowerCase());
    if (!isProduction) return;

    compiler.hooks.compilation.tap('SizeBudgetPlugin', (compilation) => {
      if (compilation.compiler.isChild()) {
        return;
      }

      compilation.hooks.processAssets.tap(
        {
          name: 'SizeBudgetPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        (assets) => {
          const { entry, resources } = this.budgets;
          const entryFilesSet = new Set();
          const processedFiles = [];

          // 1. Validate entry points
          if (entry) {
            const maxWarning = parseToBytes(entry.maximumWarning);
            const maxError = parseToBytes(entry.maximumError);
            const exclude = entry.exclude || [];

            for (const [entryName, entrypoint] of compilation.entrypoints.entries()) {
              const entryFiles = entrypoint.getFiles();
              let totalEntrySize = 0;

              for (const file of entryFiles) {
                // Collect entry filenames so resources check can skip them
                entryFilesSet.add(file);
                if (isExcluded(file, exclude)) continue;

                processedFiles.push(file);
                const asset = assets[file];

                if (asset) {
                  totalEntrySize += asset.size();
                }
              }

              const actualBytes = totalEntrySize;

              const buildMessage = (limit) => {
                let msg = `entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (${formatBytes(limit)}). This can impact web performance.`;
                msg += `\n  Entrypoints:`;
                msg += `\n    ${entryName} (${formatBytes(actualBytes)})`;
                processedFiles.forEach(file => {
                  msg += `\n      ${file} (${formatBytes(assets[file].size())})`;
                });
                return msg;
              };

              if (maxError > 0 && actualBytes > maxError) {
                compilation.errors.push(new Error(buildMessage(maxError)));
              } else if (maxWarning > 0 && actualBytes > maxWarning) {
                compilation.warnings.push(new Error(buildMessage(maxWarning)));
              }
            }
          }

          // 2. Validate remaining resources (assets) (Checks assets: .html, .css, .pdf, .svg)
          if (resources) {
            const maxWarning = parseToBytes(resources.maximumWarning);
            const maxError = parseToBytes(resources.maximumError);

            const exclude = resources.exclude || [];
            const errors = [], warnings = [];

            for (const [filename, source] of Object.entries(assets)) {
              // Skip entry assets (already handled under 'entry' budget)
              if (entryFilesSet.has(filename)) continue;

              // Skip excluded files
              if (isExcluded(filename, exclude)) continue;

              const actualBytes = source.size();

              if (maxError > 0 && actualBytes > maxError) {
                errors.push({ filename, filesize: formatBytes(actualBytes) });
              } else if (maxWarning > 0 && actualBytes > maxWarning) {
                warnings.push({ filename, filesize: formatBytes(actualBytes) });
              }
            }

            const buildMessage = (limit) => {
              let msg = `resource size limit: The following asset(s) exceed the recommended size limit (${formatBytes(limit)}).\nThis can impact web performance.`
              msg += `\n  Resources:`
              errors.forEach(({ filename, filesize }) => {
                msg += `\n    ${filename} (${filesize})`
              });
              return msg;
            };

            if (errors.length > 0) {
              compilation.errors.push(new Error(buildMessage(maxError)));
            }

            if (warnings.length > 0) {
              compilation.warnings.push(new Error(buildMessage(maxWarning)));
            }
          }
        }
      );
    });
  }
}