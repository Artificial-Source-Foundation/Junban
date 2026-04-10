import { Plugin } from "../../lifecycle.js";
import { StatsPluginView } from "./view.js";

export default class StatsPlugin extends Plugin {
  async onLoad(): Promise<void> {
    this.app.ui.addView({
      id: "stats",
      name: "Stats",
      icon: "📊",
      slot: "navigation",
      contentType: "react",
      component: StatsPluginView,
    });
  }

  async onUnload(): Promise<void> {}
}
