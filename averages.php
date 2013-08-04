<?php

$departments = json_decode(file_get_contents('departments.json'));
$years = json_decode(file_get_contents('years.json'));
foreach($years as $year) {
	$averages = array();
	foreach($departments as $filename => $department) {
		print "Processing $year $department \n";
		$department = json_decode(file_get_contents('data/'. $year .'/'. $filename .'.json'));
		foreach($department as $position) {
			$averages[$position->job_title][] = $position->total_pay;
		}
	}
	$final = array();
	foreach($averages as $title => $salaries) {
		rsort($salaries);
		$middle = round(count($salaries) / 2);
		$final[$title] = array('mean' => (array_sum($salaries) / count($salaries)),
													 'median' => $salaries[$middle-1],
													 'min' => min($salaries),
													 'max' => max($salaries),
													 'total' => count($salaries)
													 );
	}
	$file = fopen('data/'. $year .'/_average_salaries.json', 'w');
				fwrite($file, json_encode($final, JSON_PRETTY_PRINT));
				fclose($file);
}