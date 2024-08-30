import React, {useState} from 'react';
import {Bar} from 'react-chartjs-2';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import {Emotion, EmotionColors} from "../../constants";
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
                backgroundColor: EmotionColors.angry,
                borderColor: EmotionColors.angry,
                borderWidth: 1,
            },
            {
                label: Emotion.disgusted,
                data: [emotionTotals.disgusted],
                backgroundColor: EmotionColors.disgusted,
                borderColor: EmotionColors.disgusted,
                borderWidth: 1,
            },
            {
                label: Emotion.fearful,
                data: [emotionTotals.fearful],
                backgroundColor: EmotionColors.fearful,
                borderColor: EmotionColors.fearful,
                borderWidth: 1,
            },
            {
                label: Emotion.happy,
                data: [emotionTotals.happy],
                backgroundColor: EmotionColors.happy,
                borderColor: EmotionColors.happy,
                borderWidth: 1,
            },
            {
                label: Emotion.neutral,
                data: [emotionTotals.neutral],
                backgroundColor: EmotionColors.neutral,
                borderColor: EmotionColors.neutral,
                borderWidth: 1,
            },
            {
                label: Emotion.sad,
                data: [emotionTotals.sad],
                backgroundColor: EmotionColors.sad,
                borderColor: EmotionColors.sad,
                borderWidth: 1,
            },
            {
                label: Emotion.surprised,
                data: [emotionTotals.surprised],
                backgroundColor: EmotionColors.surprised,
                borderColor: EmotionColors.surprised,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        elements: {
            bar: {
                borderRadius: 10,
                borderSkipped: false
            },
            // point: {
            //     pointStyle: false
            // },
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                }

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
        <button className='p-4 absolute -top-1 left-0 cursor-pointer' onClick={toggleModal}>
            <FullscreenIcon className='h-6 w-6 '/>
        </button>

        <Bar className='bg-[#F7F9FB] p-5 rounded-2xl' data={data} options={options} />

        <FullscreenModal visible={isModalVisible} onClose={toggleModal}>
            <Bar data={data} options={options} />
        </FullscreenModal>
    </section>;
};
