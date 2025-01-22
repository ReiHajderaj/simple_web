const AccountForm = document.querySelector('#personal-info-form');
const PasswordForm = document.querySelector('#password-change-form');

AccountForm.addEventListener('submit', async (e) =>{
    e.preventDefault();
    const username = document.querySelector('#username');
    const email = document.querySelector('#email');
    const profilPicture = document.querySelector('#profile_picture');
    const bio = document.querySelector('#bio');
    const data = {
        username: username.value,
        email: email.value,
        picture: profilPicture.value,
        bio: bio.value,
    }

    console.log(data);
    
    
})

PasswordForm.addEventListener('submit', async (e) =>{
    e.preventDefault();
    const currentPass = document.querySelector('#current-password');
    const newPass = document.querySelector('#new-password');
    const confirmPass = document.querySelector('#confirm-password');

    if(confirmPass.value == newPass.value){
        const data = {
            current: currentPass.value,
            new: newPass.value,
        }
        console.log(data);
        
    }
})