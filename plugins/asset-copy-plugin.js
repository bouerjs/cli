import fs from 'node:fs/promises';
import path from 'node:path';

export default class AssetCopyPlugin {
  constructor(options = {}) {
    this.patterns = options.patterns || [];
  }

  apply(compiler) {
    // Hook into the compilation phase
    compiler.hooks.thisCompilation.tap('AssetCopyPlugin', (compilation) => {
      // Tap into the asset emission process using Webpack 5 Compilation hooks
      compilation.hooks.processAssets.tapAsync(
        {
          name: 'AssetCopyPlugin',
          // PROCESS_ASSETS_STAGE_ADDITIONAL allows adding new assets before writing to disk
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async (assets, callback) => {
          try {
            for (const pattern of this.patterns) {
              await this.processPattern(pattern, compilation, compiler);
            }
            callback();
          } catch (error) {
            callback(error);
          }
        }
      );
    });
  }

  async processPattern(pattern, compilation, compiler) {
    const { from, to, noErrorOnMissing = false } = pattern;

    async function fileExists(filePath) {
      try {
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    }

    try {
      if (!(await fileExists(from))) return;

      const stats = await fs.stat(from);

      if (stats.isDirectory()) {
        await this.copyDirectory(from, to, compilation, compiler);
      } else if (stats.isFile()) {
        await this.copyFile(from, to, compilation, compiler);
      }
    } catch (err) {
      if (err.code === 'ENOENT' && noErrorOnMissing) {
        return; // Ignore missing files if configured
      }
      throw err;
    }
  }

  async copyFile(filePath, targetPath, compilation, compiler) {
    const content = await fs.readFile(filePath);
    
    // Calculate the output path relative to Webpack's output folder
    const relativeTo = path.isAbsolute(targetPath)
      ? path.relative(compiler.options.output.path, targetPath)
      : targetPath;

    // Tell Webpack to emit this asset into the build pipeline
    compilation.emitAsset(
      relativeTo, new compiler.webpack.sources.RawSource(content)
    );
  }

  async copyDirectory(dirPath, targetDirPath, compilation, compiler) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const targetPath = path.join(targetDirPath, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(fullPath, targetPath, compilation, compiler);
      } else if (entry.isFile()) {
        await this.copyFile(fullPath, targetPath, compilation, compiler);
      }
    }
  }
}