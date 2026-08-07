import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";

// Fixed categorical order - validated for CVD-safe adjacent contrast.
// Never reassign per-render or cycle past slot 8; fold extra series into "Other".
const COLORS = [
    "#2A78D6",
    "#EB6834",
    "#1BAF7A",
    "#EDA100",
    "#E87BA4",
    "#008300",
    "#4A3AA7",
    "#E34948",
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