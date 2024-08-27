import Slider from "../../components/Slider";
import {Button} from "../../components/Button";
import {Link} from "react-router-dom";
import {SLIDES} from "../../constants";
import {useEffect, useState} from "react";


export default function Main() {
    const [isStarted, setIsStarted] = useState(false);
    const [isAnalyzeShowed, setIsAnalyzeShowed] = useState(false);

    // const handleKeyDown = (e: KeyboardEvent) => {
    //     if (e.key === 'ArrowRight' && isStarted) {
    //         e.preventDefault();
    //         setIsAnalyzeShowed(true);
    //     }
    //     if (e.key === 'ArrowLeft' && isStarted) {
    //         e.preventDefault();
    //         setIsAnalyzeShowed(false);
    //     }
    // } // Not working because of video controls

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: { width: 0 } })

        // window.addEventListener('keydown', handleKeyDown);
        // return () => {
        //     window.removeEventListener('keydown', handleKeyDown);
        // };
    }, []);

    return (
        <div className="container-xl relative my-auto mx-auto flex flex-col items-center justify-center h-screen w-screen overflow-x-hidden">

            {isStarted ? <Slider slides={SLIDES} showAnalyzer={isAnalyzeShowed} /> : null}

            {!isStarted && (
                <img className='mx-auto w-[50%]' src='/logo.png' alt='logo'/>
            )}

            <header className="text-center mx-auto container fixed bottom-0 left-0 right-0 flex items-center gap-5 p-8">
                {isStarted
                    ? (<>
                            <img className='w-[300px] bg-white/50 rounded-3xl' src='/logo.png' alt='logo'/>
                            <div className='ml-auto flex gap-4'>
                                <Link to='/emotion'><Button>Посмотреть список анализов</Button></Link>
                                <Button onClick={() => setIsAnalyzeShowed(!isAnalyzeShowed)}>
                                    {isAnalyzeShowed ? 'Скрыть анализ' : 'Реалтайм анализ'}
                                </Button>
                            </div>
                        </>
                    )
                    : (<Button className='mx-auto' onClick={() => setIsStarted(true)}>Начать просмотр слайдов</Button>)}
            </header>
        </div>
    );
}