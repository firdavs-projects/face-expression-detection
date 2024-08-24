import {useEffect, useState} from "react";
import {openDatabase} from "../utils";


export const useDb = () => {
    const [db, setDb] = useState<IDBDatabase | null>(null);

    useEffect(() => {
        openDatabase().then(setDb).catch(console.error);
    }, []);

    return db
}