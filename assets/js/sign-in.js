const signInForm = document.querySelector('.sign-in-form');



signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signIn(email, password);
});

const signIn = async (email, password) => {
    const data = {
        email,
        password
    }
    try {
        const response = await fetch('../../api/auth/sign-in.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            // console.log(result);

            if (result.status === 201) {
                // sessionStorage.setItem('image', result.image);
                window.location.href = '../../dashboard';
            } else {
                displayError(result.message);
            }
        } else {
            displayError('Unable to connect to the server. Please try again later.');
        }
    } catch (error) {
        console.error(error);
        displayError('Unable to connect to the server. Please try again later.');
    }
};


// Helper function to display errors
const displayError = (message) => {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;
    signInForm.appendChild(errorMessage);

    // Remove error message after 5 seconds
    setTimeout(() => {
        errorMessage.remove();
    }, 5000);
};