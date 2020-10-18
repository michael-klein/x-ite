import { assign } from "https://cdn.skypack.dev/xstate";
import { mergeDeep } from "./utils.js";

export const mix = (...mixins) => {
  let machine = {};
  for (const mixin of mixins) {
    machine = mergeDeep(machine, mixin);
  }
  return machine;
};
export const PROPS = "__PROPS";
export const props = propDefinitions => {
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
};

export const EFFECT = "__EFFECT";
export const STOP = "__STOP";
export const effect = (cb, dependenciesProducer = () => undefined) => {
  let prevDependencies = undefined;
  let cleanUp;
  return {
    on: {
      [EFFECT]: {
        actions: [
          context => {
            const dependencies = dependenciesProducer(context);
            const canRun =
              dependencies === undefined ||
              prevDependencies === undefined ||
              dependencies.find(
                (dep, index) => prevDependencies[index] !== dep
              );
            prevDependencies = dependencies;
            if (canRun) {
              if (cleanUp) {
                cleanUp(context);
                cleanUp = undefined;
              }
              cleanUp = cb(context);
            }
          }
        ]
      },
      [STOP]: {
        actions: [
          context => {
            if (cleanUp) {
              cleanUp(context);
              cleanUp = undefined;
            }
          }
        ]
      }
    }
  };
};
