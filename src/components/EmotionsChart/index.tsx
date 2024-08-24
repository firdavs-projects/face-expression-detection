import React, {useState} from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {Emotion} from "../../constants";
import FullscreenIcon from "../../icons/FullscreenIcon.tsx";
import FullscreenModal from "../Modal";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
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
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
            },
            {
                label: Emotion.disgusted,
                data: expressionsData.map(data => data[0]?.expressions?.disgusted || 0),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false,
            },
            {
                label: Emotion.fearful,
                data: expressionsData.map(data => data[0]?.expressions?.fearful || 0),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
            },
            {
                label: Emotion.happy,
                data: expressionsData.map(data => data[0]?.expressions?.happy || 0),
                borderColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                fill: false,
            },
            {
                label: Emotion.neutral,
                data: expressionsData.map(data => data[0]?.expressions?.neutral || 0),
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: false,
            },
            {
                label: Emotion.sad,
                data: expressionsData.map(data => data[0]?.expressions?.sad || 0),
                borderColor: 'rgba(255, 159, 64, 1)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                fill: false,
            },
            {
                label: Emotion.surprised,
                data: expressionsData.map(data => data[0]?.expressions?.surprised || 0),
                borderColor: 'rgba(201, 203, 207, 1)',
                backgroundColor: 'rgba(201, 203, 207, 0.2)',
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
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
            <button className='p-4 absolute -top-4 left-0 cursor-pointer' onClick={toggleModal}>
                <FullscreenIcon className='h-6 w-6'/>
            </button>
            <Line data={data} options={options} />

            <FullscreenModal visible={isModalVisible} onClose={toggleModal}>
                <Line data={data} options={options} />
            </FullscreenModal>
        </section>
    );
};