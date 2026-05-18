import z from "zod";

export const menuItemSchema = (t: any) => z.object({
  itemName: z.string().min(1, t("itemNameRequired") || "Item name is required"),
  price: z.number().min(0, t("priceRequired") || "Price is required"),
  productionDestination: z.enum(["Kitchen", "Bar", "Pastry", "Grill"]),
  inventory: z.string().default(""),
  promoName: z.string().default(""),
  promoPrice: z.number().min(0).default(0),
  labels: z.array(z.string()).default([]),
  outOfStock: z.boolean().default(false),
  maxItemsInPacket: z.number().optional(),
  choiceSections: z.number().optional(),
  sectionName: z.string().default(""),
  maxChoices: z.number().default(0),
});

export type MenuItemFormValues = z.infer<ReturnType<typeof menuItemSchema>>;