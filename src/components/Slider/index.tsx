import React, { useState, useEffect, useRef } from 'react';
import { saveVideoToDB } from "../../utils";
import { useDb } from "../../hooks/useDb.ts";
import * as faceapi from "face-api.js";
import {Emotion, ISlide} from "../../constants";
import Video from "../Video";
import {EmotionsTable} from "../EmotionsTable";
import {EmotionsBarChart} from "../EmotionsBarChart";
import {EmotionsChart} from "../EmotionsChart";
import {EmotionsPieChart} from "../EmotionsPieChart";

interface SliderProps {
    slides: ISlide[];
    showAnalyzer?: boolean;
}

const Slider: React.FC<SliderProps> = ({ slides, showAnalyzer }) => {
    const [modelsLoaded, setModelsLoaded] = React.useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [analyzedData, setAnalyzedData] = useState<any[]>([]);

    const videoHeight = 480;
    const videoWidth = 640;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    let videoChunks: Blob[] = [];
    let expressionsData: any[] = [];
    let startTime: number;
    const db = useDb();

    React.useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            ]).then(() => setModelsLoaded(true));
        };
        loadModels();
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            let video = videoRef.current;
            if (video) {
                video.srcObject = stream;
                video.play();
            }

            const mediaRecorder = new MediaRecorder(stream);

            console.log('Recording started');

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    console.log('Data available:', event.data.size);
                    videoChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                console.log('Recording stopped');

                if (videoChunks.length > 0) {
                    const blob = new Blob(videoChunks, { type: 'video/webm' });
                    console.log('Saving video to DB:', blob.size);


                    const endTime = Date.now();
                    const durationInSeconds = (endTime - (startTime || 0)) / 1000;

                    if (db) {
                        saveVideoToDB(
                            db,
                            {
                                videoData: blob,
                                slideIndex: currentIndex,
                                expressionsData,
                                duration: durationInSeconds
                            }
                        );
                    }
                } else {
                    console.warn('No video data to save');
                }

                videoChunks = [];
                expressionsData = [];
                startTime = 0;
                setAnalyzedData([]);
            };


            startTime = Date.now();
            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
        } catch (error) {
            console.error("Ошибка при доступе к камере:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
            tracks && tracks.forEach((track) => track.stop());
            console.log('Tracks stopped');
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'PageDown' || event.key === 'ArrowDown') {
            setCurrentIndex(currentIndex => {
                if (currentIndex === slides.length - 1) {
                    return currentIndex;
                } else {
                    stopRecording();
                    return currentIndex + 1
                }
            });
        } else if (event.key === 'PageUp' || event.key === 'ArrowUp') {
            setCurrentIndex(currentIndex => {
                if (currentIndex === 0) {
                    return currentIndex;
                } else {
                    stopRecording();
                    return currentIndex - 1
                }
            });
        }
    };

    useEffect(() => {
        console.log('Slider component mounted');
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            console.log('Slider component unmounted');
            window.removeEventListener('keydown', handleKeyDown);
            stopRecording();
        };
    }, []);

    useEffect(() => {
        if (modelsLoaded) {
            startRecording();
        }
    }, [modelsLoaded, currentIndex]);

    const handleVideoOnPlay = () => {
        setInterval(async () => {
            if (videoRef.current && modelsLoaded && canvasRef.current) {
                const detections = await faceapi
                    .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceExpressions();

                expressionsData.push([detections]);
                setAnalyzedData(prev => [...prev, [detections]]);

                const displaySize = {
                    width: videoWidth,
                    height: videoHeight
                }
                const canvas = canvasRef.current;

                faceapi.matchDimensions(canvasRef.current, displaySize);
                const resizedDetections = faceapi.resizeResults([detections], displaySize) as (faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<{detection: faceapi.FaceDetection}, faceapi.FaceLandmarks68>>)[];

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

                    resizedDetections.forEach(detection => {
                        const {detection: faceDetection, expressions} = detection;
                        const {box} = faceDetection;

                        const emotion = Object.keys(expressions).reduce((maxEmotion, currentEmotion) => {
                            return expressions[currentEmotion as keyof typeof expressions] > expressions[maxEmotion as keyof typeof expressions]
                                ? currentEmotion
                                : maxEmotion;
                        }, 'neutral');

                        const translation = Emotion[emotion as keyof typeof Emotion] || emotion;

                        ctx.font = '25px Arial';
                        ctx.fillStyle = 'lightgreen';
                        ctx.textAlign = 'left';
                        ctx.strokeStyle = 'lightgreen';
                        ctx.lineWidth = 3;

                        ctx.fillText(translation, box.left, box.bottom + 25);
                        ctx.beginPath();
                        ctx.rect(box.left, box.top, box.width, box.height);
                        ctx.stroke();
                    });
                }
            }
        }, 250);
    };

    return (
        <>
            <section
                className={`absolute inset-0 transition-transform duration-1000 top-0 left-0 px-9 py-6 right-0 bottom-0 ${
                    showAnalyzer
                        ? 'transform translate-x-0'
                        : 'transform translate-x-full h-screen overflow-hidden'
                }`}
            >
                <section className='grid grid-cols-12 gap-6'>
                    <div className='col-span-7 grid gap-3'>
                        <div className='relative'>
                            <video
                                muted
                                ref={videoRef}
                                className="w-full max-w-fit min-w-full rounded-2xl"
                                onPlay={handleVideoOnPlay}
                                autoPlay
                             />
                            <canvas
                                ref={canvasRef} className="w-full h-full absolute top-0 left-0 right-0 bottom-0"
                            />
                        </div>

                        {analyzedData.length > 0 && (
                            <EmotionsTable expressionsData={analyzedData} />
                        )}
                    </div>

                    {analyzedData.length > 0 && (
                        <div className='col-span-5 grid gap-3 mb-auto'>
                            <EmotionsBarChart expressionsData={analyzedData}/>
                            <EmotionsChart expressionsData={analyzedData}/>
                            <EmotionsPieChart expressionsData={analyzedData} />
                        </div>
                    )}
                </section>
            </section>




            <section className={`absolute inset-0 transition-transform duration-1000 top-0 left-0 right-0 bottom-0
             overflow-y-scroll flex flex-col items-center justify-center ${
                !showAnalyzer
                    ? 'transform translate-x-0'
                    : 'transform -translate-x-full'
                }
             `}>
                {modelsLoaded ? slides.map((slide, index) => {
                    switch (slide.type) {
                        case 'image':
                            return (
                                (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-transform duration-1000 ${
                                            index === currentIndex
                                                ? 'transform translate-y-0'
                                                : 'transform -translate-y-full'
                                        }`}
                                        style={{ backgroundImage: `url(${slide.src})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
                                    />
                                )
                            )
                        case 'video':
                            return (
                                <Video key={index} index={index} currentIndex={currentIndex} slide={slide} />
                            )
                    }
                }) : (
                    <h4 className='text-center font-bold text-2xl'>Загрузка...</h4>
                )}
            </section>

        </>
    );
};

export default Slider;