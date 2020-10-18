import { html, component, props } from "../src/index.js";

export const TodoItem = component({
  machine: props({
    done: false,
    onClick: () => {},
    onDelete: () => {},
    id: "",
    label: ""
  }),
  render: ({ state }) => {
    const { done, label, id, onClick, onDelete } = state.context.props;
    return html`
      <li data-id="${id}" class="${done ? "completed" : ""}">
        <div class="view">
          <input
            class="toggle"
            type="checkbox"
            onclick=${onClick}
            checked=${done}
          />
          <label>${label}</label>
          <button class="destroy" onclick=${() => onDelete(id)}></button>
        </div>
      </li>
    `;
  }
});
