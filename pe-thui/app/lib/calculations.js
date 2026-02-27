import dayjs from 'dayjs';

export function calculateAge(dob, toDate = new Date()) {
    const start = dayjs(dob);
    const end = dayjs(toDate);
    const totalMonths = end.diff(start, 'month');
    const startPlusMonths = start.add(totalMonths, 'month');
    const days = end.diff(startPlusMonths, 'day');

    let text = '';
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years > 0) {
        text += `${years} tuổi `;
    }
    if (months > 0) {
        text += `${months} tháng `;
    }
    if (days > 0 || (years === 0 && months === 0)) {
        text += `${days} ngày`;
    }

    return {
        totalMonths,
        days,
        text: text.trim()
    };
}

export function predictAdultHeight(currentHeight, gender, ageMonths) {
    if (!currentHeight || ageMonths === undefined) return 0;

    // Simplified MVP formula
    const factor = gender === 'male' ? 1.05 : 1;
    let baseMultiplier = 2.0;
    if (ageMonths < 12) baseMultiplier = 2.4;
    else if (ageMonths < 24) baseMultiplier = 2.0;
    else if (ageMonths < 48) baseMultiplier = 1.6;
    else baseMultiplier = 1.4;

    let predicted = currentHeight * baseMultiplier * factor;
    predicted = Math.max(145, Math.min(195, predicted));
    return Math.round(predicted);
}

export function assessWeight(weight, ageMonths) {
    // Rough estimate for MVP
    const avg = ageMonths * 0.5 + 4;
    if (weight > avg * 1.3) return { status: 'Béo phì', color: 'text-red-500', bg: 'bg-red-50' };
    if (weight < avg * 0.75) return { status: 'Suy dinh dưỡng', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { status: 'Đạt chuẩn', color: 'text-green-500', bg: 'bg-green-50' };
}

export function assessHeight(height, ageMonths) {
    // Rough estimate for MVP
    const avg = ageMonths * 1.5 + 50;
    if (height > avg * 1.1) return { status: 'Cao so với tiêu chuẩn', color: 'text-cyan-500', bg: 'bg-cyan-50' };
    if (height < avg * 0.9) return { status: 'Thấp còi', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { status: 'Bình thường', color: 'text-green-500', bg: 'bg-green-50' };
}
