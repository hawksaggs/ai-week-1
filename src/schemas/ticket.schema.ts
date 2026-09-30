import { z } from "zod";

export const TicketCategorySchema = z.enum([
  "billing",
  "technical",
  "account",
  "general",
]);

export const TicketClassificationSchema = z.object({
  category: TicketCategorySchema,
  confidence: z.number().min(0).max(1),
  reason: z.string(),
});

export type TicketClassification = z.infer<typeof TicketClassificationSchema>;

export const TicketClassificationJsonSchema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["billing", "technical", "account", "general"],
    },
    confidence: {
      type: "number",
    },
    reason: {
      type: "string",
    },
  },
  required:[
    "category",
    "confidence",
    "reason"
  ],
  additionalProperties: false
} as const;
