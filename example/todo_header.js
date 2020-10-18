import { html, component, props } from "../src/index.js";

export const TodoHeader = component({
  machine: props({
    onEnter: () => {},
    onInputValueChange: () => {},
    inputValue: ""
  }),
  render: ({ state }) => {
    const { onEnter, onInputValueChange, inputValue } = state.context.props;

    return html`
      <header class="header">
        <h1>todos</h1>
        <input
          class="new-todo"
          placeholder="What needs to be done?"
          autofocus
          oninput=${onInputValueChange}
          value=${inputValue}
          onkeyup=${e => e.key === "Enter" && onEnter(e)}
        />
      </header>
    `;
  }
});
