function logOut() {
	sessionStorage.removeItem('username');
	location.href = "/index";
}