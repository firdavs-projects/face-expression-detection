import React, { useState, useEffect, useRef } from 'react';
import { saveVideoToDB } from "../../utils";
import { useDb } from "../../hooks/useDb.ts";
import * as faceapi from "face-api.js";
import {ISlide} from "../../constants";
import Video from "../Video";

interface SliderProps {
    slides: ISlide[];
}

const Slider: React.FC<SliderProps> = ({ slides }) => {
    const [modelsLoaded, setModelsLoaded] = React.useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

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
            stopRecording();
            setCurrentIndex(currentIndex => currentIndex === slides.length - 1 ? currentIndex : currentIndex + 1);
        } else if (event.key === 'PageUp' || event.key === 'ArrowUp') {
            stopRecording();
            setCurrentIndex(currentIndex => currentIndex === 0 ? currentIndex : currentIndex - 1);
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
            if (videoRef.current && modelsLoaded) {
                const detections = await faceapi
                    .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceExpressions();

                expressionsData.push([detections]);
            }
        }, 250);
    };

    return (
        <div className="relative h-screen w-screen overflow-y-scroll flex flex-col items-center justify-center">
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
                                    style={{ backgroundImage: `url(${slide.src})`, backgroundSize: 'cover' }}
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

            <video ref={videoRef} onPlay={handleVideoOnPlay} className="hidden" autoPlay muted></video>
        </div>
    );
};

export default Slider;