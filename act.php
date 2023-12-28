<?php
if(strcasecmp($_SERVER['REQUEST_METHOD'], 'GET') == 0) {
	$username= $_GET["username"];
	$conn = mysqli_connect("dbserver.in.cs.ucy.ac.cy", "student", "gtNgMF8pZyZq6l53") or die("Could not connect: " . mysqli_error($conn)); 
	mysqli_select_db($conn , "epl425") or die ("db will not open" . mysqli_error($conn)); 
	$query = "SELECT * FROM requests WHERE username='$username' ORDER BY id DESC LIMIT 5"; 
	$result = mysqli_query($conn, $query) or die("Invalid query"); 
	$num = mysqli_num_rows($result);
	$arrayReq = array();
	for($i=0; $i<$num; $i++) {
		$row = mysqli_fetch_row($result);
		$arrayTemp=array("id"=>$row[0],"username"=>$row[1],"timestamp"=>$row[2],"address"=>$row[3],"region"=>$row[4],"city"=>$row[5]);
		array_push($arrayReq,$arrayTemp);
	}
	$jsonstr=json_encode($arrayReq);
	echo $jsonstr;
	mysqli_close($conn);
}
if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') == 0) {
	if(isset($_SERVER["CONTENT_TYPE"])) {
		$contentType = $_SERVER["CONTENT_TYPE"];
		$contentType = explode("; ", $contentType)[0];
	}
	else
		$contentType = "";
    if(strcasecmp($contentType, "application/json") == 0) {
		$json = trim(file_get_contents("php://input"));
		$data = json_decode($json);
		$username1=$data->username;
		$address1=$data->address;
		$region1=$data->region;
		$city1=$data->city;
        $timer = time();
		$conn = mysqli_connect("dbserver.in.cs.ucy.ac.cy", "student", "gtNgMF8pZyZq6l53") or die("Could not connect: " . mysqli_error($conn)); 
        $query = "INSERT INTO epl425.requests (username,timestamp,address,region,city) VALUES ('$username1', '$timer','$address1','$region1','$city1')"; 
        mysqli_query($conn, $query) or die("Invalid query"); 
    	mysqli_close($conn);
	}
}
?>

