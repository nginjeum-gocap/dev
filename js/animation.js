// js/animation.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Membuat elemen Canvas secara dinamis dan memasukkannya ke body
    const canvas = document.createElement("canvas");
    canvas.id = "matrixCanvas";
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext("2d");

    // 2. Mengatur ukuran canvas agar memenuhi layar penuh
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 3. Karakter yang akan muncul di animasi (Huruf & Angka Digital)
    const katakana = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789カタカナ";
    const alphabet = katakana.split("");

    const fontSize = 16;
    // Menghitung berapa banyak kolom yang muat di layar
    const columns = canvas.width / fontSize;

    // Array untuk melacak posisi Y saat ini dari setiap kolom
    const rainDrops = [];
    for (let x = 0; x < columns; x++) {
        // Mengisi posisi awal secara acak di atas layar agar tidak jatuh bebarengan
        rainDrops[x] = Math.random() * -100; 
    }

    // 4. Fungsi utama untuk menggambar animasi
    function draw() {
        // Memberikan efek semi-transparan hitam agar jejak huruf sebelumnya memudar perlahan
        ctx.fillStyle = "rgba(26, 26, 26, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Mengatur warna dan font huruf teks Matrix
        ctx.fillStyle = "#00ff88"; // Warna hijau neon (sama dengan status online bot)
        ctx.font = fontSize + "px monospace";

        // Looping untuk menggambar karakter di setiap kolom
        for (let i = 0; i < rainDrops.length; i++) {
            // Memilih karakter acak dari array
            const text = alphabet[Math.floor(Math.random() * alphabet.length)];
            
            // Menggambar karakter di posisi X dan Y yang ditentukan
            const x = i * fontSize;
            const y = rainDrops[i] * fontSize;

            ctx.fillText(text, x, y);

            // Jika hujan kode sudah melewati batas bawah layar, kembalikan ke atas secara acak
            if (y > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }

            // Menggerakkan tetesan kode ke bawah
            rainDrops[i]++;
        }
    }

    // Menjalankan fungsi draw secara terus menerus setiap 30 milidetik
    setInterval(draw, 30);
});
