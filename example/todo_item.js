import { html, component, assign } from "../src/index.js";

export const TodoItem = component({
  render: ({ props }) => {
    const { done, label, id } = props;
    return html`
      <li data-id="${id}" class="${done ? "completed" : ""}">
        <div class="view">
          <input
            class="toggle"
            type="checkbox"
            onclick=${props.onClick}
            checked=${done}
          />
          <label>${label}</label>
          <button class="destroy" onclick=${() => props.onDelete(id)}></button>
        </div>
      </li>
    `;
  }
});
