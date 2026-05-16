"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";

const data = [
    { name: "Dine-in",  value: 458, color: "#2563eb" },
    { name: "Takeaway", value: 287, color: "#eab308" },
];

const total = data.reduce((s, d) => s + d.value, 0);

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + (outerRadius + 28) * Math.cos(-midAngle * RADIAN);
    const y = cy + (outerRadius + 28) * Math.sin(-midAngle * RADIAN);
    const pct = ((value / total) * 100).toFixed(0);
    const color = name === "Dine-in" ? "#2563eb" : "#ca8a04";
    return (
        <text x={x} y={y} fill={color} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={500}>
            {name}: {pct}%
        </text>
    );
};

const OrderBreakdown = () => {
    const t = useTranslations("Reports");
    const td = useTranslations("Dashboard");
    return (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-slate-800">{t("orderBreakdown")}</h3>

            <div className="flex justify-center">
                <ResponsiveContainer width={260} height={220}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            dataKey="value"
                            labelLine={false}
                            label={renderLabel}
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`${v} ${td("orders")}`, ""]} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Count badges */}
            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-blue-50 py-4 text-center">
                    <p className="text-xs text-slate-500">{td("dineIn")}</p>
                    <p className="mt-1 text-2xl font-bold text-blue-600">458</p>
                </div>
                <div className="rounded-xl bg-yellow-50 py-4 text-center">
                    <p className="text-xs text-slate-500">{td("takeaway")}</p>
                    <p className="mt-1 text-2xl font-bold text-yellow-500">287</p>
                </div>
            </div>
        </div>
    );
};

export default OrderBreakdown;