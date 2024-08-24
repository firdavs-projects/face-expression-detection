import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { EmotionsTable } from "../../components/EmotionsTable";
import { EmotionsBarChart } from "../../components/EmotionsBarChart";
import { EmotionsPieChart } from "../../components/EmotionsPieChart";
import { EmotionsChart } from "../../components/EmotionsChart";
import { Emotion, SLIDES } from "../../constants";
import { getVideoFromDB } from "../../utils";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { useDb } from "../../hooks/useDb.ts";
import { Range } from 'react-range';

const FaceExpressionDetection: React.FC = () => {
    const db = useDb();
    const { slideId } = useParams();

    const [videoFile, setVideoFile] = useState<Blob | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [expressionsData, setExpressionsData] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [rangeValues, setRangeValues] = useState([0, 100]);

    useEffect(() => {
        if (db) {
            getVideoFromDB(db, Number(slideId)).then(videoBlob => {
                if (videoBlob) {
                    setVideoFile(videoBlob);
                    setExpressionsData([]); // Clear previous data
                    videoRef.current?.load();
                }
            });
        }
    }, [db]);

    useEffect(() => {
        if (isModelsLoaded) {
            handleAnalyze();
        }
    }, [isModelsLoaded]);

    useEffect(() => {
        const loadModels = async () => {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models'),
                faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            ]);
            setIsModelsLoaded(true);
        };
        loadModels();
    }, []);

    const handleAnalyze = async () => {
        if (videoRef.current && canvasRef.current && isModelsLoaded) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            setIsAnalyzing(true);
            video.play();
            console.log('Start analyzing');

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
                            .withFaceLandmarks();

                        setExpressionsData(prevData => [...prevData, detections]);

                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);

                            faceapi.draw.drawFaceLandmarks(canvas, detectionsWithLandmarks);

                            detections.forEach(detection => {
                                const { detection: faceDetection, expressions } = detection;
                                const { box } = faceDetection;

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

    const filteredData = expressionsData.slice(
        Math.floor(expressionsData.length * (rangeValues[0] / 100)),
        Math.floor(expressionsData.length * (rangeValues[1] / 100))
    );

    useEffect(() => {
        if (videoRef.current && canvasRef.current) {
            videoRef.current.currentTime = rangeValues[0] / 100 * videoRef.current.duration;
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    }, [rangeValues[0]])

    useEffect(() => {
        if (videoRef.current && canvasRef.current) {
            videoRef.current.currentTime = rangeValues[1] / 100 * videoRef.current.duration;
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    }, [rangeValues[1]])

    return (
        <div className="container-xl mx-auto p-2">
            <header className="flex items-center gap-4 pb-2">
                <Link to='/emotion'><Button>Назад к списку</Button></Link>
                <h1 className="text-2xl font-bold">{isAnalyzing ? "Идет анализ..." : "Анализ эмоций"}</h1>
            </header>

            {videoFile && (
                <section className='grid grid-cols-12 gap-6'>
                    <div className='col-span-7 grid gap-3'>
                        <div className='relative'>
                            <video muted ref={videoRef} className="w-full max-w-fit min-w-full">
                                <source src={URL.createObjectURL(videoFile)} />
                            </video>
                            <canvas ref={canvasRef} className="w-full h-full absolute top-0 left-0 right-0 bottom-0" />
                        </div>

                        <div className='flex flex-col items-center mt-4'>
                            <div className='w-full px-3'>
                                <Range
                                    step={1}
                                    min={0}
                                    max={100}
                                    disabled={isAnalyzing}
                                    values={rangeValues}
                                    onChange={values => setRangeValues(values)}
                                    renderTrack={({ props, children }) => (
                                        <div
                                            {...props}
                                            className="relative w-full h-5 bg-gray-200 rounded-lg"
                                        >
                                            {children}
                                        </div>
                                    )}
                                    renderThumb={({ props }) => (
                                        <div
                                            {...props}
                                            className="w-5 h-5 bg-blue-500 rounded-full"
                                        />
                                    )}
                                />
                                <div className="flex justify-between w-full mt-2">
                                    <span className="text-sm text-gray-600">{rangeValues[0]}%</span>
                                    <span className="text-sm text-gray-600">{rangeValues[1]}%</span>
                                </div>
                            </div>
                        </div>

                        {filteredData.length > 0 && (
                            <EmotionsTable expressionsData={filteredData} />
                        )}
                    </div>

                    {filteredData.length > 0 && (
                        <div className='col-span-5 grid gap-3'>
                            <EmotionsBarChart expressionsData={filteredData}/>
                            <EmotionsChart expressionsData={filteredData}/>
                            <EmotionsPieChart expressionsData={filteredData} />
                        </div>
                    )}
                </section>
            )}

            <section className='mt-5'>
                <h3 className='text-xl font-bold mb-2'>
                    Анализ предоставлен по текущему изображению:
                </h3>
                <img className='w-full' src={SLIDES[Number(slideId)]} alt='slide'/>
            </section>
        </div>
    );
};

export default FaceExpressionDetection;