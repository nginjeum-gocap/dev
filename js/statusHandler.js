/**
 * AllBot - Status & Idle Timeout Handler (js/statusHandler.js)
 * Memantau aktivitas chat dan mengubah status menjadi offline jika benar-benar tidak ada pergerakan.
 */

class BotStatusHandler {
    constructor(idleTimeInMs = 30000) { // Waktu tunggu default (30 detik)
        this.idleTimeout = idleTimeInMs;
        this.timer = null;
        this.isBotWorking = false; // Flag pengunci: true jika bot sedang mengetik/proses
        
        // Selektor element berdasarkan CSS kamu
        this.statusElement = document.querySelector(".status");
        this.avatarElement = document.querySelector(".bot-avatar");
    }

    /**
     * Memulai pemantauan status
     */
    init() {
        this.resetTimer();
    }

    /**
     * Mengunci status agar tidak bisa offline (dipanggil saat bot mulai merespons)
     */
    lockAsWorking() {
        this.isBotWorking = true;
        this.setOnline();
        clearTimeout(this.timer); // Hentikan hitung mundur selama bekerja
    }

    /**
     * Membuka kunci status dan mulai hitung mundur idle dari nol lagi
     * (dipanggil SETIAP KALI bot selesai memunculkan sebuah bubble chat)
     */
    unlockAndReset() {
        this.isBotWorking = false;
        this.resetTimer();
    }

    /**
     * Menyetel ulang timer hitung mundur idle
     */
    resetTimer() {
        // Jika bot sedang sibuk ngetik, abaikan perintah reset/start timer idle
        if (this.isBotWorking) return;

        this.setOnline();
        clearTimeout(this.timer);

        this.timer = setTimeout(() => {
            this.setOffline();
        }, this.idleTimeout);
    }

    /**
     * Mengubah status visual menjadi Online
     */
    setOnline() {
        if (this.statusElement) {
            this.statusElement.classList.remove("offline");
            this.statusElement.classList.add("online");
            this.statusElement.textContent = "Online";
        }
    }

    /**
     * Mengubah status visual menjadi Offline
     */
    setOffline() {
        // Keamanan ekstra: Jika tiba-tiba fungsi terpanggil saat bot bekerja, batalkan
        if (this.isBotWorking) return;

        if (this.statusElement) {
            this.statusElement.classList.remove("online");
            this.statusElement.classList.add("offline");
            this.statusElement.textContent = "Offline";
        }
        console.log("Bot berubah menjadi offline karena tidak ada pergerakan chat.");
    }
}

// Inisialisasi secara global dengan waktu tunggu 30 detik (bisa kamu sesuaikan sendiri)
window.botStatusHandler = new BotStatusHandler(8000);
