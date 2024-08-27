import {SLIDES} from "../../constants";
import {Link, useNavigate} from "react-router-dom";
import {Button} from "../../components/Button";
import {useDb} from "../../hooks/useDb.ts";
import {deleteAllVideos} from "../../utils";


export default function Emotions() {
    const db = useDb();
    const navigate = useNavigate();

    const handleRemoveDb = () => {
        if (db) {
            deleteAllVideos(db).then(
                () => navigate('/')
            )
        }
    }

    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl w-full font-bold py-9">Список слайдов</h1>

            <ul className='grid grid-cols-2 gap-3 w-full mb-[120px]'>
                {SLIDES.map((slide, idx) => (
                    <Link className='p-3 flex gap-3 rounded-2xl bg-[#E3F5FF]' key={slide.src} to={`/emotion/${idx}`}>
                        {slide.type === 'image'
                            ? <img className='w-[100px] aspect-square object-cover rounded-xl' src={slide.src} alt='slide'/>
                            : <video className='w-[100px] aspect-square object-cover rounded-xl' src={slide.src} autoPlay muted loop />}
                        <li className='font-bold'>Слайд {idx+1}</li>
                    </Link>
                ))}
            </ul>

            <header className='fixed bottom-0 left-0 right-0 flex justify-center items-center gap-3 p-3'>
                <img className='w-[250px] bg-white/50 rounded-3xl' src='/logo.png' alt='logo'/>
                <Link className='w-full' to='/'><Button className='w-full'>На главную</Button></Link>
                <Link className='w-full' to='/realtime'><Button className='w-full'>Прямой анализ</Button></Link>
                <Button className='w-full' onClick={handleRemoveDb}>Очистить все анализы</Button>
            </header>

        </div>
    )
}