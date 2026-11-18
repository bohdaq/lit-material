import "@lit-material/tree";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { TreeMoveDetail } from "@lit-material/tree";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [{ kind: "boolean", key: "multiple", label: "Multi-select", default: false }];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-tree ?multiple=${state.multiple as boolean} style="max-width: 320px;">
      <lit-material-tree-item expanded>
        <span slot="label">Documents</span>
        <lit-material-tree-item selected>
          <span slot="label">Resume.pdf</span>
        </lit-material-tree-item>
        <lit-material-tree-item disabled>
          <span slot="label">Cover Letter.pdf</span>
        </lit-material-tree-item>
        <lit-material-tree-item>
          <span slot="label">Projects</span>
          <lit-material-tree-item>
            <span slot="label">lit-material</span>
          </lit-material-tree-item>
        </lit-material-tree-item>
      </lit-material-tree-item>
      <lit-material-tree-item>
        <span slot="label">Photos</span>
      </lit-material-tree-item>
    </lit-material-tree>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = state.multiple ? " multiple" : "";
  return `<lit-material-tree${attrs}>\n  <lit-material-tree-item expanded>\n    <span slot="label">Documents</span>\n    <lit-material-tree-item selected>\n      <span slot="label">Resume.pdf</span>\n    </lit-material-tree-item>\n    ...\n  </lit-material-tree-item>\n  ...\n</lit-material-tree>`;
}

interface Node {
  id: string;
  name: string;
  folder?: boolean;
  children?: Node[];
}

const startFiles: Node[] = [
  {
    id: "orders",
    name: "orders",
    folder: true,
    children: [
      { id: "create", name: "create-order.yaml" },
      { id: "get", name: "get-order.yaml" },
      { id: "cancel", name: "cancel-order.yaml" },
    ],
  },
  { id: "payments", name: "payments", folder: true, children: [{ id: "refund", name: "refund.yaml" }] },
  { id: "health", name: "health.yaml" },
  { id: "login", name: "login.yaml" },
];

/** `nodes` with `id` taken out and put `place` relative to `target` (what an app does on `move`). */
function moveNode(nodes: Node[], id: string, target: string, place: TreeMoveDetail["place"]): Node[] {
  let moved: Node | undefined;
  const without = (list: Node[]): Node[] =>
    list.flatMap((n) => {
      if (n.id === id) {
        moved = n;
        return [];
      }
      return [n.children ? { ...n, children: without(n.children) } : n];
    });
  const put = (list: Node[]): Node[] =>
    list.flatMap((n) => {
      if (n.id === target) {
        if (place === "inside") return [{ ...n, children: [...(n.children ?? []), moved!] }];
        return place === "before" ? [moved!, n] : [n, moved!];
      }
      return [n.children ? { ...n, children: put(n.children) } : n];
    });
  const rest = without(nodes);
  return moved ? put(rest) : nodes;
}

@customElement("docs-tree-page")
export class DocsTreePage extends LitElement {
  static override styles = [pageStyles];

  @state() private files = startFiles;
  @state() private lastMove = "";

  private onMove(event: CustomEvent<TreeMoveDetail>): void {
    const { item, target, place } = event.detail;
    this.files = moveNode(this.files, item.dataset.id!, target.dataset.id!, place);
    this.lastMove = `${item.dataset.id} ${place} ${target.dataset.id}`;
  }

  private renderNodes(nodes: Node[]): unknown {
    return repeat(
      nodes,
      (n) => n.id,
      (n) => html`<lit-material-tree-item data-id=${n.id} ?droppable=${n.folder} ?expanded=${n.folder}>
        <span slot="label">${n.name}</span>
        ${n.children ? this.renderNodes(n.children) : ""}
      </lit-material-tree-item>`,
    );
  }

  override render() {
    return html`
      <h1>Tree</h1>
      <p>
        A hierarchical, expand-collapse list — arbitrarily nested nodes, single- or multi-select,
        arrow-key navigation across every visible node.
      </p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section style="display: block;">
        <h2>Drag and drop</h2>
        <p>
          With <code>reorderable</code>, drag a node before or after another, or into a folder marked <code>droppable</code>
          (a line or a highlighted row shows where it lands; Escape cancels). From the keyboard, Alt+ArrowUp/Down move the
          focused node past its neighbour, Alt+ArrowLeft moves it out of its folder and Alt+ArrowRight into the folder above.
          The tree fires <code>move</code> with <code>{item, target, place}</code>; this page moves its data and renders again.
        </p>
        <div style="max-width: 320px; max-height: 280px; overflow: auto;">
          <lit-material-tree reorderable aria-label="Collection files" @move=${this.onMove}>${this.renderNodes(this.files)}</lit-material-tree>
        </div>
        <p>Last move: <output>${this.lastMove || "none yet"}</output></p>
      </section>

      <section style="display: block;">
        <h2>Decorations, actions, compact</h2>
        <p>The <code>trailing</code> slot holds decorations (a git status letter); the <code>actions</code> slot shows buttons on hover or focus. <code>density="compact"</code> on a container gives 28 px rows; <code>reorderable</code> fires <code>reorder</code> on drag or Alt+Shift+ArrowUp/Down.</p>
        <div density="compact" style="max-width: 320px;">
          <lit-material-tree reorderable>
            <lit-material-tree-item expanded>
              <span slot="label">orders</span>
              ${["create-order.yaml", "get-order.yaml", "cancel-order.yaml"].map(
                (name, i) => html`<lit-material-tree-item>
                  <span slot="label">${name}</span>
                  ${i === 0 ? html`<span slot="trailing" style="color: #b07a1a; font-family: monospace;">M</span>` : ""}
                  <button slot="actions" aria-label=${`Rename ${name}`}>✎</button>
                </lit-material-tree-item>`,
              )}
            </lit-material-tree-item>
          </lit-material-tree>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-tree-page": DocsTreePage;
  }
}
