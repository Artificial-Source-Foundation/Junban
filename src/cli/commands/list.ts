interface ListOptions {
  today?: boolean;
  project?: string;
  tag?: string;
  json?: boolean;
}

export async function listTasks(options: ListOptions) {
  // TODO: Query tasks via TaskService with filters

  if (options.json) {
    console.log(JSON.stringify([], null, 2));
  } else {
    console.log("No tasks found.");
  }
}
