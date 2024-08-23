import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { EmotionsTable } from "../EmotionsTable";
import { EmotionsBarChart } from "../EmotionsBarChart";
import { EmotionsPieChart } from "../EmotionsPieChart";

const FaceExpressionDetection: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // Canvas ref can be null
    const [expressionsData, setExpressionsData] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models')
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

                        setExpressionsData(prevData => [...prevData, detections]);

                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            faceapi.draw.drawDetections(canvas, detections);
                            faceapi.draw.drawFaceExpressions(canvas, detections);
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
        <div className="p-4 container mx-auto mb-8">
            <header className="mb-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Face Expression Detection</h1>
                <p className="text-gray-600">Upload a video to analyze its expressions.</p>
            </header>

            <input
                type="file"
                accept="video/*"
                disabled={isAnalyzing || !isModelsLoaded}
                onChange={handleVideoUpload}
                className="mb-4 mr-2"
            />
            {videoFile && (
                <>
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !isModelsLoaded}
                        className="mb-4 bg-blue-500 text-white p-2"
                    >
                        {isAnalyzing ? "Analyzing..." : "Analyze Video"}
                    </button>
                    <div style={{ position: 'relative' }}>
                        <video ref={videoRef} controls className="w-full max-w-fit">
                            <source src={URL.createObjectURL(videoFile)} />
                        </video>
                        <canvas ref={canvasRef} className="w-full max-w-fit" style={{ position: 'absolute', top: 0, left: 0 }} />
                    </div>

                </>
            )}
            {expressionsData.length > 0 && (
                <div className="mt-8">
                    <EmotionsTable expressionsData={expressionsData} />
                    <EmotionsBarChart expressionsData={expressionsData} />
                    <EmotionsPieChart expressionsData={expressionsData} />
                </div>
            )}
        </div>
    );
};

export default FaceExpressionDetection;
