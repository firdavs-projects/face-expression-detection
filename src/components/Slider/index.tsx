import React, { useState, useEffect, useRef } from 'react';
import { saveVideoToDB } from "../../utils";
import { useDb } from "../../hooks/useDb.ts";

interface SliderProps {
    images: string[];
}

const Slider: React.FC<SliderProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    let videoChunks: Blob[] = [];
    const db = useDb();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current!.srcObject = stream;
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
                    if (db) {
                        saveVideoToDB(db, blob, currentIndex);
                    }
                } else {
                    console.warn('No video data to save');
                }

                videoChunks = []; // Очищаем локальную переменную
            };

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
            switchSlide(currentIndex === images.length - 1 ? currentIndex : currentIndex + 1);
        } else if (event.key === 'PageUp' || event.key === 'ArrowUp') {
            switchSlide(currentIndex === 0 ? currentIndex : currentIndex - 1);
        }
    };

    const switchSlide = (newIndex: number) => {
        stopRecording();
        setCurrentIndex(newIndex);
    };

    useEffect(() => {
        startRecording();
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            stopRecording();
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [currentIndex, db]);

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
            stopRecording();
        } else if (document.visibilityState === 'visible') {
            startRecording();
        }
    };

    const handleBeforeUnload = (_: BeforeUnloadEvent) => {
        stopRecording();
        // You might want to show a warning message before unload
        // event.preventDefault();
        // event.returnValue = '';
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-transform duration-1000 ${
                        index === currentIndex
                            ? 'transform translate-y-0'
                            : 'transform -translate-y-full'
                    }`}
                    style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover' }}
                />
            ))}
            <video ref={videoRef} className="hidden" autoPlay muted></video>
        </div>
    );
};

export default Slider;
