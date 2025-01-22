document.addEventListener('DOMContentLoaded', () => {
    isLogin();
});

const isLogin = async () => {
    try {   
        const response = await fetch('/simple_web/api/auth/isLogin.php');
        const data = await response.json();
        
        
        if(!data.status) {
            window.location.href = '/simple_web/auth/sign-in';
        }
    } catch (error) {
        console.error(error);
    }
}