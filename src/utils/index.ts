

export const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('VideoSlidesDB', 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('videos')) {
                db.createObjectStore('videos', { keyPath: 'slideIndex' });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const getVideoFromDB = (db: IDBDatabase | null, slideIndex: number): Promise<Blob | null> => {
    if (!db) {
        return Promise.resolve(null);
    }
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('videos', 'readonly');
        const store = transaction.objectStore('videos');
        const request = store.get(slideIndex);

        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result.videoData);
            } else {
                resolve(null);
            }
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const saveVideoToDB = async (db: IDBDatabase, blob: Blob, slideIndex: number) => {
    const transaction = db.transaction('videos', 'readwrite');
    const store = transaction.objectStore('videos');
    store.put({ slideIndex, videoData: blob });

    transaction.oncomplete = () => {
        console.log(`Video for slide ${slideIndex} saved.`);
    };

    transaction.onerror = (event) => {
        console.error("Error saving video:", event);
    };
};

// Функция для удаления всех видео из IndexedDB
export const deleteAllVideos = async (db: IDBDatabase) => {
    const transaction = db.transaction('videos', 'readwrite');
    const store = transaction.objectStore('videos');

    const request = store.clear(); // Очищает все записи в хранилище

    request.onsuccess = () => {
        console.log("All videos deleted successfully.");
    };

    request.onerror = (event) => {
        console.error("Error deleting videos:", event);
    };
};
