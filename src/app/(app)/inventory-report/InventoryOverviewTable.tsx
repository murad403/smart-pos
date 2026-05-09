type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  openingStock: number;
  sales: number;
  closingStock: number;
  status: StockStatus;
}

const inventory: InventoryItem[] = [
  { id: 1,  name: "Nasi Goreng Special", category: "Main Course", openingStock: 50,  sales: 25,  closingStock: 25, status: "in_stock" },
  { id: 2,  name: "Ayam Bakar",          category: "Main Course", openingStock: 40,  sales: 18,  closingStock: 22, status: "in_stock" },
  { id: 3,  name: "Es Teh Manis",        category: "Beverages",   openingStock: 100, sales: 68,  closingStock: 32, status: "in_stock" },
  { id: 4,  name: "Soto Ayam",           category: "Main Course", openingStock: 35,  sales: 15,  closingStock: 20, status: "in_stock" },
  { id: 5,  name: "Sate Ayam",           category: "Main Course", openingStock: 45,  sales: 22,  closingStock: 23, status: "in_stock" },
  { id: 6,  name: "Gado-Gado",           category: "Appetizer",   openingStock: 30,  sales: 12,  closingStock: 18, status: "low_stock" },
  { id: 7,  name: "Es Jeruk",            category: "Beverages",   openingStock: 80,  sales: 45,  closingStock: 35, status: "in_stock" },
  { id: 8,  name: "Nasi Putih",          category: "Side Dish",   openingStock: 120, sales: 85,  closingStock: 35, status: "in_stock" },
  { id: 9,  name: "Sambal",              category: "Side Dish",   openingStock: 50,  sales: 50,  closingStock: 0,  status: "out_of_stock" },
  { id: 10, name: "Kerupuk",             category: "Side Dish",   openingStock: 200, sales: 120, closingStock: 80, status: "in_stock" },
];

const statusBadge: Record<StockStatus, { label: string; className: string }> = {
  in_stock:     { label: "In Stock",     className: "bg-green-500 text-white" },
  low_stock:    { label: "Low Stock",    className: "bg-orange-400 text-white" },
  out_of_stock: { label: "Out of Stock", className: "bg-red-500 text-white" },
};

const InventoryOverviewTable = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <h2 className="text-sm font-semibold text-gray-800 px-4 py-4">
        Inventory Overview
      </h2>
      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm border">
          <thead className="border-t border-b border-gray-100 text-gray-900 font-semibold">
            <tr>
              <th className="text-left px-4 py-3">Item</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
              <th className="text-right px-4 py-3 hidden md:table-cell">Opening Stock</th>
              <th className="text-right px-4 py-3 hidden md:table-cell">Sales</th>
              <th className="text-right px-4 py-3">Closing Stock</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const badge = statusBadge[item.status];
              return (
                <tr key={item.id} className="border-t border-gray-50">
                  <td className="px-4 py-3 text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{item.category}</td>
                  <td className="px-4 py-3 text-right text-gray-900 hidden md:table-cell">{item.openingStock}</td>
                  <td className="px-4 py-3 text-right text-gray-900 hidden md:table-cell">{item.sales}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{item.closingStock}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryOverviewTable;