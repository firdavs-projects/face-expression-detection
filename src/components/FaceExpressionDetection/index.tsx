import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { EmotionsTable } from "../EmotionsTable";
import { EmotionsBarChart } from "../EmotionsBarChart";
import { EmotionsPieChart } from "../EmotionsPieChart";
import {EmotionsChart} from "../EmotionsChart";
import {Emotion} from "../../constants";

const FaceExpressionDetection: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [expressionsData, setExpressionsData] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models'),
                faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            ]).then(() => setIsModelsLoaded(true));
        }
        loadModels();
    }, []);

    useEffect(() => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            if (video && canvas) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            video.addEventListener('loadeddata', () => {
                if (canvas) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }
            });
        }
    }, [videoFile]);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setVideoFile(e.target.files[0]);
            setExpressionsData([]); // Clear previous data
            videoRef.current?.load();
        }
    };

    const handleAnalyze = async () => {
        if (videoRef.current && canvasRef.current && isModelsLoaded) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            setIsAnalyzing(true);
            video.play();

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);

            const interval = setInterval(async () => {
                try {
                    if (video && !video.paused && !video.ended) {
                        const detections = await faceapi
                            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                            .withFaceExpressions();
                        const detectionsWithLandmarks = await faceapi
                            .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
                            .withFaceLandmarks()

                        setExpressionsData(prevData => [...prevData, detections]);

                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);

                            faceapi.draw.drawDetections(canvas, detections);
                            faceapi.draw.drawFaceLandmarks(canvas, detectionsWithLandmarks);
                            // faceapi.draw.drawFaceExpressions(canvas, detections);

                            detections.forEach(detection => {
                                const { detection: faceDetection, expressions } = detection;
                                const { box } = faceDetection;

                                const emotion = Object.keys(expressions).reduce((maxEmotion, currentEmotion) => {
                                    return expressions[currentEmotion as keyof typeof expressions] > expressions[maxEmotion as keyof typeof expressions]
                                        ? currentEmotion
                                        : maxEmotion;
                                }, 'neutral');

                                const translation = Emotion[emotion as keyof typeof Emotion] || emotion;

                                ctx.font = '42px Arial';
                                ctx.fillStyle = 'blue';
                                ctx.textAlign = 'left';

                                ctx.fillText(translation, box.left, box.bottom + 50);
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error detecting faces: ", error);
                }
            }, 500);

            video.onended = () => {
                clearInterval(interval);
                setIsAnalyzing(false);
            };

            video.onpause = () => {
                clearInterval(interval);
                setIsAnalyzing(false);
            };
        }
    };

    return (
        <div className="p-2 container-xl mx-auto">
            <header className="text-center">
                <h1 className="text-2xl font-bold mb-2">Анализ эмоций</h1>
                {/*<p className="text-gray-600">Загрузите видео для анализа эмоций</p>*/}
            </header>

            <input
                type="file"
                accept="video/*"
                disabled={isAnalyzing || !isModelsLoaded}
                onChange={handleVideoUpload}
                className="mb-2 mr-2"
            />
            {videoFile && (
                <>
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !isModelsLoaded}
                        className="mb-2 bg-blue-500 text-white p-2"
                    >
                        {isAnalyzing ? "Идет анализ..." : "Анализ эмоций"}
                    </button>
                    <section className='grid grid-cols-12 gap-6'>
                        <div className='col-span-8 grid gap-3' style={{ position: 'relative' }}>
                            <video ref={videoRef} controls className="w-full max-w-fit min-w-full">
                                <source src={URL.createObjectURL(videoFile)} />
                            </video>
                            <canvas ref={canvasRef} className="w-full max-w-fit absolute top-0 left-0" />

                            {expressionsData.length > 0 && (
                                <EmotionsTable expressionsData={expressionsData} />
                            )}
                        </div>
                        {expressionsData.length > 0 && (
                            <div className='col-span-4 grid gap-3'>
                                <EmotionsBarChart expressionsData={expressionsData}/>
                                <EmotionsChart expressionsData={expressionsData}/>
                                <EmotionsPieChart expressionsData={expressionsData} />
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default FaceExpressionDetection;
