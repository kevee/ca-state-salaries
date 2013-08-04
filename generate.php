<?php

$departments = json_decode(file_get_contents('departments.json'));
$years = json_decode(file_get_contents('years.json'));
foreach($years as $year) {
	foreach($departments as $filename => $department) {
		$results = array();
		print 'Checking '. $department . ' year '. $year . "\n";
		$url = 'http://www.sacbee.com/cgi-bin/php/statepay2/query.php?department=' . urlencode($department). '&year=' . $year;
		$value = json_decode(file_get_contents($url));
		if($value) {
			$cols = $value->cols;
			foreach($cols as $k => $col) {
				if($col->id == 'id') {
					$id_col = $k;
				}
			}
			foreach($value->rows as $row) {
				$this_row = array();
				foreach($cols as $id => $col) {
					if($id != $id_col) {
						$this_row[$col->id] = $row->c[$id]->v;
					}
				}
				if(count($this_row)) {
					$results[$row->c[$id_col]->v] = $this_row;
				}
			}
			if(count($results)) {
				$file = fopen($year .'/'. $filename .'.json', 'w');
				fwrite($file, json_encode($results, JSON_PRETTY_PRINT));
				fclose($file);
				print 'Wrote '. $department . "\n";
			}
			else {
				print '-------*****No results for '. $department . "\n";
			}
		}
	}
}