import React from 'react';
import {Emotion, EmotionColors} from "../../constants";

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
        <div className="mb-auto bg-[#F7F9FB] rounded-2xl p-7">
            <h2 className="text-lg font-bold mb-2">Статистика эмоций</h2>
            <div className='overflow-x-scroll'>
                <div className='flex flex-col gap-2'>
                    <ul className='text-black/40 grid grid-cols-3 items-center w-full rounded-lg px-5 py-3'>
                        <li>Эмоция</li>
                        <li>Количество</li>
                        <li>Процентное соотношение</li>
                    </ul>

                    {percentageData.map((data) => (
                        <ul key={data.emotion} className='bg-[#E3F5FF] grid grid-cols-3 w-full rounded-2xl px-5 py-3'>
                            <li className='flex gap-4 items-center'>
                                <span
                                    style={{ backgroundColor: EmotionColors[data.emotion as keyof typeof EmotionColors]}}
                                    className='h-4 w-4 rounded-full'
                                />
                                {Emotion[data.emotion as keyof typeof Emotion]}
                            </li>
                            <li>{data.count}</li>
                            <li>{data.percentage}</li>
                        </ul>
                    ))}

                </div>
                {/*<table className="min-w-full bg-white table-auto rounded-lg border-separate border-spacing-2">*/}
                {/*    <thead>*/}
                {/*    <tr>*/}
                {/*        <th className="py-2 px-4 ">Эмоция</th>*/}
                {/*        <th className="py-2 px-4 ">Количество</th>*/}
                {/*        <th className="py-2 px-4 ">Процент (%)</th>*/}
                {/*    </tr>*/}
                {/*    </thead>*/}
                {/*    <tbody>*/}
                {/*    {percentageData.map((data) => (*/}
                {/*        <tr key={data.emotion} className='bg-[#E3F5FF] w-full rounded-lg mb-2'>*/}
                {/*            <td className="p-4">{Emotion[data.emotion as keyof typeof Emotion]}</td>*/}
                {/*            <td className="p-4">{data.count}</td>*/}
                {/*            <td className="p-4">{data.percentage}</td>*/}
                {/*        </tr>*/}
                {/*    ))}*/}
                {/*    </tbody>*/}
                {/*</table>*/}
            </div>
        </div>
    );
};