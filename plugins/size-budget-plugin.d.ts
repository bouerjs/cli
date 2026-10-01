import type { Compiler } from 'webpack';

/**
 * Individual budget constraint specification.
 */
export interface BudgetRule {
  /**
   * Warning size threshold (e.g. "500kb", "2mb", or bytes as number).
   */
  maximumWarning?: string | number;

  /**
   * Error size threshold (e.g. "1mb", "5mb", or bytes as number).
   */
  maximumError?: string | number;

  /**
   * List of string substrings or Regular Expressions to exclude from budget checks.
   */
  exclude?: (string | RegExp)[];
}

/**
 * Schema for SizeBudgetPlugin budget configuration.
 */
export interface SizeBudgetMap {
  /**
   * Budget rule applied to entry point initial bundles sum.
   */
  entry?: BudgetRule;

  /**
   * Budget rule applied to individual output resources/assets.
   */
  resources?: BudgetRule;
}

export interface SizeBudgetPluginOptions {
  budgets?: SizeBudgetMap;
}

declare class SizeBudgetPlugin {
  budgets: SizeBudgetMap;
  constructor(options?: SizeBudgetPluginOptions);
  apply(compiler: Compiler): void;
}

export default SizeBudgetPlugin;