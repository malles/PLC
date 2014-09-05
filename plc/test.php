<?php
session_start();

$shiftLengte = 4 * 60;
$tactTijd = 120;
$shelfTarget = 240;

if (!empty($_SESSION)) {
	$state = $_SESSION['testState'];
} else {
	$state = array(
		'counter'=>0,
		'tact'=>$tactTijd,
		'tactTijd'=>$tactTijd,
		'shift'=>0,
		'shiftLengte'=>$shiftLengte,
		'tactMarge'=>20,
		'shelf'=>$shelfTarget,
		'shelfTarget'=>$shelfTarget,
		'shelfMarge'=>5
	);
}
//counter tijd
$state['tactTijd'] = isset($_GET['tactTijd']) && (int)$_GET['tactTijd'] > 0 ? (int)$_GET['tactTijd'] : $state['tactTijd'];
$state['tactMarge'] = isset($_GET['tactMarge']) && (int)$_GET['tactMarge'] > 0 ? (int)$_GET['tactMarge'] : $state['tactMarge'];
if (!empty($_GET['tactReset'])) {
	$state['tact'] = $state['tactTijd'];
} else {
	$state['tact']--;
}
if ($state['tact'] < -50) $state['tact'] = $tactTijd;

//shifttijd tellen tbv test
$state['shiftLengte'] = isset($_GET['shiftLengte']) && (int)$_GET['shiftLengte'] > 0 ? (int)$_GET['shiftLengte'] : $state['shiftLengte'];
if ($state['counter']%20 == 0) {
	if (!empty($_GET['shiftReset'])) {
		$state['shift'] = 0;
	} else {
		$state['shift']++;
	}
}
if ($state['shift'] > $shiftLengte) $state['shift'] = 0;

//productiviteit
$state['shelfMarge'] = isset($_GET['shelfMarge']) && (int)$_GET['shelfMarge'] > 0 ? (int)$_GET['shelfMarge'] : $state['shelfMarge'];
$state['shelfTarget'] = isset($_GET['shelfTarget']) && (int)$_GET['shelfTarget'] > 0 ? (int)$_GET['shelfTarget'] : $state['shelfTarget'];
//aantal reeds geproduceerd volgens target. verlopen aantal min * stuks per minuut nodig
$producedTarget = $state['shift'] * ($state['shelfTarget'] / $state['shiftLengte']);
//random getal binnen 2*marges
if ($state['counter']%5 == 0) {
	$state['shelf'] = rand(($producedTarget - ( 2 * $state['shelfMarge'])), ($producedTarget + ( 2 * $state['shelfMarge'])));
	if ($state['shelf'] < 0) $state['shelf'] = 0;
}

$state['counter']++;

$_SESSION['testState'] = $state;
?>
{
	"tags": <?php echo json_encode($state); ?>
}
	
