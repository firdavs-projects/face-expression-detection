import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import FullscreenModal from '../Modal';
import FullscreenIcon from '../../icons/FullscreenIcon.tsx';
import { iconEmoji } from '../../icons/icons.tsx';
import {Emotion, emotionColors} from '../../constants';

export const EmotionsBarChart: React.FC<{ expressionsData: any[] }> = ({ expressionsData }) => {
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
        {key: 'angry', name: Emotion.angry, 'Интенсивность': emotionTotals.angry, emoji: iconEmoji['angry'] },
        {key: 'disgusted', name: Emotion.disgusted, 'Интенсивность': emotionTotals.disgusted, emoji: iconEmoji['disgusted'] },
        {key: 'fearful', name: Emotion.fearful, 'Интенсивность': emotionTotals.fearful, emoji: iconEmoji['fearful'] },
        {key: 'happy', name: Emotion.happy, 'Интенсивность': emotionTotals.happy, emoji: iconEmoji['happy'] },
        {key: 'neutral', name: Emotion.neutral, 'Интенсивность': emotionTotals.neutral, emoji: iconEmoji['neutral'] },
        {key: 'sad', name: Emotion.sad, 'Интенсивность': emotionTotals.sad, emoji: iconEmoji['sad'] },
        {key: 'surprised', name: Emotion.surprised, 'Интенсивность': emotionTotals.surprised, emoji: iconEmoji['surprised'] }
    ];

    const renderCustomYAxisTick = ({ x, y, payload }: any) => {
        const data = chartData[payload.index];
        return (
            <g transform={`translate(${x},${y})`}>
                <foreignObject x="-23" y="-15" width="24" height="24">
                    {data.emoji}
                </foreignObject>
                <text x="0" y="2" dy={15} fontSize={12} textAnchor="end" fill={emotionColors[data.key]}>
                    {data.name}
                </text>
            </g>
        );
    };

    const Chart = ({height = 300}: {height?: number}) => (
        <>
            <h2 className='text-center font-bold'>
                График интенсивности эмоций
            </h2>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart
                    data={chartData} layout="vertical"
                    title="График распределения эмоции"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <XAxis type="number" fontSize={14}/>
                    <YAxis type="category" dataKey="name" tick={renderCustomYAxisTick} width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar isAnimationActive={false} dataKey='Интенсивность' fill='gray'>
                        {chartData.map((data, index) => (
                            <Cell key={`cell-${index}`} fill={emotionColors[data.key]}/>
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </>
    )

    return (
        <section className='w-full h-fit relative'>
            <button className='p-4 absolute -top-4 left-0 cursor-pointer z-10' onClick={toggleModal}>
                <FullscreenIcon className='h-6 w-6' />
            </button>

            <Chart />

            <FullscreenModal visible={isModalVisible} onClose={toggleModal}>
                <Chart height={700}/>
            </FullscreenModal>
        </section>
    );
};