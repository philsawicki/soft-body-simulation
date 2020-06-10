import resolve from '@rollup/plugin-node-resolve';


export default {
    input: 'js/index.js',
    output: {
        file: 'dist/js/app.min.js',
        format: 'es',
        sourcemap: true
    },
    plugins: [ resolve() ]
};
