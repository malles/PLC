<?php
session_start();

$shiftLengte = 8 * 60;
$tactTijd = 120;
$shelfTarget = 240;
$now = new DateTime('now',new DateTimeZone('Europe/Amsterdam'));

if (!empty($_SESSION)) {
	$state = $_SESSION['testState'];
} else {
	$state = array(
		'counter'=>0,
		'now'=>$now->format('d-m-Y H:i:s'),
		'andon'=>'',
		'tact'=>$tactTijd,
		'tactTijd'=>$tactTijd,
		'shift'=>0,
		'shiftLengte'=>$shiftLengte,
		'tactMarge'=>20,
		'shelf'=>0,
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
if ($state['tact'] < rand(-40,5)) $state['tact'] = $state['tactTijd'];

//shifttijd tellen tbv test
$state['shiftLengte'] = isset($_GET['shiftLengte']) && (int)$_GET['shiftLengte'] > 0 ? (int)$_GET['shiftLengte'] : $state['shiftLengte'];
if ($state['counter']%60 == 0) {
	$state['shift']++;
}
if (!empty($_GET['shiftReset'])) {
	$state['shift'] = 0;
}
if ($state['shift'] > $state['shiftLengte']) $state['shift'] = 0;

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

//foutmelding
if ($state['counter']%45 == 0 && !$state['andon']) {
	$state['andon'] = 'Een hele erge foutmelding!';
	$_SESSION['andonStart'] = $state['counter'];
}
if ($state['andon']) {
	if ($state['counter'] > $_SESSION['andonStart'] + 15) {
		$state['andon'] = '';
	}
}

$state['now'] = $now->format('d-m-Y H:i:s');
$state['counter']++;

$_SESSION['testState'] = $state;

header('Content-Type: application/json');
?>
{"tags": <?php echo json_encode($state); ?>}

