<?php
$position_count = $overall = 0;
$departments = json_decode(file_get_contents('data/departments.json'));
$highest = FALSE;
foreach($departments as $filename => $department) {
	print "Processing $department \n";
	$department = json_decode(file_get_contents('data/2012/'. $filename .'.json'));
	foreach($department as $position) {
		$overall += $position->total_pay;
		$position_count++;
		if(!$highest || $highest->total_pay < $position->total_pay) {
			$highest = $position;
		}
		elseif(!$highest || $highest->total_pay < $position->total_pay) {
			$highest = $position;
		}
	}
}

$result = array('overall' => $overall,
								'positions' => $position_count,
								'highest_paid' => $highest
								);

$file = fopen('data/totals.json', 'w');
fwrite($file, json_encode($result, JSON_PRETTY_PRINT));
fclose($file);