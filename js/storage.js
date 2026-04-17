const STORAGE_KEY = 'organikhoda_db';

function getDB() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveDB(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}