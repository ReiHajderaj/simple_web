document.addEventListener('DOMContentLoaded', async (e)=>{
    const username = document.querySelector('#username');
    const email = document.querySelector('#email');
    
    const bio = document.querySelector('#bio');
    try {

        const request = await fetch('../../api/users/getCurrentUser.php')
        if(request.ok){
            const response = await request.json();
            if(response.error){
                window.location.href = '../../auth/sign-in'
            } else{
                const data = response.message;
                username.value = data.username;
                email.value = data.email;
                bio.value = data.bio;
                
            }
        }
        
    } catch (error) {
        console.error('Setup Faluer: ', error);
        
    }
})