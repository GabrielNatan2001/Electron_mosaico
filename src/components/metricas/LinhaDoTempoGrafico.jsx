import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function LinhaDoTempoGrafico({ data, titulo, isDarkMode }) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {titulo}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: -40, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="1 1"
            stroke={isDarkMode ? "transparent" : "#e5e7eb"} // transparente no dark mode
          />
          <XAxis
            dataKey="data"
            stroke="#6b7280"
            tick={{
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
            }}
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })
            }
          />
          <YAxis
            stroke="#6b7280"
            tick={{
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
            }}
            allowDecimals={false}
          />
          <Tooltip
            wrapperStyle={{ borderRadius: 8, fontFamily: "Inter, sans-serif" }}
            contentStyle={{
              backgroundColor: "#1e293b",
              borderRadius: 8,
              border: "none",
            }}
            labelStyle={{ color: "#f9fafb", fontWeight: 600 }}
            itemStyle={{ color: "#3b82f6", fontWeight: 600 }}
          />
          <Line
            type="monotone"
            dataKey="quantidade"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, stroke: "#3b82f6", fill: "#bfdbfe" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
