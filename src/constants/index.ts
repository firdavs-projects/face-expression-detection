export enum Emotion {
    angry = "Злость",
    disgusted = "Отвращение",
    fearful = "Страх",
    happy = "Счастье",
    neutral = "Нейтральное",
    sad = "Грусть",
    surprised = "Удивление",
}

export enum EmotionColors {
    angry = "#007AFF",
    disgusted = "#FF3B30",
    fearful = "#FF9500",
    happy = "#30B0C7",
    neutral = "#5856D6",
    sad = "#AF52DE",
    surprised = "#A2845E",
}

export interface ISlide {
    src: string;
    type: 'image' | 'video';
}

export const SLIDES: ISlide[] = [
    {src: '/slides/1.mp4', type: 'video'},
    {src: '/slides/1.png', type: 'image'},
    {src: '/slides/2.png', type: 'image'},
    {src: '/slides/3.png', type: 'image'},
    {src: '/slides/4.png', type: 'image'},
    {src: '/slides/5.png', type: 'image'},
    {src: '/slides/6.png', type: 'image'},
    {src: '/slides/7.png', type: 'image'},
    {src: '/slides/8.png', type: 'image'},
    {src: '/slides/9.png', type: 'image'},
    {src: '/slides/10.png', type: 'image'},
    {src: '/slides/11.png', type: 'image'},
]