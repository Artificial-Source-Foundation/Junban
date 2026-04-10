import { Plugin } from "../../lifecycle.js";
import { SomedayPluginView } from "./view.js";

export default class SomedayPlugin extends Plugin {
  async onLoad(): Promise<void> {
    this.app.ui.addView({
      id: "someday",
      name: "Someday / Maybe",
      icon: "💡",
      slot: "navigation",
      contentType: "react",
      component: SomedayPluginView,
    });
  }

  async onUnload(): Promise<void> {}
}
