// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction

import wixData from 'wix-data';

$w.onReady(function () {
	$w("#themeDataset").onReady(() => {
		const r_m = [4,5,6,7,8,9,10,11,0,1,2,3];
		let today = new Date();
		let m = r_m[today.getMonth()];

		$w('#themeTable').selectRow(m)
		console.log("Month is",m)
	});
});
