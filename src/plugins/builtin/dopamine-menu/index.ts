import { Plugin } from "../../lifecycle.js";
import { DopamineMenuPluginView } from "./view.js";

export default class DopamineMenuPlugin extends Plugin {
  async onLoad(): Promise<void> {
    this.app.ui.addView({
      id: "dopamine-menu",
      name: "Quick Wins",
      icon: "⚡",
      slot: "tools",
      contentType: "react",
      component: DopamineMenuPluginView,
    });
  }

  async onUnload(): Promise<void> {}
}
