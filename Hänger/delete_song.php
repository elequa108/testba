<?php
$file = 'songs.json';

// Prüfen, ob die Datei existiert
if (!file_exists($file)) {
    echo "❌ Datei nicht gefunden!";
    exit;
}

// Daten laden
$songs = json_decode(file_get_contents($file), true);

// ID des Songs aus dem Request lesen
$inputData = json_decode(file_get_contents("php://input"), true);
$songId = $inputData['id'];

// Songs filtern, um den gewählten Song zu entfernen
$songs = array_filter($songs, function($song) use ($songId) {
    return $song['id'] != $songId;
});

// Änderungen speichern
file_put_contents($file, json_encode(array_values($songs), JSON_PRETTY_PRINT));

echo "✅ Song gelöscht!";
?>
