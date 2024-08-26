import React, { useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { EmotionsTable } from "../../components/EmotionsTable";
import { EmotionsBarChart } from "../../components/EmotionsBarChart";
import { EmotionsPieChart } from "../../components/EmotionsPieChart";
import { EmotionsChart } from "../../components/EmotionsChart";
import { Emotion } from "../../constants";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button";

const RealTime: React.FC = () => {

    const [modelsLoaded, setModelsLoaded] = React.useState(false);
    const [captureVideo, setCaptureVideo] = React.useState(false);
    const [expressionsData, setExpressionsData] = useState<any[]>([]);

    const videoRef = React.useRef<HTMLVideoElement>(null);
    const videoHeight = 480;
    const videoWidth = 640;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';

            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            ]).then(() => setModelsLoaded(true));
        }
        loadModels();
    }, []);

    const startVideo = () => {
        setCaptureVideo(true);
        navigator.mediaDevices
            .getUserMedia({ video: { width: 300 } })
            .then(stream => {
                let video = videoRef.current;
                if (video) {
                    video.srcObject = stream;
                    video.play();
                }
            })
            .catch(err => {
                console.error("error:", err);
            });
    }

    const handleVideoOnPlay = () => {
        setInterval(async () => {
            if (canvasRef && canvasRef.current && videoRef && videoRef.current) {
                // @ts-ignore
                canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
                const displaySize = {
                    width: videoWidth,
                    height: videoHeight
                }
                const canvas = canvasRef.current;

                faceapi.matchDimensions(canvasRef.current, displaySize);

                const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

                setExpressionsData(prevData => [...prevData, detections]);

                const resizedDetections = faceapi.resizeResults(detections, displaySize);

                // @ts-ignore
                canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);

                setExpressionsData(prevData => [...prevData, detections]);

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        }, 250)
    }

    const closeWebcam = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            // @ts-ignore
            videoRef.current.srcObject?.getTracks()[0].stop();
            setCaptureVideo(false);
            setExpressionsData([]);
        }
    }

    return (
        <div className="container-xl mx-auto p-2">
            <header className="flex items-center gap-4 pb-2">
                <Link to='/emotion'><Button>Назад к списку</Button></Link>
                <Button onClick={captureVideo? closeWebcam: startVideo}>
                    {captureVideo ? 'Закрыть камеру' :'Открыть камеру'}
                </Button>
            </header>

            {captureVideo && modelsLoaded && <section className='grid grid-cols-12 gap-6'>
                <div className='col-span-7 grid gap-3'>
                    <div className='relative'>
                        <video muted ref={videoRef} onPlay={handleVideoOnPlay} className="w-full max-w-fit min-w-full"/>
                        <canvas ref={canvasRef} className="w-full h-full absolute top-0 left-0 right-0 bottom-0"/>
                    </div>

                    {expressionsData.length > 0 && (
                        <EmotionsTable expressionsData={expressionsData}/>
                    )}
                </div>

                {expressionsData.length > 0 && (
                    <div className='col-span-5 grid gap-3'>
                        <EmotionsBarChart expressionsData={expressionsData}/>
                        <EmotionsChart expressionsData={expressionsData}/>
                        <EmotionsPieChart expressionsData={expressionsData}/>
                    </div>
                )}
            </section>}
        </div>
    );
};

export default RealTime;
