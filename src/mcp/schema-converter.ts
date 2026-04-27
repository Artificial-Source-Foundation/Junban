/**
 * JSON Schema → Zod object converter.
 * Converts the JSON Schema parameter objects used by ToolRegistry definitions
 * into Zod objects compatible with McpServer.registerTool().
 *
 * Handles the subset used by our tools: string, number, integer, boolean,
 * arrays, nested objects, enum, required, min/max items, and description.
 */

import { z } from "zod";

interface JsonSchemaProperty {
  type?: string;
  description?: string;
  enum?: (string | number)[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  minItems?: number;
  maxItems?: number;
  additionalProperties?: boolean;
}

interface JsonSchemaObject {
  type: "object";
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

function objectToZod(
  properties: Record<string, JsonSchemaProperty> = {},
  required: string[] = [],
  additionalProperties?: boolean,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const requiredFields = new Set(required);
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, prop] of Object.entries(properties)) {
    shape[key] = propertyToZod(prop, requiredFields.has(key));
  }

  const schema = z.object(shape);
  return additionalProperties === false ? schema.strict() : schema;
}

/** Convert a single JSON Schema property to a Zod type. */
function propertyToZod(prop: JsonSchemaProperty, isRequired: boolean): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (prop.type) {
    case "string":
      if (prop.enum && prop.enum.every((v) => typeof v === "string")) {
        const values = prop.enum as [string, ...string[]];
        schema = z.enum(values);
      } else {
        schema = z.string();
      }
      break;

    case "number":
    case "integer":
      if (prop.enum && prop.enum.every((v) => typeof v === "number")) {
        // Zod doesn't have z.enum for numbers directly; use z.union of literals
        const literals = prop.enum.map((v) => z.literal(v as number));
        schema =
          literals.length === 1
            ? literals[0]
            : z.union(literals as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
      } else {
        schema = prop.type === "integer" ? z.number().int() : z.number();
      }
      break;

    case "boolean":
      schema = z.boolean();
      break;

    case "array":
      schema = z.array(prop.items ? propertyToZod(prop.items, true) : z.unknown());
      if (typeof prop.minItems === "number") {
        schema = (schema as z.ZodArray<z.ZodTypeAny>).min(prop.minItems);
      }
      if (typeof prop.maxItems === "number") {
        schema = (schema as z.ZodArray<z.ZodTypeAny>).max(prop.maxItems);
      }
      break;

    case "object":
      schema = objectToZod(prop.properties, prop.required, prop.additionalProperties);
      break;

    default:
      schema = z.string();
      break;
  }

  if (prop.description) {
    schema = schema.describe(prop.description);
  }

  if (!isRequired) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Convert a JSON Schema object (as used by ToolDefinition.parameters) to a
 * Zod object suitable for McpServer.registerTool()'s inputSchema.
 */
export function jsonSchemaToZod(
  schema: Record<string, unknown>,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const obj = schema as unknown as JsonSchemaObject;
  return objectToZod(obj.properties, obj.required, obj.additionalProperties);
}
