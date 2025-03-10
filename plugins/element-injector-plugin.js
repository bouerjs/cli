const HtmlWebpackPlugin = require('html-webpack-plugin');

class ElementInjectorPlugin {

  elements = [];
  typeMapper = {
    js: 'script',
    css: 'link',
    scss: 'link',
    sass: 'link',
    less: 'link',
    styl: 'link',
    style: 'link',
  };

  constructor(options) {
    if (!options) throw new Error('ElementInjectorPlugin: options is required');
    this.elements = Array.isArray(options) ? options : [options];;
  }

  apply(compiler) {
    const $elements = this.elements;
    const $types = this.typeMapper;

    compiler.hooks.compilation.tap('InjectElementPlugin', (compilation) => {

      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'InjectElementPlugin',
        (data, cb) => {

          const contents = $elements.map(el => {
            el.inject = el.inject || 'head';

            // if it has template, return it
            if (el.template)
              return el.template;

            // Otherwise, build the element
            let attrName;
            let attrValue;

            // Default type is 'link'
            el.type = $types[el.type] || 'link';

            // If filename is a string, use it as the href
            if (typeof el.filename === 'string') {
              attrName = 'href';
              attrValue = el.filename;
            } else { // Otherwise, use the attrName and attrValue
              attrName = el.filename.attrName;
              attrValue = el.filename.attrValue;
            }

            // If it has attrs, build them
            const attrs = (el.attrs || []).map(attr => {
              return `${attr.name}="${attr.value}"`;
            }).join(' ');

            // build as a script if it is a script
            if (el.type === 'script')
              return `<${el.type} ${attrs} ${attrName}="${attrValue}"></${el.type}>`;

            // Otherwise, build as inline style element
            return {
              inject: el.inject,
              template: `<${el.type} ${attrs} ${attrName}="${attrValue}"></${el.type}>`
            };
          });

          // Inject the elements
          contents.forEach((el) => {
            data.html = data.html.replace(
              `</${el.inject}>`, `\n${el.template}\n</${el.inject}>`
            );
          });

          cb(null, data);
        }
      );
    });
  }
};

module.exports = ElementInjectorPlugin;