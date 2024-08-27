import React, {useState} from 'react';
import {Line} from 'react-chartjs-2';
import {
    CategoryScale,
    Chart as ChartJS, Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import {Emotion, EmotionColors} from "../../constants";
import FullscreenIcon from "../../icons/FullscreenIcon.tsx";
import FullscreenModal from "../Modal";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const EmotionsChart: React.FC<{ expressionsData: any[] }> = ({ expressionsData }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const toggleModal = () => setIsModalVisible(!isModalVisible);

    const data = {
        labels: expressionsData.map((_, index) => `Кадр ${index + 1}`),
        datasets: [
            {
                label: Emotion.angry,
                data: expressionsData.map(data => data[0]?.expressions?.angry || 0),
                borderColor: EmotionColors.angry,
                backgroundColor: EmotionColors.angry,
                fill: true,
            },
            {
                label: Emotion.disgusted,
                data: expressionsData.map(data => data[0]?.expressions?.disgusted || 0),
                borderColor: EmotionColors.disgusted,
                backgroundColor: EmotionColors.disgusted,
                fill: true,
            },
            {
                label: Emotion.fearful,
                data: expressionsData.map(data => data[0]?.expressions?.fearful || 0),
                borderColor: EmotionColors.fearful,
                backgroundColor: EmotionColors.fearful,
                fill: true,
            },
            {
                label: Emotion.happy,
                data: expressionsData.map(data => data[0]?.expressions?.happy || 0),
                borderColor: EmotionColors.happy,
                backgroundColor: EmotionColors.happy,
                fill: true,
            },
            {
                label: Emotion.neutral,
                data: expressionsData.map(data => data[0]?.expressions?.neutral || 0),
                borderColor: EmotionColors.neutral,
                backgroundColor: EmotionColors.neutral,
                fill: true,
            },
            {
                label: Emotion.sad,
                data: expressionsData.map(data => data[0]?.expressions?.sad || 0),
                borderColor: EmotionColors.sad,
                backgroundColor: EmotionColors.sad,
                fill: true,
            },
            {
                label: Emotion.surprised,
                data: expressionsData.map(data => data[0]?.expressions?.surprised || 0),
                borderColor: EmotionColors.surprised,
                backgroundColor: EmotionColors.surprised,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        elements: {
            // line: {
            //     fill: false,
            //     borderJoinStyle: 'round'
            // }
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 13
                }
            },
            title: {
                display: true,
                text: 'График распределения эмоции',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Кадры',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Интенсивность эмоции',
                },
            },
        },
    };

    return (
        <section className='w-full h-fit relative'>
            <button className='p-4 absolute -top-1 left-0 cursor-pointer' onClick={toggleModal}>
                <FullscreenIcon className='h-6 w-6'/>
            </button>
            <Line className='bg-[#F7F9FB] p-5 rounded-2xl' data={data} options={options} />

            <FullscreenModal visible={isModalVisible} onClose={toggleModal}>
                <Line data={data} options={options} />
            </FullscreenModal>
        </section>
    );
};