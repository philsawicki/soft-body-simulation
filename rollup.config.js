import { terser } from 'rollup-plugin-terser';

import rollupDevConfig from './rollup.config.dev.js'


export default {
    ...rollupDevConfig,
    plugins: [ ...rollupDevConfig.plugins, terser() ]
};
