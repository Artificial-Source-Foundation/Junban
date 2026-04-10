import { Plugin } from "../../lifecycle.js";
import { CancelledPluginView } from "./view.js";

export default class CancelledPlugin extends Plugin {
  async onLoad(): Promise<void> {
    this.app.ui.addView({
      id: "cancelled",
      name: "Cancelled",
      icon: "✖️",
      slot: "navigation",
      contentType: "react",
      component: CancelledPluginView,
    });
  }

  async onUnload(): Promise<void> {}
}
