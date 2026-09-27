import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { merge } = require('webpack-merge');

const wpConfigImport = require('{webpack-config-path}');
const targetConfigImport = require('{mix-config-path}');

export default (env, argv) => {
  const wpConfig = wpConfigImport.default || wpConfigImport;
  const targetConfig = targetConfigImport.default || targetConfigImport;

  const wpConfigData = typeof wpConfig === 'function' ? wpConfig(env, argv) : wpConfig; 
  const targetConfigData = typeof targetConfig === 'function' ? targetConfig(env, argv) : targetConfig;
  
  return merge(wpConfigData, targetConfigData);
};