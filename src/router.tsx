import {createBrowserRouter} from "react-router-dom";
import FaceExpressionDetection from "./pages/Emotion";
import Main from "./pages/Main";
import Emotions from "./pages/Emotions";


export const router = () =>
    createBrowserRouter([
        {
            path: '/emotion/:slideId',
            element: (
                <FaceExpressionDetection />
            ),
        },
        {
            path: '/emotion',
            element: (
                <Emotions />
            ),
        },
        {
            path: '/',
            element: (
                <Main />
            ),
        },
    ])