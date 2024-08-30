import React, {useEffect, useRef} from "react";
import {ISlide} from "../../constants";


const Video: React.FC<{
    index: number
    currentIndex: number
    slide: ISlide
}> = ({
        index,
        currentIndex,
        slide
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (index === currentIndex) {
            videoRef.current?.play();
        }
        if (index !== currentIndex) {
            videoRef.current?.pause();
        }
    }, [index, currentIndex]);

    return (
        <video
            ref={videoRef}
            controls
            key={index}
            className={`h-full max-w-screen inset-0 transition-transform duration-1000 ${
                index === currentIndex
                    ? 'transform translate-y-0'
                    : 'transform -translate-y-full'
            }`}
            src={slide.src}
        ></video>
    )
}

export default Video