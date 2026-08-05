import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";

const COLORS = [
    "#2563eb",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
];

function CategoryChart({ data }) {
    return (
        <PieChart width={420} height={320}>
            <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                outerRadius={110}
                label
            >
                {data.map((entry, index) => (
                    <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                    />
                ))}
            </Pie>

            <Tooltip />
            <Legend />
        </PieChart>
    );
}

export default CategoryChart;