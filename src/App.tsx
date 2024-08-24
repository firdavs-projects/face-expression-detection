import {router} from "./router.tsx";
import {RouterProvider} from "react-router-dom";

function App() {
    const appRouter = router()

    return <RouterProvider router={appRouter} />
}

export default App;
