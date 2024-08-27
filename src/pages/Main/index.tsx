import Slider from "../../components/Slider";
import {Button} from "../../components/Button";
import {Link} from "react-router-dom";
import {SLIDES} from "../../constants";
import {useState} from "react";


export default function Main() {
    const [isStarted, setIsStarted] = useState(false);
    const [isAnalyzeShowed, setIsAnalyzeShowed] = useState(false);

    return (
        <div className="container-xl relative my-auto mx-auto flex flex-col items-center justify-center h-screen">

            {isStarted?
                <>
                    {/*<section*/}
                    {/*    className={`absolute inset-0 transition-transform duration-1000 top-0 left-0 right-0 bottom-0 ${*/}
                    {/*        !isAnalyzeShowed*/}
                    {/*            ? 'transform translate-x-0'*/}
                    {/*            : 'transform -translate-x-full'*/}
                    {/*    }`}*/}
                    {/*>*/}
                        <Slider slides={SLIDES} showAnalyzer={isAnalyzeShowed} />
                    {/*</section>*/}

                    {/*<section*/}
                    {/*    className={`absolute inset-0 transition-transform duration-1000 top-0 left-0 right-0 bottom-0 ${*/}
                    {/*        isAnalyzeShowed*/}
                    {/*            ? 'transform translate-x-0'*/}
                    {/*            : 'transform translate-x-full'*/}
                    {/*    }`}*/}
                    {/*>*/}
                    {/*</section>*/}
                </>
                : null}



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