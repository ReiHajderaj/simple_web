document.addEventListener('DOMContentLoaded', () => {
    isLogin();
});

const isLogin = async () => {
    try {   
        const response = await fetch('../../api/auth/isLogin.php');
        const data = await response.json();
        if(data.status) {
            window.location.href = '../../dashboard/';
        }
    } catch (error) {
        console.error(error);
    }
}