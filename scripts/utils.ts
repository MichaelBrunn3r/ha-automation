const mapEntries =
  (cbKey: (k: string, v: Object) => string) => (cbValue: (k: string, v: Object) => Object) => (obj: Object) =>
    Object.entries(obj).reduce((prev, [key, value]) => ({ ...prev, [cbKey(key, value)]: cbValue(key, value) }), {});

export const mapEntriesRecursive =
  (cbKey: (k: string, v: Object) => string) => (cbValue: (k: string, v: Object) => Object) =>
    function g(obj: Object): Object {
      return obj == null || typeof obj !== 'object'
        ? obj
        : Array.isArray(obj)
        ? obj.map(g)
        : mapEntries(cbKey)((...v) => g(cbValue(...v)))(obj);
    };
