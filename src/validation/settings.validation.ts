import z from "zod";

export const menuItemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  price: z.coerce.number().min(0, "Price is required"),
  productionDestination: z.enum(["Kitchen", "Bar", "Pastry", "Grill"]),
  inventory: z.string().optional().default(""),
  promoName: z.string().optional().default(""),
  promoPrice: z.coerce.number().min(0).default(0),
  labels: z.array(z.string()).default([]),
  outOfStock: z.boolean().default(false),
  maxItemsInPacket: z.coerce.number().optional(),
  choiceSections: z.coerce.number().optional(),
  sectionName: z.string().optional().default(""),
  maxChoices: z.coerce.number().default(0),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;