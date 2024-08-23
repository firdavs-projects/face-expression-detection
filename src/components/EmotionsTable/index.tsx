import React from 'react';
import {Emotion} from "../../constants";

interface EmotionCounts {
    angry: number;
    disgusted: number;
    fearful: number;
    happy: number;
    neutral: number;
    sad: number;
    surprised: number;
}

export const EmotionsTable: React.FC<{ expressionsData: any[] }> = ({ expressionsData }) => {
    const emotionCounts: EmotionCounts = {
        angry: 0,
        disgusted: 0,
        fearful: 0,
        happy: 0,
        neutral: 0,
        sad: 0,
        surprised: 0,
    };

    expressionsData.forEach((detection) => {
        if (detection.length > 0) {
            const expressions = detection[0]?.expressions;
            if (expressions) {
                Object.keys(expressions).forEach((emotion) => {
                    emotionCounts[emotion as keyof EmotionCounts] += expressions[emotion as keyof EmotionCounts];
                });
            }
        }
    });

    const totalEmotions = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);

    const percentageData = Object.keys(emotionCounts).map((emotion) => ({
        emotion,
        count: emotionCounts[emotion as keyof EmotionCounts],
        percentage: ((emotionCounts[emotion as keyof EmotionCounts] / totalEmotions) * 100).toFixed(2),
    }));

    return (
        <div className="mb-auto">
            <h2 className="text-xl font-bold mb-2 text-center">Статистика эмоций</h2>
            <div className='overflow-x-scroll'>
                <table className="min-w-full bg-white">
                    <thead>
                    <tr>
                        <th className="py-2 px-4 border">Эмоция</th>
                        <th className="py-2 px-4 border">Количество</th>
                        <th className="py-2 px-4 border">Процент (%)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {percentageData.map((data) => (
                        <tr key={data.emotion}>
                            <td className="py-2 px-4 border">{Emotion[data.emotion as keyof typeof Emotion]}</td>
                            <td className="py-2 px-4 border">{data.count}</td>
                            <td className="py-2 px-4 border">{data.percentage}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};