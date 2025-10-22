declare module 'js-yaml' {
  export function load(str: string): any;
  export function safeLoad(str: string): any;
  export function dump(obj: any): string;
  const _default: {
    load: typeof load;
    safeLoad: typeof safeLoad;
    dump: typeof dump;
  };
  export default _default;
}
