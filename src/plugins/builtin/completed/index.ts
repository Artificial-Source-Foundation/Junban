import { Plugin } from "../../lifecycle.js";
import { CompletedPluginView } from "./view.js";

export default class CompletedPlugin extends Plugin {
  async onLoad(): Promise<void> {
    this.app.ui.addView({
      id: "completed",
      name: "Completed",
      icon: "✅",
      slot: "navigation",
      contentType: "react",
      component: CompletedPluginView,
    });
  }

  async onUnload(): Promise<void> {}
}
