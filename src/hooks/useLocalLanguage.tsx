import React from "react";

type MenuTranslations = {
  addMenu: string;
  editMenu: string;
  itemName: string;
  enterItemName: string;
  price: string;
  productionDestination: string;
  inventoryOptional: string;
  optional: string;
  uploadProductImage: string;
  upload: string;
  promotion: string;
  promoName: string;
  promoPrice: string;
  labelSelector: string;
  pickMultipleTags: string;
  labelName: string;
  outOfStock: string;
  packetConfiguration: string;
  maxItemsInPacket: string;
  choiceSection: string;
  section1Name: string;
  section1Choices: string;
  maxHash: string;
  cancel: string;
  saveItem: string;
  addSection: string;
  sectionName: string;
  categoryLayout: string;
  maxSectionsPerCategory: string;
  menuTab: string;
  saveChanges: string;
  addCategory: string;
  addNewSection: string;
  save: string;
};

const englishTranslations: MenuTranslations = {
  addMenu: "Add Menu",
  editMenu: "Edit Menu",
  itemName: "Item Name",
  enterItemName: "Enter item name",
  price: "Price",
  productionDestination: "Production Destination",
  inventoryOptional: "Inventory Optional",
  optional: "Optional",
  uploadProductImage: "Upload Product Image",
  upload: "Upload",
  promotion: "Promotion",
  promoName: "Promo Name",
  promoPrice: "Promo Price",
  labelSelector: "Label Selector",
  pickMultipleTags: "Pick multiple tags for this item",
  labelName: "Label Name",
  outOfStock: "Out of Stock",
  packetConfiguration: "Packet Configuration",
  maxItemsInPacket: "Max items in packet",
  choiceSection: "Choice section",
  section1Name: "Section 1 Name",
  section1Choices: "Section 1 Choices",
  maxHash: "Max #",
  cancel: "Cancel",
  saveItem: "Save Item",
  addSection: "Add Section",
  sectionName: "Section Name",
  categoryLayout: "Category Layout",
  maxSectionsPerCategory: "Max Sections per Category (up to 50)",
  menuTab: "Menu Tab",
  saveChanges: "Save Changes",
  addCategory: "Add Category",
  addNewSection: "Add New Section",
  save: "Save",
};

const indonesianTranslations: MenuTranslations = {
  addMenu: "Tambah Menu",
  editMenu: "Ubah Menu",
  itemName: "Nama Item",
  enterItemName: "Masukkan nama item",
  price: "Harga",
  productionDestination: "Tempat Produksi",
  inventoryOptional: "Inventaris (Opsional)",
  optional: "Opsional",
  uploadProductImage: "Unggah Gambar Produk",
  upload: "Unggah",
  promotion: "Promosi",
  promoName: "Nama Promo",
  promoPrice: "Harga Promo",
  labelSelector: "Pilih Label",
  pickMultipleTags: "Pilih beberapa tag untuk item ini",
  labelName: "Nama Label",
  outOfStock: "Habis",
  packetConfiguration: "Konfigurasi Paket",
  maxItemsInPacket: "Maks item per paket",
  choiceSection: "Bagian Pilihan",
  section1Name: "Nama Bagian 1",
  section1Choices: "Pilihan Bagian 1",
  maxHash: "Maks #",
  cancel: "Batal",
  saveItem: "Simpan Item",
  addSection: "Tambah Bagian",
  sectionName: "Nama Bagian",
  categoryLayout: "Tata Letak Kategori",
  maxSectionsPerCategory: "Maks Bagian per Kategori (sampai 50)",
  menuTab: "Tab Menu",
  saveChanges: "Simpan Perubahan",
  addCategory: "Tambah Kategori",
  addNewSection: "Tambah Bagian Baru",
  save: "Simpan",
};

const LanguageContext = React.createContext<{ locale: string; setLocale: (l: string) => void } | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = React.useState<string>(() => {
    if (typeof window === "undefined") return "EN";
    return (localStorage.getItem("locale") as string) || "EN";
  });

  React.useEffect(() => {
    try {
      localStorage.setItem("locale", locale);
    } catch {
      // ignore
    }
  }, [locale]);

  return <LanguageContext.Provider value={{ locale, setLocale }}>{children}</LanguageContext.Provider>;
};

export default function useLocalLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) return { t: englishTranslations, locale: "EN", setLocale: () => {} };
  const { locale, setLocale } = ctx;
  return { t: locale === "EN" ? englishTranslations : indonesianTranslations, locale, setLocale };
}
