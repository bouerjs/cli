import type { Compiler, Compilation } from 'webpack';

/**
 * Represents a file or folder copy configuration pattern.
 */
export interface AssetCopyPattern {
  /**
   * Absolute path to the source file or directory.
   */
  from: string;

  /**
   * Absolute or relative path to the destination directory or file.
   */
  to: string;

  /**
   * If `true`, ignores errors when the source path does not exist.
   * @default false
   */
  noErrorOnMissing?: boolean;
}

/**
 * Options accepted by the `AssetCopyPlugin`.
 */
export interface AssetCopyPluginOptions {
  /**
   * List of copy patterns to execute during Webpack asset processing.
   * @default []
   */
  patterns?: AssetCopyPattern[];
}

/**
 * A custom Webpack plugin that copies static assets directly into Webpack's
 * asset pipeline during compilation.
 */
declare class AssetCopyPlugin {
  /**
   * Configured copy patterns.
   */
  patterns: AssetCopyPattern[];

  /**
   * Creates an instance of `AssetCopyPlugin`.
   * @param options Plugin configuration options.
   */
  constructor(options?: AssetCopyPluginOptions);

  /**
   * Webpack plugin entry point. Hooks into the Webpack compiler lifecycle.
   * @param compiler Webpack compiler instance.
   */
  apply(compiler: Compiler): void;

  /**
   * Processes an individual copy pattern.
   * @param pattern The pattern definition to execute.
   * @param compilation Current Webpack compilation instance.
   * @param compiler Current Webpack compiler instance.
   */
  processPattern(
    pattern: AssetCopyPattern,
    compilation: Compilation,
    compiler: Compiler
  ): Promise<void>;

  /**
   * Reads a single file from disk and emits it into Webpack's asset pipeline.
   * @param filePath Source file path on disk.
   * @param targetPath Target relative or absolute output path.
   * @param compilation Current Webpack compilation instance.
   * @param compiler Current Webpack compiler instance.
   */
  copyFile(
    filePath: string,
    targetPath: string,
    compilation: Compilation,
    compiler: Compiler
  ): Promise<void>;

  /**
   * Recursively reads a directory and emits its contents into Webpack's asset pipeline.
   * @param dirPath Source directory path on disk.
   * @param targetDirPath Target relative or absolute output directory path.
   * @param compilation Current Webpack compilation instance.
   * @param compiler Current Webpack compiler instance.
   */
  copyDirectory(
    dirPath: string,
    targetDirPath: string,
    compilation: Compilation,
    compiler: Compiler
  ): Promise<void>;
}

export default AssetCopyPlugin;