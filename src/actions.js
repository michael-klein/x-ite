import { assign } from "https://cdn.skypack.dev/xstate";
import { mergeDeep } from "./utils";

export const mixin = cb => {
  return (...args) => machine => mergeDeep(machine, cb(...args));
};
export const PROPS = "__PROPS";
export const props = mixin(propDefinitions => {
  return {
    context: {
      props: propDefinitions
    },
    on: {
      [PROPS]: {
        actions: [
          assign({
            props: (context, event) => ({ ...context.props, ...event.value })
          })
        ]
      }
    }
  };
});
