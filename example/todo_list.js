import { html, assign, component, effect, mix } from "../src/index.js";
import { TodoItem } from "./todo_item.js";

const getNewItem = label => ({ id: Date.now(), label, done: false });
export const TodoList = component({
  machine: mix(
    effect(
      context => {
        document.title = `Number of todos: ${context.todoItems.length}`;
      },
      context => [context.todoItems.length]
    ),
    {
      initial: "all",
      states: {
        all: {
          on: {
            ACTIVE: "active",
            COMPLETED: "completed"
          }
        },
        active: {
          on: {
            ALL: "all",
            COMPLETED: "completed"
          }
        },
        completed: {
          on: {
            ALL: "all",
            ACTIVE: "active"
          }
        }
      },
      context: {
        inputValue: "",
        todoItems: [getNewItem("Some todo item")]
      },
      on: {
        input: {
          actions: [
            assign({
              inputValue: (context, event) => event.target.value
            })
          ]
        },
        ADD: {
          cond: context => context.inputValue.length > 0,
          actions: [
            assign({
              todoItems: context => [
                ...context.todoItems,
                getNewItem(context.inputValue)
              ],
              inputValue: ""
            })
          ]
        },
        DELETE: {
          actions: [
            assign({
              todoItems: (context, event) =>
                context.todoItems.filter(item => item.id !== event.id)
            })
          ]
        },
        CLEAR: {
          actions: [
            assign({
              todoItems: context => context.todoItems.filter(item => !item.done)
            })
          ]
        },
        TOGGLE: {
          actions: [
            assign({
              todoItems: (context, event) =>
                context.todoItems.map(item => {
                  if (item.id === event.id) {
                    return { ...item, done: event.done };
                  }
                  return item;
                })
            })
          ]
        },
        TOGGLE_ALL: {
          actions: [
            assign({
              todoItems: (context, event) => {
                const allDone =
                  context.todoItems.filter(item => item.done).length ===
                  context.todoItems.length;
                if (allDone) {
                  return context.todoItems.map(item => ({
                    ...item,
                    done: false
                  }));
                }
                return context.todoItems.map(item => ({
                  ...item,
                  done: true
                }));
              }
            })
          ]
        }
      }
    }
  ),
  render: ({ state, send }) => {
    const { todoItems, inputValue, counter } = state.context;

    const filteredItem = todoItems.filter(item => {
      if (state.value === "all") {
        return true;
      } else if (state.value === "completed" && item.done) {
        return true;
      } else if (state.value === "active" && !item.done) {
        return true;
      }
      return false;
    });
    const getLeft = () => {
      const itemsLeft = todoItems.filter(item => !item.done);
      if (itemsLeft.length === 1) {
        return "1 item left";
      } else {
        return `${itemsLeft.length} items left`;
      }
    };
    return html`
      <section class="todoapp">
        <header class="header">
          <h1>todos</h1>
          <input
            class="new-todo"
            placeholder="What needs to be done?"
            autofocus
            oninput=${send}
            value=${inputValue}
            onkeyup=${e => e.key === "Enter" && send("ADD")}
          />
        </header>
        <section class="main">
          <input
            id="toggle-all"
            class="toggle-all"
            type="checkbox"
            onclick=${() => send("TOGGLE_ALL")}
          />
          <label for="toggle-all">Mark all as complete</label>
          <ul class="todo-list">
            ${filteredItem.map(
              item =>
                html`
                  <${TodoItem}
                    id=${item.id}
                    key=${item.id}
                    label=${item.label}
                    done=${item.done}
                    onDelete=${id => send("DELETE", { id })}
                    onClick=${e => {
                      e.preventDefault();
                      send("TOGGLE", { ...item, done: !item.done });
                    }}
                  />
                `
            )}
          </ul>
        </section>
        <footer class="footer">
          <span class="todo-count">${getLeft()}</span>
          <ul class="filters">
            <li>
              <a
                href="#/"
                class=${state.value === "all" && "selected"}
                onclick=${() => send("ALL")}
                >All</a
              >
            </li>
            <li>
              <a
                href="#/active"
                class=${state.value === "active" && "selected"}
                onclick=${() => send("ACTIVE")}
                >Active</a
              >
            </li>
            <li>
              <a
                href="#/completed"
                class=${state.value === "completed" && "selected"}
                onclick=${() => send("COMPLETED")}
                >Completed</a
              >
            </li>
          </ul>
          <button class="clear-completed" onclick=${() => send("CLEAR")}>
            Clear completed
          </button>
        </footer>
      </section>
    `;
  }
});
