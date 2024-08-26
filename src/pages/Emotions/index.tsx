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
            <h1 className="text-2xl font-bold p-2 mb-5">Список слайдов</h1>

            <ul className='flex flex-col gap-3 w-full mb-[120px]'>
                {SLIDES.map((slide, idx) => (
                    <Link key={slide} to={`/emotion/${idx}`}>
                        <li className='p-3 border border-gray-200'>Слайд {idx+1}</li>
                    </Link>
                ))}
            </ul>

            <header className='fixed bottom-0 left-0 right-0 bg-white flex justify-center items-center gap-3 p-3'>
                <Link to='/'><Button>На главную</Button></Link>
                <Link to='/realtime'><Button>Прямой анализ</Button></Link>
                <Button onClick={handleRemoveDb}>Очистить все анализы</Button>
            </header>

        </div>
    )
}