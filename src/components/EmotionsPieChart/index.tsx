import React, {useState} from 'react';
import {Doughnut} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
    TooltipItem,
} from 'chart.js';
import {Emotion, EmotionColors} from "../../constants";
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
                   EmotionColors.angry,
                   EmotionColors.disgusted,
                   EmotionColors.fearful,
                   EmotionColors.happy,
                   EmotionColors.neutral,
                   EmotionColors.sad,
                   EmotionColors.surprised
                ],
                borderColor: [
                   EmotionColors.angry,
                   EmotionColors.disgusted,
                   EmotionColors.fearful,
                   EmotionColors.happy,
                   EmotionColors.neutral,
                   EmotionColors.sad,
                   EmotionColors.surprised
                ],
                // offset: 4,
                // hoverOffset: 4
            },
        ],
    };

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'left',
                labels: {
                    usePointStyle: true,
                }
            },
            title: {
                display: true,
                text: 'Круговая диаграмма эмоций ',
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem: TooltipItem<'doughnut'>) {
                        return `${tooltipItem.label}: ${tooltipItem.raw}`;
                    }
                }
            }
        },
    };

    return (
        <section className=' w-full relative'>
            <button className='p-4 absolute top-0 left-0 cursor-pointer' onClick={toggleModal}>
                <FullscreenIcon className='h-6 w-6'/>
            </button>
            <Doughnut className='bg-[#F7F9FB] p-5 rounded-2xl' data={data} options={options}  />

            <FullscreenModal visible={isModalVisible} onClose={toggleModal}>
                <Doughnut data={data} options={options}  />
            </FullscreenModal>
        </section>
    );
};
