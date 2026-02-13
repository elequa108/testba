<?php
$file = 'songs.json';

// Prüfen, ob die Datei existiert
if (!file_exists($file)) {
    echo "❌ Datei nicht gefunden!";
    exit;
}

// Daten laden und JSON dekodieren
$songs = json_decode(file_get_contents($file), true);

// Neue Statusdaten aus dem Request holen
$inputData = json_decode(file_get_contents("php://input"), true);
$songId = $inputData['id'];
$newStatus = $inputData['status'];

// Song-Status aktualisieren
foreach ($songs as &$song) {
    if ($song['id'] == $songId) {
        $song['status'] = $newStatus;
        break;
    }
}

// Änderungen in die Datei speichern
file_put_contents($file, json_encode($songs, JSON_PRETTY_PRINT));

echo "✅ Status aktualisiert!";
?>
