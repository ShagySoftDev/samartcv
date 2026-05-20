<?php
if($_SERVER['REQUEST_METHOD'] == 'POST'){

    $power = $_POST['power'];
    $quantity = $_POST['quantity'];
    $hours = $_POST['hours'];

    $totalEnergy = $power * $quantity * $hours;

    $panelSize = $totalEnergy / 5;

    $batteryCapacity = $totalEnergy / (12 * 0.8);

    $inverterSize = $power * $quantity * 1.25;

    $estimatedCost = ($panelSize * 450) + ($batteryCapacity * 300) + ($inverterSize * 200);

    echo json_encode([
        'energy' => $totalEnergy,
        'panel' => $panelSize,
        'battery' => $batteryCapacity,
        'inverter' => $inverterSize,
        'cost' => $estimatedCost
    ]);
}
?>
