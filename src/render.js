import inc from "https://cdn.skypack.dev/incremental-dom";
import { isComponent } from "./component";
const {
  patch,
  text,
  elementOpen,
  elementClose,
  currentPointer,
  skipNode,
  elementVoid,
  currentElement,
  attributes,
  symbols
} = inc;
import { normalizeHtmlResult } from "./html.js";
import { removeEmptyTextNodes } from "./utils.js";

const defaultHandler = attributes[symbols.default].bind(
  attributes[symbols.default]
);

attributes[symbols.default] = (node, name, value) => {
  if (name === "checked") {
    if (value) {
      node.checked = true;
    } else {
      node.checked = false;
    }
    return;
  }
  if (name === "__hook") {
    if (node.__hook && node.__hook.service) {
      node.__hook.service.stop();
    }
  }
  if (name === "value" && node.tagName === "INPUT") {
    if (value !== node.getAttribute("value")) {
      node.setAttribute("value", value);
      node.value = value;
    }
  } else {
    return defaultHandler(node, name, value);
  }
};
const postRenderListeners = [];
export const onPostRender = listener => {
  postRenderListeners.push(listener);
};
customElements.define(
  "c-b",
  class extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.style.setProperty("display", "none");
    }
  }
);
function performRenderStep(htmlResult) {
  if (htmlResult !== undefined) {
    htmlResult = normalizeHtmlResult(htmlResult);
    const { type, children, props } = htmlResult;
    if (type && isComponent(type)) {
      const pointer = currentPointer();
      let hook;
      const key = props?.key;
      if (
        pointer &&
        pointer.__component === type &&
        pointer.__hook &&
        pointer.__hook.key === key
      ) {
        hook = pointer.__hook;
      } else {
        hook = {
          key: key
        };
      }
      elementVoid(
        "c-b",
        null,
        null,
        "__component",
        type,
        "__hook",
        hook,
        "key",
        key
      );
      performRenderStep(type(hook, props));
    } else if (type === "script") {
      const pointer = currentPointer();
      if (
        !(pointer instanceof HTMLScriptElement) ||
        pointer.textContent !== children[0]
      ) {
        if (pointer) {
          pointer.parentElement.removeChild(pointer);
        }
        const newScript = document.createElement("script");
        Object.keys(props).forEach(key =>
          newScript.setAttribute(key, props[key])
        );
        newScript.appendChild(document.createTextNode(children[0]));
        currentElement().appendChild(newScript);
      } else {
        skipNode();
      }
    } else {
      if (type) {
        elementOpen(
          type,
          null,
          null,
          ...(props
            ? Object.keys(props).reduce((memo, propName) => {
                memo.push(propName, props[propName]);
                return memo;
              }, [])
            : [])
        );
      }
      children.forEach(child => {
        if (child !== undefined) {
          if (!(child instanceof Object)) {
            if (child || Number(child) === child) {
              text(child);
            }
          } else if (typeof child === "function" && !isComponent(child)) {
            child();
          } else {
            performRenderStep(child);
          }
        }
      });
      if (type) {
        elementClose(type);
      }
    }
  }
}
let rendering = false;
export const isRendering = () => rendering;
export function render(node, htmlResult, now = false, component = undefined) {
  rendering = true;
  removeEmptyTextNodes(node);
  return (now ? cb => cb() : requestAnimationFrame)(() => {
    patch(node, function() {
      if (component) {
        while (currentPointer()) {
          if (currentPointer() === component) {
            skipNode();
            break;
          }
          skipNode();
        }
      }
      performRenderStep(htmlResult);
      if (component) {
        while (currentPointer()) {
          skipNode();
        }
      }
    });

    rendering = false;
    postRenderListeners.forEach(listener => listener());
    postRenderListeners.length = 0;
  });
}
