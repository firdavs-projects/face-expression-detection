import React, {useState} from 'react';
import {Bar} from 'react-chartjs-2';
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip,} from 'chart.js';
import {Emotion} from "../../constants";
import FullscreenModal from "../Modal";
import FullscreenIcon from "../../icons/FullscreenIcon.tsx";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

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

    const data = {
        labels: ['Эмоции'],
        datasets: [
            {
                label: Emotion.angry,
                data: [emotionTotals.angry],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
            {
                label: Emotion.disgusted,
                data: [emotionTotals.disgusted],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: Emotion.fearful,
                data: [emotionTotals.fearful],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: Emotion.happy,
                data: [emotionTotals.happy],
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
            },
            {
                label: Emotion.neutral,
                data: [emotionTotals.neutral],
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
            {
                label: Emotion.sad,
                data: [emotionTotals.sad],
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
            },
            {
                label: Emotion.surprised,
                data: [emotionTotals.surprised],
                backgroundColor: 'rgba(201, 203, 207, 0.2)',
                borderColor: 'rgba(201, 203, 207, 1)',
                borderWidth: 1,
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
                text: 'График общей интенсивности эмоций',
            },
        },
        scales: {
            x: {
                title: {
                    display: false,
                    text: 'Эмоции',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Общая интенсивность эмоций',
                },
            },
        },
    };

    return <section className='w-full h-fit relative'>
        <button className='p-4 absolute -top-4 left-0 cursor-pointer' onClick={toggleModal}>
            <FullscreenIcon className='h-6 w-6 '/>
        </button>

        <Bar data={data} options={options} />

        <FullscreenModal visible={isModalVisible} onClose={toggleModal}>
            <Bar data={data} options={options} />
        </FullscreenModal>
    </section>;
};
