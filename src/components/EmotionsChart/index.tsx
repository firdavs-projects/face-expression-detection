import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import FullscreenIcon from '../../icons/FullscreenIcon.tsx';
import FullscreenModal from '../Modal';
import { iconEmoji } from '../../icons/icons.tsx';
import {Emotion, emotionColors} from '../../constants';


const CustomLegend: React.FC<{ payload?: any[] }> = ({ payload }) => (
    <div className="flex flex-wrap gap-1 text-sm justify-center">
        {payload?.map((entry, index) => (
            <div key={index} className='flex items-center'>
                <span style={{ marginRight: 2 }}>
                    {iconEmoji[entry.value] || entry.value}
                </span>
                <span style={{ color: emotionColors[entry.value] }}>
                    {Emotion[entry.value as keyof typeof Emotion] || entry.value}
                </span>
            </div>
        ))}
    </div>
);

export const EmotionsChart: React.FC<{ expressionsData: any[] }> = ({ expressionsData }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const toggleModal = () => setIsModalVisible(!isModalVisible);

    const chartData = expressionsData.map((data, index) => ({
        frame: `Кадр ${index + 1}`,
        angry: data[0]?.expressions?.angry || 0,
        disgusted: data[0]?.expressions?.disgusted || 0,
        fearful: data[0]?.expressions?.fearful || 0,
        happy: data[0]?.expressions?.happy || 0,
        neutral: data[0]?.expressions?.neutral || 0,
        sad: data[0]?.expressions?.sad || 0,
        surprised: data[0]?.expressions?.surprised || 0
    }));

    const Chart = ({height = 250}: {height?: number}) => (
        <>
            <h2 className='text-center'>
                График распределения эмоции
            </h2>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis fontSize={14} dataKey="frame" />
                    <YAxis fontSize={14} />
                    <Tooltip />
                    <Legend content={<CustomLegend />} />
                    <Line isAnimationActive={false} type="monotone" dataKey="angry" stroke={emotionColors.angry} dot={false} />
                    <Line isAnimationActive={false} type="monotone" dataKey="disgusted" stroke={emotionColors.disgusted} dot={false} />
                    <Line isAnimationActive={false} type="monotone" dataKey="fearful" stroke={emotionColors.fearful} dot={false} />
                    <Line isAnimationActive={false} type="monotone" dataKey="happy" stroke={emotionColors.happy} dot={false} />
                    <Line isAnimationActive={false} type="monotone" dataKey="neutral" stroke={emotionColors.neutral} dot={false} />
                    <Line isAnimationActive={false} type="monotone" dataKey="sad" stroke={emotionColors.sad} dot={false} />
                    <Line isAnimationActive={false} type="monotone" dataKey="surprised" stroke={emotionColors.surprised} dot={false} />
                </LineChart>
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
                <Chart height={700} />
            </FullscreenModal>
        </section>
    );
};