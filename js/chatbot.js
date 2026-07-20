// js/chatbot.js

class Chatbot {
    constructor() {
    this.keywords = [];
    this.responses = {};
    this.buttons = {};
    this.isLoaded = false;
    this.activeContext = null;
}

    async init() {
    try {

        const [
            keywordsRes,
            responsesRes,
            buttonsRes
        ] = await Promise.all([
            fetch("data/keywords.json"),        
            fetch("data/responses.json"),
            fetch("data/buttons.json")
        ]);

        this.keywords = await keywordsRes.json();
        this.responses = await responsesRes.json();
        this.buttons = await buttonsRes.json();

        this.isLoaded = true;

        console.log("AllBot Database Loaded");

    } catch (error) {

        console.error(error);

    }
}

// Fungsi menentukan tombol menu berdasarkan alur kategori
getAvailableButtons(categoryId) {

    if (!this.buttons) return [];

    return this.buttons[categoryId] || [];

}

} // <-- PENUTUP CLASS

window.Chatbot = Chatbot;
