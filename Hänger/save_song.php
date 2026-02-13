<?php
$file = 'songs.json';

// Bestehende Songs abrufen
$songs = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

// Neue Daten aus dem POST-Request lesen
$inputData = json_decode(file_get_contents("php://input"), true);
$songs[] = $inputData;

// Aktualisierte Liste speichern
file_put_contents($file, json_encode($songs, JSON_PRETTY_PRINT));

echo "✅ Song erfolgreich gespeichert!";
?>