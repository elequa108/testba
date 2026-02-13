const PASSWORD = "hänger123"; // Optional: Stattdessen Passwort über PHP abfragen

// Passwortüberprüfung für Crew-Bereich
function checkPassword() {
    const input = document.getElementById("password").value.trim();
    if (input === PASSWORD) {
        document.getElementById("passwordPrompt").style.display = "none";
        document.getElementById("crewContent").style.display = "block";
        loadCrewSongs(); // Lade Songs nach erfolgreichem Login
    } else {
        alert("❌ Falsches Passwort!");
    }
}

// Zurück zur Startseite navigieren
function goBack() {
    window.location.href = "index.html"; // Falls der Name anders ist, anpassen
}

// Alle Songs laden (vom Server `get_songs.php`)
function loadCrewSongs() {
    const crewSongList = document.getElementById("crewSongList");
    if (!crewSongList) return;

    crewSongList.innerHTML = "<p>⏳ Lade Songs...</p>";

    fetch("get_songs.php")
    .then(response => response.json())
    .then(songRequests => {
        crewSongList.innerHTML = "";

        if (songRequests.length === 0) {
            crewSongList.innerHTML = "<p>📭 Keine Songwünsche vorhanden.</p>";
            return;
        }

        songRequests.forEach(song => {
            const songDiv = document.createElement("div");
            songDiv.classList.add("crew-song");

            // Titel und Künstler sicherstellen, um `undefined` zu vermeiden
            const title = song.title || "Unbekannter Titel";
            const artist = song.artist || "Unbekannter Künstler";
            const safeTitle = title.replace(/"/g, '&quot;');
            const safeArtist = artist.replace(/"/g, '&quot;');

            songDiv.innerHTML = `
                <div>
                    <p><strong>${safeTitle}</strong></p>
                    <p>${safeArtist}</p>
                    <p class="user">Name: ${song.user}</p>
                    <p class="timestamp">⏰ ${song.timestamp}</p>
                    <p class="status ${getStatusClass(song.status)}">${song.status}</p>
                </div>
                <button class="crew-accept" onclick='acceptSong(${song.id}, ${JSON.stringify(title)}, ${JSON.stringify(artist)})' title="In Spotify suchen">✔</button>
                <button class="crew-reject" onclick="rejectSong(${song.id})">✖</button>
                <button class="crew-delete" onclick="deleteSong(${song.id})">🗑️</button>
            `;

            crewSongList.appendChild(songDiv);
        });
    })
    .catch(error => {
        crewSongList.innerHTML = "<p>❌ Fehler beim Laden der Songs.</p>";
        console.error("❌ Fehler beim Laden der Songs:", error);
    });
}


// Spotify-Suchlink erstellen (Titel + Artist kombinieren und URL-encoden)
function buildSpotifySearchUrl(title, artist) {
    const searchTerm = `${title} ${artist}`.trim();
    const encodedSearch = encodeURIComponent(searchTerm);
    return `https://open.spotify.com/search/${encodedSearch}`;
}

// Spotify-Suche in neuem Tab öffnen
function openSpotifySearch(title, artist) {
    const spotifyUrl = buildSpotifySearchUrl(title, artist);
    window.open(spotifyUrl, "_blank", "noopener,noreferrer");
}

// Song akzeptieren (Status auf "Angenommen" setzen & in Zwischenablage kopieren)
function acceptSong(songId, title, artist) {
    if (!songId || !title || !artist) {
        alert("❌ Fehler: Song-Daten fehlen!");
        return;
    }

    // Kopieren des Songtitels in die Zwischenablage
    let tempInput = document.createElement("textarea");
    tempInput.value = `${title} - ${artist}`;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    showCopyNotification(`✅ "${title} - ${artist}" wurde in die Zwischenablage kopiert!`);

    // Beim Klick auf das Häkchen zusätzlich Spotify-Suche öffnen
    openSpotifySearch(title, artist);

    fetch("update_song.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: songId, status: "Angenommen" }),
    })
    .then(response => response.text())
    .then(response => {
        if (response.includes("✅")) {
            loadCrewSongs();
            updateSongList(); // Auch auf der Startseite aktualisieren
        } else {
            alert("❌ Fehler beim Akzeptieren des Songs.");
        }
    })
    .catch(error => console.error("❌ Fehler beim Aktualisieren des Songs:", error));
}

// Song ablehnen mit Grund
function rejectSong(songId) {
    if (!songId) return;

    let reason = prompt("Bitte gib einen Grund für die Ablehnung ein:");
    if (!reason) return;

    fetch("update_song.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: songId, status: `Abgelehnt: ${reason}` }),
    })
    .then(response => response.text())
    .then(response => {
        if (response.includes("✅")) {
            loadCrewSongs();
            updateSongList();
        } else {
            alert("❌ Fehler beim Ablehnen des Songs.");
        }
    })
    .catch(error => console.error("❌ Fehler beim Aktualisieren des Songs:", error));
}

// Song löschen
function deleteSong(songId) {
    if (!songId || !confirm("⚠️ Willst du diesen Song wirklich löschen?")) return;

    fetch("delete_song.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: songId }),
    })
    .then(response => response.text())
    .then(response => {
        if (response.includes("✅")) {
            loadCrewSongs();
            updateSongList();
        } else {
            alert("❌ Fehler beim Löschen des Songs.");
        }
    })
    .catch(error => console.error("❌ Fehler beim Löschen des Songs:", error));
}

// Alle Songs löschen
function deleteAllSongs() {
    if (!confirm("⚠️ Willst du wirklich ALLE Songs löschen?")) return;

    fetch("delete_all_songs.php", { method: "POST" })
    .then(response => response.text())
    .then(response => {
        if (response.includes("✅")) {
            loadCrewSongs();
            updateSongList();
        } else {
            alert("❌ Fehler beim Löschen aller Songs.");
        }
    })
    .catch(error => console.error("❌ Fehler beim Löschen der Songs:", error));
}

// Status-Klassen für Farben
function getStatusClass(status) {
    if (status.startsWith("Abgelehnt")) return "status-abgelehnt";
    if (status === "Angenommen") return "status-angenommen";
    return "status-wartend";
}

// Copy-Benachrichtigung anzeigen
function showCopyNotification(text) {
    let notification = document.createElement("div");
    notification.className = "copy-notification";
    notification.innerText = `✅ Kopiert: ${text}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000); // Nach 2 Sekunden entfernen
}

// Crew-Seite beim Laden aktualisieren
document.addEventListener("DOMContentLoaded", loadCrewSongs);
