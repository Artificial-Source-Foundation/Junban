import type { AppServices } from "../../bootstrap.js";

interface EditOptions {
  title?: string;
  priority?: string;
  due?: string;
}

export async function editTask(_id: string, _options: EditOptions, _services: AppServices) {
  // TODO: Wire in Sprint 2 (L-05)
  console.log("Edit not yet implemented.");
}
