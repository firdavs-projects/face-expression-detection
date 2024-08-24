import Slider from "../../components/Slider";
import {Button} from "../../components/Button";
import {Link} from "react-router-dom";
import {SLIDES} from "../../constants";
import {useState} from "react";


export default function Main() {
    const [isStarted, setIsStarted] = useState(false);

    return (
        <div className="container-xl mx-auto flex flex-col items-center justify-center h-screen">
            <header className="text-center flex items-center gap-5 p-2">
                {isStarted
                    ? (<Link to='/emotion'><Button>Посмотреть анализы</Button></Link>)
                    : (<Button className='mx-auto' onClick={() => setIsStarted(true)}>Начать просмотр слайдов</Button>)}
                {/*<h1 className="text-2xl font-bold">Слайды</h1>*/}
            </header>
            {isStarted
                ? <Slider images={SLIDES} />
                : null}
        </div>
    );
}