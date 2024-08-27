export enum Emotion {
    angry = "Злость",
    disgusted = "Отвращение",
    fearful = "Страх",
    happy = "Счастье",
    neutral = "Нейтральное",
    sad = "Грусть",
    surprised = "Удивление",
}

export interface ISlide {
    src: string;
    type: 'image' | 'video';
}

export const SLIDES: ISlide[] = [
    {src: '/slides/1.mp4', type: 'video'},
    {src: '/slides/1.jpg', type: 'image'},
    {src: '/slides/2.jpg', type: 'image'},
    {src: '/slides/3.jpg', type: 'image'},
    {src: '/slides/4.jpg', type: 'image'},
    {src: '/slides/5.webp', type: 'image'},
]