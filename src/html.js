import htm from "./vendor/htm.js";
export function normalizeHtmlResult(htmlResult) {
  if (Array.isArray(htmlResult)) {
    return {
      children: htmlResult
    };
  }
  if (!(htmlResult instanceof Object)) {
    return {
      children: [htmlResult]
    };
  }
  return htmlResult;
}
function h(type, props, ...children) {
  return { type, props, children };
}

export const html = htm.bind(h);
