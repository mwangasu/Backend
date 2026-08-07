import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

function WardChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />

                <XAxis dataKey="name" stroke="#898781" tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />

                <YAxis stroke="#898781" tickLine={false} axisLine={false} allowDecimals={false} />

                <Tooltip
                    cursor={{ fill: "rgba(42, 120, 214, 0.08)" }}
                    contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
                />

                {/* Single series - one brand hue, not a rainbow (color would carry no extra meaning here) */}
                <Bar dataKey="count" fill="#2A78D6" radius={[6, 6, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default WardChart;