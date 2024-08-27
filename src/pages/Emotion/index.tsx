import React, {useEffect, useRef, useState} from 'react';
import * as faceapi from 'face-api.js';
import {EmotionsTable} from "../../components/EmotionsTable";
import {EmotionsBarChart} from "../../components/EmotionsBarChart";
import {EmotionsPieChart} from "../../components/EmotionsPieChart";
import {EmotionsChart} from "../../components/EmotionsChart";
import {Emotion, SLIDES} from "../../constants";
import {getVideoFromDB} from "../../utils";
import {Link, useParams} from "react-router-dom";
import {Button} from "../../components/Button";
import {useDb} from "../../hooks/useDb.ts";
import {Range} from 'react-range';

const FaceExpressionDetection: React.FC = () => {
    const db = useDb();
    const { slideId } = useParams();

    const [videoFile, setVideoFile] = useState<Blob | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [expressionsData, setExpressionsData] = useState<any[]>([]);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [rangeValues, setRangeValues] = useState([0, 100]);
    const [isVideoMetaLoadded, setIsVideoMetaLoadded] = useState(false);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (db) {
            getVideoFromDB(db, Number(slideId)).then((data) => {
                if (data) {
                    setVideoFile(data.videoData);
                    setExpressionsData(data.expressionsData);
                    setDuration(data.duration)
                    videoRef.current?.load();
                }
            });
        }
    }, [db]);

    useEffect(() => {
        if (isModelsLoaded) {
            videoRef.current?.play();
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

    const filteredData = expressionsData.slice(
        Math.floor(expressionsData.length * (rangeValues[0] / 100)),
        Math.floor(expressionsData.length * (rangeValues[1] / 100))
    );

    const analyzeDetections = async () => {
        if (videoRef.current) {
            const video = videoRef.current;

            return faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions().run();
        }
    }

    const drawDetections = async (
        detections: faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<{detection: faceapi.FaceDetection}, faceapi.FaceLandmarks68>>[] = []
    ) => {

        if (videoRef.current && canvasRef.current && detections?.length) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                faceapi.draw.drawFaceLandmarks(canvas, detections);
                detections.forEach(detection => drawDetection(detection, ctx));
            }
        }
    }

    const drawDetection = (
        detection:  faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<{detection: faceapi.FaceDetection}, faceapi.FaceLandmarks68>>,
        ctx: CanvasRenderingContext2D
    ) => {

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
    }

    const handlePlayVideo = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const interval = setInterval(async () => {
                const detections = await analyzeDetections();
                detections && drawDetections([detections])
            }, 250);

            video.onended = () => {
                console.log('Video ended');
                clearInterval(interval);
                setIsVideoMetaLoadded(true);
            };

            video.onpause = () => {
                clearInterval(interval);
            };
        }
    }

    const handleChangeRange = async (value: number) => {
        if (videoRef.current && canvasRef.current) {
            // videoRef.current.pause();
            videoRef.current.currentTime = (value / 100) * duration;

            await new Promise((resolve) => {
                const onTimeUpdate = () => {
                    videoRef.current?.removeEventListener('timeupdate', onTimeUpdate);
                    resolve(true);
                };
                videoRef.current?.addEventListener('timeupdate', onTimeUpdate);
            });

            try {
                const currentDetection = await analyzeDetections();

                if (currentDetection) {
                    drawDetections([currentDetection]);
                } else {
                    console.log('No detections found');
                }
            } catch (error) {
                console.error('Error detecting faces:', error);
            }
        }
    };

    const currentSlide = () => {
        const slide = SLIDES[Number(slideId)];
        switch (slide.type) {
            case 'image':
                return (
                    <img className='w-full rounded-2xl' src={slide.src} alt='slide'/>
                )
            case 'video':
                return (
                    <video className='w-full rounded-2xl'  src={slide.src} controls autoPlay muted />
                )
        }
    }

    useEffect(() => {
        handleChangeRange(rangeValues[0]);
    }, [rangeValues[0]])

    useEffect(() => {
        handleChangeRange(rangeValues[1]);
    }, [rangeValues[1]])

    return (
        <div className="container-xl relative mx-auto py-6 px-9">
            <header className="flex p-6 justify-end items-center gap-4 mx-auto fixed container left-0 bottom-0 right-0 z-20">
                <Link to='/emotion'><Button>Назад к списку</Button></Link>
            </header>

            {videoFile && (
                <section className='grid grid-cols-12 gap-6'>
                    <div className='col-span-7 grid gap-3'>
                        <div className='relative'>
                            <video
                                preload="auto"
                                muted
                                ref={videoRef}
                                onLoadedMetadata={() => {
                                    videoRef.current?.play();
                                    setIsVideoMetaLoadded(true);
                                    handlePlayVideo()
                                }}
                                className="w-full max-w-fit min-w-full rounded-2xl"
                            >
                                <source src={URL.createObjectURL(videoFile)} />
                            </video>
                            <canvas
                                onClick={() => {
                                    videoRef.current?.play();
                                }}
                                ref={canvasRef} className="w-full h-full absolute top-0 left-0 right-0 bottom-0"
                            />

                            <div className='flex flex-col items-center absolute bottom-2 left-4 right-4'>
                                <div className='w-full px-3'>
                                    <Range
                                        step={1}
                                        min={0}
                                        max={100}
                                        values={rangeValues}
                                        disabled={!isVideoMetaLoadded}
                                        onChange={values => setRangeValues(values)}
                                        renderTrack={({ props, children }) => (
                                            <div
                                                {...props}
                                                className={`${isVideoMetaLoadded ? 'bg-white/50 cursor-pointer' : 'cursor-not-allowed bg-gray-300'}
                                              relative w-full h-5 rounded-lg`}
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
                                        <span className="text-base bg-white/50 rounded px-2 py-1 font-bold text-blue-600">{rangeValues[0]}%</span>
                                        <span className="text-base bg-white/50 rounded px-2 py-1 font-bold text-blue-600">{rangeValues[1]}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {filteredData.length > 0 && (
                            <EmotionsTable expressionsData={filteredData} />
                        )}
                    </div>

                    {filteredData.length > 0 && (
                        <div className='col-span-5 grid gap-3 mb-auto'>
                            <EmotionsBarChart expressionsData={filteredData}/>
                            <EmotionsChart expressionsData={filteredData}/>
                            <EmotionsPieChart expressionsData={filteredData} />
                        </div>
                    )}
                </section>
            )}

            <section className='mt-5 bg-[#F7F9FB] p-6 rounded-2xl'>
                <h3 className='text-lg font-bold mb-4'>
                    Анализ предоставлен по текущему материалу:
                </h3>

                {currentSlide()}
            </section>
        </div>
    );
};

export default FaceExpressionDetection;
