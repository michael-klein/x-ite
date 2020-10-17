import { Machine, interpret, assign } from "https://cdn.skypack.dev/xstate";
import { onPostRender, render, isRendering } from "./render.js";
import inc from "./incremental_dom.js";
import { mergeDeep } from "./utils.js";
import { PROPS } from "./actions.js";
const { notifications } = inc;

notifications.nodesDeleted = nodes => {
  nodes.forEach(node => {
    if (node.tagName === "C-B" && node.__hook) {
      const hook = node.__hook;
      if (hook.service) {
        hook.service.stop();
      }
    }
  });
};
notifications.nodesCreated = nodes => {
  nodes.forEach(node => {
    if (node.nodeName === "#comment" && node.__hook) {
      const hook = node.__hook;
      onPostRender(() => {
        if (hook && !hook.started) {
          hook.start(node);
        }
      });
    }
  });
};
const COMPONENT = Symbol();
export const isComponent = obj => !!obj[COMPONENT];
export const component = ({ machine, options, render: renderMethod }) => {
  const prepareMachine = (machine, props) => {
    machine = mergeDeep(
      {
        initial: "i",
        states: {
          i: {}
        }
      },
      machine ?? {}
    );
    if (typeof machine === "function") {
      machine = machine(props);
    }
    if (!machine.context) {
      machine.context = {};
    }
    return machine;
  };
  const prepareOptions = (options, props) => {
    if (typeof options === "function") {
      options = options(props);
    }
    return options;
  };
  const comp = (hook, props) => {
    if (!hook.service) {
      hook.service = interpret(
        Machine(prepareMachine(machine, props), prepareOptions(options, props))
      );
      hook.service.start();
      hook.service.send(PROPS, { value: props });
      hook.state = hook.service.machine.initialState;
      hook.render = () =>
        renderMethod({
          state: hook.state,
          ...hook.service
        });
      hook.service.onTransition(state => {
        hook.state = state;
        if (hook.started) {
          const doRender = () =>
            render(hook.cp.parentElement, hook.render(), false, hook.cp);
          if (!isRendering()) {
            doRender();
          }
        }
      });
      hook.start = cp => {
        hook.cp = cp;
        hook.started = true;
      };
    }
    hook.service.send(PROPS, { value: props });
    return hook.render();
  };
  comp[COMPONENT] = true;
  return comp;
};
