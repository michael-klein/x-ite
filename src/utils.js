import { html } from "./html.js";

export function documentReady(callback) {
  if ("completeinteractive".includes(document.readyState)) {
    Promise.resolve().then(callback);
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}

export function parseDOM(htmlString) {
  return new Function("html", `return html\`${htmlString}\``)(html);
}

const bodyExtractPattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
const titleExtractPattern = /<title[^>]*>((.|[\n\r])*)<\/title>/im;
export function fetchLinkData(linkNodes, linkData) {
  linkNodes.forEach(node => {
    const url = node.href;
    if (!linkData[url]) {
      linkData[url] = fetch(url)
        .then(response => response.text())
        .then(htmlContent => {
          return {
            htmlResult: parseDOM(bodyExtractPattern.exec(htmlContent)[1]),
            title: titleExtractPattern.exec(htmlContent)[1]
          };
        })
        .catch(function(err) {
          console.warn(`Could not fetch ${url}`, err);
        });
    }
  });
  return linkData;
}

const wasCleaned = new WeakSet();
export function removeEmptyTextNodes(
  node,
  shouldClean = !wasCleaned.has(node)
) {
  if (shouldClean) {
    wasCleaned.add(node);
    for (var n = 0; n < node.childNodes.length; n++) {
      var child = node.childNodes[n];
      if (child.nodeType === 3 && !/\S/.test(child.nodeValue)) {
        node.removeChild(child);
        n--;
      } else if (child.nodeType === 1) {
        removeEmptyTextNodes(child);
      }
    }
  }
}
