import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FullscreenIcon from '../../icons/FullscreenIcon.tsx';
import FullscreenModal from '../Modal';
import { iconEmoji } from '../../icons/icons.tsx';
import {Emotion, emotionColors} from '../../constants';

const CustomLegend: React.FC<{ payload?: any[] }> = ({ payload }) => (
    <div className="flex flex-wrap gap-1 text-sm justify-center">
        {payload?.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', margin: '0 4px', color: emotionColors[entry.value] }}>
                <span style={{ marginRight: 4 }}>
                    {iconEmoji[entry.value] || entry.value}
                </span>
                <span>{Emotion[entry.value as keyof typeof Emotion] || entry.value}</span>
            </div>
        ))}
    </div>
);

export const EmotionsPieChart: React.FC<{ expressionsData: any[] }> = ({ expressionsData }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const toggleModal = () => setIsModalVisible(!isModalVisible);

    const emotionTotals = {
        angry: 0,
        disgusted: 0,
        fearful: 0,
        happy: 0,
        neutral: 0,
        sad: 0,
        surprised: 0
    };

    expressionsData.forEach(data => {
        const expressions = data[0]?.expressions;
        if (expressions) {
            Object.keys(emotionTotals).forEach(emotion => {
                emotionTotals[emotion as keyof typeof emotionTotals] += expressions[emotion] || 0;
            });
        }
    });

    const chartData = [
        { name: 'angry', value: emotionTotals.angry },
        { name: 'disgusted', value: emotionTotals.disgusted },
        { name: 'fearful', value: emotionTotals.fearful },
        { name: 'happy', value: emotionTotals.happy },
        { name: 'neutral', value: emotionTotals.neutral },
        { name: 'sad', value: emotionTotals.sad },
        { name: 'surprised', value: emotionTotals.surprised }
    ];

    const Chart = ({height=250, radius=90}: {height?: number; radius?: number}) => (
        <>
            <h2 className='text-center font-bold'>
                Круговая диаграмма эмоций
            </h2>
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Tooltip />
                    <Legend content={<CustomLegend />} />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={radius}
                        fill="#8884d8"
                        isAnimationActive={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell  key={`cell-${index}`} fill={emotionColors[entry.name]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </>
    )

    return (
        <section className='max-h-[350px] w-full relative'>
            <button className='p-4 absolute -top-4 left-0 cursor-pointer z-10' onClick={toggleModal}>
                <FullscreenIcon className='h-6 w-6' />
            </button>

            <Chart />

            <FullscreenModal visible={isModalVisible} onClose={toggleModal}>
                <Chart height={700} radius={300} />
            </FullscreenModal>
        </section>
    );
};