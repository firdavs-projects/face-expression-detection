import React, {useState} from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
    TooltipItem,
} from 'chart.js';
import {Emotion} from "../../constants";
import FullscreenIcon from "../../icons/FullscreenIcon.tsx";
import FullscreenModal from "../Modal";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
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



    const data = {
        labels: Object.values(Emotion),
        datasets: [
            {
                data: [
                    emotionTotals.angry,
                    emotionTotals.disgusted,
                    emotionTotals.fearful,
                    emotionTotals.happy,
                    emotionTotals.neutral,
                    emotionTotals.sad,
                    emotionTotals.surprised
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(201, 203, 207, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(201, 203, 207, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const options: ChartOptions<'pie'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'left',
            },
            title: {
                display: true,
                text: 'Круговая диаграмма эмоций ',
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem: TooltipItem<'pie'>) {
                        return `${tooltipItem.label}: ${tooltipItem.raw}`;
                    }
                }
            }
        },
    };

    return (
        <section className='max-h-[350px] w-full relative'>
            <button className='p-4 absolute -top-4 left-0 cursor-pointer' onClick={toggleModal}>
                <FullscreenIcon className='h-6 w-6'/>
            </button>
            <Pie data={data} options={options}  />

            <FullscreenModal visible={isModalVisible} onClose={toggleModal}>
                <Pie data={data} options={options}  />
            </FullscreenModal>
        </section>
    );
};
