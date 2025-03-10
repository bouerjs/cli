declare namespace ElementInjectorPlugin {
  type AttrOptions = {
    name: string;
    value: string;
  }

  interface Options {
    inject?: string;
    template?: string;
    type?: string;
    filename?: string | AttrOptions;
    attrs?: Array<AttrOptions>;
  }
}

declare class ElementInjectorPlugin {
  elements: Array<ElementInjectorPlugin.Options>;
  typeMapper: {  [key: string]: string };
  constructor(options: ElementInjectorPlugin.Options);
}

export = ElementInjectorPlugin;