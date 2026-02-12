import { Command } from "commander";

const program = new Command();

program
  .name("docket")
  .description("ASF Docket — Task management from the terminal")
  .version("0.1.0");

program
  .command("add <description>")
  .description("Add a new task (supports natural language)")
  .action(async (description: string) => {
    const { addTask } = await import("./commands/add.js");
    await addTask(description);
  });

program
  .command("list")
  .description("List tasks")
  .option("--today", "Show only today's tasks")
  .option("--project <name>", "Filter by project")
  .option("--tag <name>", "Filter by tag")
  .option("--json", "Output as JSON")
  .action(async (options) => {
    const { listTasks } = await import("./commands/list.js");
    await listTasks(options);
  });

program
  .command("done <id>")
  .description("Mark a task as completed")
  .action(async (id: string) => {
    const { doneTask } = await import("./commands/done.js");
    await doneTask(id);
  });

program
  .command("edit <id>")
  .description("Edit a task")
  .option("--title <title>", "New title")
  .option("--priority <p>", "New priority (1-4)")
  .option("--due <date>", "New due date")
  .action(async (id: string, options) => {
    const { editTask } = await import("./commands/edit.js");
    await editTask(id, options);
  });

program
  .command("delete <id>")
  .description("Delete a task")
  .action(async (id: string) => {
    const { deleteTask } = await import("./commands/delete.js");
    await deleteTask(id);
  });

program.parse();
