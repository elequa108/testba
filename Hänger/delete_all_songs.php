<?php
$file = 'songs.json';

// Leere die Datei
file_put_contents($file, json_encode([]));

echo "✅ Alle Songs gelöscht!";
?>
