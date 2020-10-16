import { html, component } from "../src/index.js";

export const TodoItem = component({
  machine: initialProps => ({
    initial: initialProps.done ? "done" : "open",
    states: {
      open: {
        on: {
          click: "done"
        },
        entry: ["emitOpen"]
      },
      done: {
        on: {
          click: "open"
        },
        entry: ["emitDone"]
      }
    },
    context: {
      label: initialProps.label,
      id: initialProps.id
    }
  }),
  options: initialProps => ({
    actions: {
      emitOpen: context => initialProps.onToggle(context.id, false),
      emitDone: context => initialProps.onToggle(context.id, true)
    }
  }),
  render: ({ state, send, props }) => {
    const { label, id } = state.context;
    const isDone = state.value === "done";
    if (props.done !== isDone) {
      send("click");
    }
    return html`
      <li data-id="${id}" class="${state.value === "done" ? "completed" : ""}">
        <div class="view">
          <input
            class="toggle"
            type="checkbox"
            onclick=${send}
            checked=${isDone}
          />
          <label>${label}</label>
          <button class="destroy" onclick=${() => props.onDelete(id)}></button>
        </div>
      </li>
    `;
  }
});
