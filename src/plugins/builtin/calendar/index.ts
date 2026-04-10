import { Plugin } from "../../lifecycle.js";
import { CalendarPluginView } from "./view.js";

export default class CalendarPlugin extends Plugin {
  async onLoad(): Promise<void> {
    this.app.ui.addView({
      id: "calendar",
      name: "Calendar",
      icon: "🗓️",
      slot: "navigation",
      contentType: "react",
      component: CalendarPluginView,
    });
  }

  async onUnload(): Promise<void> {}
}
