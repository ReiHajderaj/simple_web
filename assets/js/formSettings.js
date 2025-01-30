const AccountForm = document.querySelector('#personal-info-form');
const PasswordForm = document.querySelector('#password-change-form');

AccountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.querySelector('#username');
    const email = document.querySelector('#email');
    const profilPicture = document.querySelector('#profile_picture');
    const bio = document.querySelector('#bio');

    // Get the actual file from the input
    const profilePictureFile = profilPicture.files[0];

    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append('username', username.value);
    formData.append('email', email.value);
    formData.append('picture', profilePictureFile);
    formData.append('bio', bio.value);

    // console.log(formData);


    try {
        const response = await fetch('../../api/users/updateSettings.php', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            if (response.error) {
                window.location.href = '../../auth/sign-in/';
            } else {
                // console.log(data);


                const popup = document.createElement('div');
                popup.classList.add('popup');

                if (data.status === 201) {
                    const userPlace = document.querySelector('.user_box .username');
                    userPlace.textContent = data.username;

                    if (data.image) {
                        const userPhoto = document.querySelector('.user_photo .photo img');
                        userPhoto.src = `/simple_web/assets/images/avatars/${data.image}`;
                    }

                    popup.classList.add('success');
                } else {
                    popup.classList.add('error');
                }

                popup.textContent = data.message;
                document.body.appendChild(popup);

                // Remove popup after 3 seconds
                setTimeout(() => {
                    popup.remove();
                }, 3000);
            }


        }
        else {
            const popup = document.createElement('div');
            popup.classList.add('popup', 'error');
            popup.textContent = 'An error occurred. Please try again.';
            document.body.appendChild(popup);

            setTimeout(() => {
                popup.remove();
            }, 3000);
        }
    } catch (error) {
        const popup = document.createElement('div');
        popup.classList.add('popup', 'error');
        popup.textContent = 'An error occurred. ' + error;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 3000);
    }


})

PasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPass = document.querySelector('#current-password');
    const newPass = document.querySelector('#new-password');
    const confirmPass = document.querySelector('#confirm-password');

    if (confirmPass.value == newPass.value) {
        const data = {
            current: currentPass.value,
            new: newPass.value,
        }

        try {
            const request = await fetch('../../api/users/updatePassword.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (request.ok) {
                const response = await request.json();
                if (response.error) {
                    window.location.href = '../../auth/sign-in/';
                } else {
                    const popup = document.createElement('div');
                    popup.classList.add('popup');
                    // console.log(response);
                    
                    if (response.status == 201) {
                        popup.classList.add('success');
                    } else {
                        popup.classList.add('error');
                    }

                    popup.textContent = response.message;
                    document.body.appendChild(popup);

                    // Remove popup after 3 seconds
                    setTimeout(() => {
                        popup.remove();
                    }, 3000);

                }
            }
            else {
                const popup = document.createElement('div');
                popup.classList.add('popup', 'error');
                popup.textContent = 'An error occurred. Please try again.';
                document.body.appendChild(popup);

                setTimeout(() => {
                    popup.remove();
                }, 3000);
            }
        } catch (error) {
            const popup = document.createElement('div');
            popup.classList.add('popup', 'error');
            popup.textContent = `An error occurred. ${error}`;
            document.body.appendChild(popup);

            setTimeout(() => {
                popup.remove();
            }, 3000);
        }

    } else {
        const popup = document.createElement('div');
        popup.classList.add('popup', 'error');
        popup.textContent = 'New password and confirm password do not match';
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 3000);
    }
})