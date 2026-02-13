// Song-Wunsch senden (Daten an PHP senden)
function sendSongRequest() {
    const username = document.getElementById("username").value;
    const songTitle = document.getElementById("songTitle").value;
    const artist = document.getElementById("artist").value;

    if (!username || !songTitle || !artist) {
        alert("Bitte fülle alle Felder aus!");
        return;
    }

    const newSong = {
        id: Date.now(),
        title: songTitle,
        artist: artist,
        user: username,
        status: "Wartend",
        timestamp: new Date().toLocaleString(),
    };

    // Daten an PHP senden
    fetch("save_song.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSong),
    })
    .then(response => response.text())
    .then(data => {
        console.log("✅ Server-Antwort:", data);
        updateSongList(); // Aktualisiere die Liste nach erfolgreicher Speicherung
    })
    .catch(error => console.error("❌ Fehler beim Speichern:", error));

    // Felder leeren nach Absenden
    document.getElementById("username").value = "";
    document.getElementById("songTitle").value = "";
    document.getElementById("artist").value = "";
}

// Song-Wunschliste abrufen (Daten von PHP-Server laden)
function updateSongList() {
    const songListDiv = document.getElementById("songList");
    if (!songListDiv) return;

    fetch("get_songs.php")
    .then(response => response.json())
    .then(songRequests => {
        songListDiv.innerHTML = "";

        songRequests.forEach(song => {
            const songDiv = document.createElement("div");
            songDiv.classList.add("song");

            songDiv.innerHTML = `
                <div>
                    <p><strong>${song.title} - ${song.artist}</strong></p>
                    <p class="status ${getStatusClass(song.status)}">${song.status}</p>
                    <p class="user">Von: ${song.user}</p>
                    <p class="timestamp">📅 Angefragt am: ${song.timestamp}</p>
                </div>
            `;

            songListDiv.appendChild(songDiv);
        });
    })
    .catch(error => console.error("❌ Fehler beim Laden der Songs:", error));
}

// Status-Klassen für Farben
function getStatusClass(status) {
    if (status.startsWith("Abgelehnt")) return "status-abgelehnt";
    if (status === "Angenommen") return "status-angenommen";
    return "status-wartend";
}

// Lade gespeicherte Songs beim Start
document.addEventListener("DOMContentLoaded", updateSongList);
