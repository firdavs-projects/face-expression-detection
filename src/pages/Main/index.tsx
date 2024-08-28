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

            {!isStarted ? (
                <img className='mx-auto w-[50%]' src='/logo.png' alt='logo'/>
            ) : (
                <img className='fixed top-8 left-8 w-[250px] bg-white/50 rounded-3xl' src='/logo.png' alt='logo'/>
            )}

            <header className="text-center fixed bottom-0 left-0 right-0 flex justify-between items-center gap-3">
                {isStarted
                    ? (<div className='w-full h-full justify-end flex gap-4 p-8 transform translate-x-[55vw] hover:translate-x-0 inset-0 transition-transform duration-1000'>
                           <Link to='/emotion'><Button>Посмотреть список анализов</Button></Link>
                           <Button onClick={() => setIsAnalyzeShowed(!isAnalyzeShowed)}>
                                {isAnalyzeShowed ? 'Скрыть анализ' : 'Реалтайм анализ'}
                           </Button>
                       </div>
                    )
                    : (<Button className='mx-auto m-8' onClick={() => setIsStarted(true)}>Начать просмотр слайдов</Button>)}
            </header>
        </div>
    );
}