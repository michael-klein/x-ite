import { Machine, interpret, assign } from "https://cdn.skypack.dev/xstate";
import { onPostRender, render, isRendering } from "./render.js";
import inc from "https://cdn.skypack.dev/incremental-dom";
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
    if (node.tagName === "C-B") {
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
const RENDER = "RENDER";
export const isComponent = obj => !!obj[COMPONENT];
export const component = ({ machine, options, render: renderMethod }) => {
  const prepareMachine = (machine, props) => {
    if (!machine) {
      machine = {
        initial: "i",
        states: {
          i: {}
        }
      };
    }
    if (typeof machine === "function") {
      machine = machine(props);
    }
    if (!machine.context) {
      machine.context = {};
    }
    machine.context.___renderCount = 0;
    if (!machine.on) {
      machine.on = {
        actions: [
          assign((context, event) => {
            const newContext = {
              ...context
            };
            newContext.___renderCount++;
            return newContext;
          })
        ]
      };
    }
    machine.on[RENDER];
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
        Machine(prepareMachine(machine, props), prepareOptions(options, props)),
        { execute: false }
      );
      hook.service.start();
      hook.state = hook.service.machine.initialState;
      hook.render = () =>
        renderMethod({
          state: hook.state,
          props: hook.props,
          ...hook.service
        });
      hook.start = cp => {
        hook.started = true;
        hook.service.onTransition(state => {
          hook.state = state;
          const doRender = () =>
            render(cp.parentElement, hook.render(), false, cp);
          if (isRendering()) {
            onPostRender(() => doRender());
          } else {
            doRender();
          }
        });
      };
    }
    hook.props = props;
    return hook.render();
  };
  comp[COMPONENT] = true;
  return comp;
};
