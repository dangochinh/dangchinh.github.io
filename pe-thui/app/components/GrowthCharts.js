import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaChevronLeft, FaEllipsisV } from 'react-icons/fa';

export default function GrowthCharts({ records, profile, onBack }) {
    const data = [...records].sort((a, b) => a.ageMonths - b.ageMonths);

    // Create smoothed out standard bands
    // We want the chart to go from 0 to max age + a bit
    const maxAge = data.length > 0 ? Math.max(...data.map(d => d.ageMonths)) + 3 : 12;
    const chartData = [];

    for (let i = 0; i <= maxAge; i++) {
        const standardWeightAvg = i * 0.5 + 4;
        const standardHeightAvg = i * 1.5 + 50;

        let record = data.find(d => d.ageMonths === i);

        chartData.push({
            ageMonths: i,
            weight: record ? record.weight : null,
            height: record ? record.height : null,
            wUpper: Number((standardWeightAvg * 1.3).toFixed(1)),
            wNormal: Number((standardWeightAvg * 1.1).toFixed(1)),
            wLower: Number((standardWeightAvg * 0.75).toFixed(1)),
            hUpper: Number((standardHeightAvg * 1.1).toFixed(1)),
            hNormal: Number((standardHeightAvg).toFixed(1)),
            hLower: Number((standardHeightAvg * 0.9).toFixed(1)),
        });
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FaChevronLeft className="text-gray-800" /></button>
                <h1 className="font-bold text-lg text-gray-800 tracking-wide uppercase">Biểu đồ phát triển</h1>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FaEllipsisV className="text-gray-800" /></button>
            </div>

            <div className="p-4 space-y-8">
                <div className="cute-card p-6 bg-white border border-pink-100 shadow-sm">
                    <h2 className="text-center font-extrabold text-gray-800 mb-6 uppercase tracking-wider text-sm">BIỂU ĐỒ CÂN NẶNG</h2>
                    <div className="flex justify-center gap-4 mb-6 text-[10px] font-bold uppercase text-gray-500">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#ffe0b2]"></span> Béo phì</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#b2ebf2]"></span> Bình thường</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#f8bbd0]"></span> Suy dinh dưỡng</span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="ageMonths" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="wUpper" stroke="none" fill="#ffe0b2" isAnimationActive={false} name="Béo phì" />
                                <Area type="monotone" dataKey="wNormal" stroke="none" fill="#b2ebf2" isAnimationActive={false} name="Bình thường" />
                                <Area type="monotone" dataKey="wLower" stroke="none" fill="#f8bbd0" isAnimationActive={false} name="Suy dinh dưỡng" />
                                <Line connectNulls type="monotone" dataKey="weight" stroke="#00bcd4" strokeWidth={3} dot={{ Math: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Cân nặng của con" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="cute-card p-6 bg-white border border-pink-100 shadow-sm">
                    <h2 className="text-center font-extrabold text-gray-800 mb-6 uppercase tracking-wider text-sm">BIỂU ĐỒ CHIỀU CAO</h2>
                    <div className="flex justify-center gap-4 mb-6 text-[10px] font-bold uppercase text-gray-500">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#ffe0b2]"></span> Cao</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#b2ebf2]"></span> Bình thường</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#f8bbd0]"></span> Thấp còi</span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="ageMonths" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="hUpper" stroke="none" fill="#ffe0b2" isAnimationActive={false} name="Cao" />
                                <Area type="monotone" dataKey="hNormal" stroke="none" fill="#b2ebf2" isAnimationActive={false} name="Bình thường" />
                                <Area type="monotone" dataKey="hLower" stroke="none" fill="#f8bbd0" isAnimationActive={false} name="Thấp còi" />
                                <Line connectNulls type="monotone" dataKey="height" stroke="#e91e63" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Chiều cao của con" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
