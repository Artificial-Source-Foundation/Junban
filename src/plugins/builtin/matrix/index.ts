import { Plugin } from "../../lifecycle.js";
import { MatrixPluginView } from "./view.js";

export default class MatrixPlugin extends Plugin {
  async onLoad(): Promise<void> {
    this.app.ui.addView({
      id: "matrix",
      name: "Matrix",
      icon: "🧭",
      slot: "navigation",
      contentType: "react",
      component: MatrixPluginView,
    });
  }

  async onUnload(): Promise<void> {}
}
