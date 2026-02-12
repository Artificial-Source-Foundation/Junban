interface EditOptions {
  title?: string;
  priority?: string;
  due?: string;
}

export async function editTask(id: string, options: EditOptions) {
  // TODO: Update task via TaskService
  console.log(`Updated task: ${id}`);
}
